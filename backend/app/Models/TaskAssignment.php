<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'role',
        'assigned_at',
        'unassigned_at',
        'notes',
        'task_id',
        'user_id',
        'assigned_by',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'unassigned_at' => 'datetime',
    ];

    /**
     * Get the task that owns the assignment
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user assigned to the task
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who made the assignment
     */
    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Scope to get only active assignments (not unassigned)
     */
    public function scopeActive($query)
    {
        return $query->whereNull('unassigned_at');
    }

    /**
     * Scope to get assignments by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope to get assignments for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get assignments for a specific task
     */
    public function scopeForTask($query, $taskId)
    {
        return $query->where('task_id', $taskId);
    }

    /**
     * Check if the assignment is active
     */
    public function isActive(): bool
    {
        return is_null($this->unassigned_at);
    }

    /**
     * Unassign the user from the task
     */
    public function unassign(): bool
    {
        return $this->update(['unassigned_at' => now()]);
    }

    /**
     * Get the role color for UI
     */
    public function getRoleColorAttribute(): string
    {
        return match ($this->role) {
            'assignee' => 'blue',
            'collaborator' => 'green',
            'watcher' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get the role label for UI
     */
    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            'assignee' => 'Assigned',
            'collaborator' => 'Collaborator',
            'watcher' => 'Watcher',
            default => 'Unknown',
        };
    }

    /**
     * Get the duration of the assignment
     */
    public function getDurationAttribute(): ?int
    {
        if (!$this->assigned_at) {
            return null;
        }

        $endTime = $this->unassigned_at ?? now();
        return $this->assigned_at->diffInHours($endTime);
    }

    /**
     * Get the duration in human readable format
     */
    public function getHumanDurationAttribute(): string
    {
        $duration = $this->duration;

        if (!$duration) {
            return 'Unknown';
        }

        if ($duration < 24) {
            return $duration . ' hours';
        }

        $days = floor($duration / 24);
        $hours = $duration % 24;

        if ($hours === 0) {
            return $days . ' day' . ($days > 1 ? 's' : '');
        }

        return $days . ' day' . ($days > 1 ? 's' : '') . ' and ' . $hours . ' hour' . ($hours > 1 ? 's' : '');
    }
}