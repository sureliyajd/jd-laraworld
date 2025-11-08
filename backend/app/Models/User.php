<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * The default guard name for Spatie Permission package
     * This ensures all permission/role checks use the 'api' guard
     */
    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'parent_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the tasks created by the user
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /**
     * Get the tasks assigned to the user
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Get the task comments by the user
     */
    public function taskComments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    /**
     * Get the task attachments uploaded by the user
     */
    public function taskAttachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class, 'uploaded_by');
    }

    /**
     * Get the task assignments for the user
     */
    public function taskAssignments(): HasMany
    {
        return $this->hasMany(TaskAssignment::class);
    }

    /**
     * Get all tasks the user is involved with (through assignments)
     */
    public function involvedTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignments', 'user_id', 'task_id')
            ->withPivot('role', 'assigned_at', 'assigned_by', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the user's task statistics
     */
    public function getTaskStatsAttribute(): array
    {
        return [
            'created' => $this->createdTasks()->count(),
            'assigned' => $this->assignedTasks()->count(),
            'completed' => $this->assignedTasks()->where('status', 'completed')->count(),
            'pending' => $this->assignedTasks()->whereIn('status', ['pending', 'in_progress'])->count(),
            'overdue' => $this->assignedTasks()->overdue()->count(),
        ];
    }

    /**
     * Get the parent user
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * Get the child users
     */
    public function children(): HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    /**
     * Get the user's credits
     */
    public function credits(): HasMany
    {
        return $this->hasMany(UserCredit::class);
    }

    /**
     * Check if user is a super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    /**
     * Check if user has a permission (ensures roles and permissions are loaded)
     * This is a wrapper around hasPermissionTo that ensures data is loaded
     * Since we set $guard_name = 'api', we don't need to specify the guard
     */
    public function checkPermission(string $permission): bool
    {
        // Ensure roles and permissions are loaded
        if (!$this->relationLoaded('roles')) {
            $this->load('roles.permissions');
        }
        if (!$this->relationLoaded('permissions')) {
            $this->load('permissions');
        }
        
        // Use hasPermissionTo which will use the default 'api' guard
        return $this->hasPermissionTo($permission);
    }

    /**
     * Check if user is a main user (parent_id is null and not super admin)
     */
    public function isMainUser(): bool
    {
        return !$this->isSuperAdmin() && $this->parent_id === null;
    }

    /**
     * Get the effective user for credit checking (parent if exists and not super admin, otherwise self)
     */
    public function getEffectiveUser(): User
    {
        // Super admin has no constraints
        if ($this->isSuperAdmin()) {
            return $this;
        }

        // If user has a parent, check if parent is super admin
        if ($this->parent_id) {
            // Always reload parent to ensure we have the latest data
            // This is important for credit checking
            $parent = User::find($this->parent_id);
            if ($parent) {
                // If parent is super admin, user manages their own credits
                // (super admin created them but they have their own credit limits)
                if ($parent->isSuperAdmin()) {
                    return $this;
                }
                // If parent is not super admin, use parent's credits (team member)
                return $parent;
            }
            // If parent doesn't exist, fallback to self
            return $this;
        }

        // Main user (parent_id = null) manages their own credits
        return $this;
    }

    /**
     * Get credit for a specific module (does not create if doesn't exist)
     */
    public function getCredit(string $module): ?UserCredit
    {
        $effectiveUser = $this->getEffectiveUser();
        
        // Super admin has unlimited credits
        if ($effectiveUser->isSuperAdmin()) {
            return null;
        }

        // Don't create if doesn't exist - return null instead
        return UserCredit::where('user_id', $effectiveUser->id)
            ->where('module', $module)
            ->first();
    }

    /**
     * Get or create credit for a specific module (only used when setting credits)
     */
    public function getOrCreateCredit(string $module): UserCredit
    {
        $effectiveUser = $this->getEffectiveUser();
        
        return UserCredit::firstOrCreate(
            [
                'user_id' => $effectiveUser->id,
                'module' => $module,
            ],
            [
                'credits' => 0,
                'used' => 0,
            ]
        );
    }

    /**
     * Check if user has enough credits for a module
     */
    public function hasEnoughCredits(string $module, int $required = 1): bool
    {
        $effectiveUser = $this->getEffectiveUser();
        
        // Super admin has unlimited credits
        if ($effectiveUser->isSuperAdmin()) {
            return true;
        }

        // Get credit record (don't create if doesn't exist)
        $credit = $effectiveUser->getCredit($module);
        
        // If no credit record exists, user has 0 credits - insufficient
        if (!$credit) {
            return false;
        }

        // Refresh the credit record to get latest data (important for concurrent requests)
        $credit->refresh();
        
        return $credit->hasEnough($required);
    }

    /**
     * Consume credits for a module (with lock to prevent race conditions)
     * Note: This should be called within an existing transaction
     */
    public function consumeCredits(string $module, int $amount = 1): bool
    {
        $effectiveUser = $this->getEffectiveUser();
        
        // Super admin has unlimited credits - skip deduction
        if ($effectiveUser->isSuperAdmin()) {
            Log::info('Credit consumption skipped for super admin', [
                'user_id' => $this->id,
                'effective_user_id' => $effectiveUser->id,
                'module' => $module,
                'amount' => $amount,
            ]);
            return true;
        }

        // Use database lock to prevent race conditions
        // Lock the credit record for update to ensure atomicity
        $credit = UserCredit::where('user_id', $effectiveUser->id)
            ->where('module', $module)
            ->lockForUpdate()
            ->first();

        // If no credit record exists, user has 0 credits - cannot consume
        if (!$credit) {
            Log::warning('Credit consumption failed: No credit record found', [
                'user_id' => $this->id,
                'effective_user_id' => $effectiveUser->id,
                'module' => $module,
                'amount' => $amount,
            ]);
            return false;
        }

        // Store original values for logging
        $originalUsed = $credit->used;
        $originalAvailable = max(0, $credit->credits - $credit->used);

        // Calculate available credits directly from database values
        $available = max(0, $credit->credits - $credit->used);
        
        // Check if enough credits available
        if ($available >= $amount) {
            // Consume credits atomically - increment the used field
            $credit->increment('used', $amount);
            
            // Refresh to get the updated value
            $credit->refresh();
            
            Log::info('Credit consumed successfully', [
                'user_id' => $this->id,
                'effective_user_id' => $effectiveUser->id,
                'module' => $module,
                'amount' => $amount,
                'credits_before' => $credit->credits,
                'used_before' => $originalUsed,
                'available_before' => $originalAvailable,
                'used_after' => $credit->used,
                'available_after' => max(0, $credit->credits - $credit->used),
            ]);
            
            return true;
        }

        Log::warning('Credit consumption failed: Insufficient credits', [
            'user_id' => $this->id,
            'effective_user_id' => $effectiveUser->id,
            'module' => $module,
            'amount' => $amount,
            'available' => $available,
            'required' => $amount,
            'total_credits' => $credit->credits,
            'used' => $credit->used,
        ]);

        return false;
    }

    /**
     * Release credits for a module (when resource is deleted)
     */
    public function releaseCredits(string $module, int $amount = 1): void
    {
        $effectiveUser = $this->getEffectiveUser();
        
        // Super admin doesn't need to release credits
        if ($effectiveUser->isSuperAdmin()) {
            return;
        }

        $credit = $effectiveUser->getCredit($module);
        if ($credit) {
            $credit->release($amount);
        }
    }

    /**
     * Get credit statistics for the user
     */
    public function getCreditStats(): array
    {
        $effectiveUser = $this->getEffectiveUser();
        
        // Super admin has unlimited credits
        if ($effectiveUser->isSuperAdmin()) {
            return [
                'user' => ['credits' => -1, 'used' => 0, 'available' => -1],
                'email' => ['credits' => -1, 'used' => 0, 'available' => -1],
                'task' => ['credits' => -1, 'used' => 0, 'available' => -1],
            ];
        }

        $modules = ['user', 'email', 'task'];
        $stats = [];

        foreach ($modules as $module) {
            $credit = $effectiveUser->getCredit($module);
            if ($credit) {
                $stats[$module] = [
                    'credits' => $credit->credits,
                    'used' => $credit->used,
                    'available' => $credit->available,
                ];
            } else {
                // No credit record means 0 credits
                $stats[$module] = [
                    'credits' => 0,
                    'used' => 0,
                    'available' => 0,
                ];
            }
        }

        return $stats;
    }
}
