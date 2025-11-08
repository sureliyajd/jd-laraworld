<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserCollection;
use App\Models\User;
use App\Models\UserCredit;
use App\Models\EmailLog;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Load user roles to check role-based filtering
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }
        
        // Check permission to view users
        if (!$user->checkPermission('view all users') && !$user->checkPermission('view users')) {
            return response()->json([
                'message' => 'You do not have permission to view users'
            ], 403);
        }

        $query = User::query();

        // Exclude super admin users from the listing
        $query->whereDoesntHave('roles', function ($q) {
            $q->where('name', 'super_admin');
        });

        // Filter users based on role and parent hierarchy
        if (!$user->checkPermission('view all users')) {
            // Check if user has visitor role
            $userRole = $user->roles->first();
            $isVisitor = $userRole && $userRole->name === 'visitor';
            
            if ($isVisitor) {
                // Visitor role users have specific filtering rules
                if ($user->parent_id === null) {
                    // Visitor user is a parent: show only users with this user's parent_id (their children)
                    $query->where('parent_id', $user->id);
                } else {
                    // Visitor user is not a parent (has a parent_id): show only their own profile
                    $query->where('id', $user->id);
                }
            } else {
                // Non-visitor users with "view users" permission: see themselves and their children
                if ($user->checkPermission('view users')) {
                    $query->where(function ($q) use ($user) {
                        $q->where('id', $user->id)
                          ->orWhere('parent_id', $user->id);
                    });
                }
            }
        }
        // If user has "view all users" permission, they see all users (no additional filtering)

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by email verification status
        if ($request->has('email_verified') && $request->email_verified !== 'all') {
            if ($request->email_verified === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->email_verified === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort fields
        $allowedSortFields = ['name', 'email', 'created_at', 'updated_at'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->get('per_page', 15), 100); // Max 100 per page
        
        $users = $query->paginate($perPage);
        
        return response()->json(new UserCollection($users));
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $creator = $request->user();
        
        // Check permission to create users
        if (!$creator->checkPermission('create users')) {
            return response()->json([
                'message' => 'You do not have permission to create users'
            ], 403);
        }
        
        $isSuperAdmin = $creator->isSuperAdmin();

        try {
            DB::beginTransaction();

            // Check and consume credits atomically within transaction (unless super admin)
            // IMPORTANT: Credit check and consumption MUST happen BEFORE user creation
            // to ensure credits are deducted for all non-super-admin users
            if (!$isSuperAdmin) {
                // Get effective user before consumption for logging
                $effectiveUser = $creator->getEffectiveUser();
                
                // Get credit info before consumption for logging
                $creditBefore = UserCredit::where('user_id', $effectiveUser->id)
                    ->where('module', 'user')
                    ->first();
                
                $availableBefore = $creditBefore ? max(0, $creditBefore->credits - $creditBefore->used) : 0;
                
                Log::info('Checking credits before user creation', [
                    'creator_id' => $creator->id,
                    'creator_email' => $creator->email,
                    'creator_parent_id' => $creator->parent_id,
                    'creator_is_super_admin' => $creator->isSuperAdmin(),
                    'effective_user_id' => $effectiveUser->id,
                    'effective_user_email' => $effectiveUser->email,
                    'effective_user_is_super_admin' => $effectiveUser->isSuperAdmin(),
                    'available_credits' => $availableBefore,
                    'total_credits' => $creditBefore ? $creditBefore->credits : 0,
                    'used_credits' => $creditBefore ? $creditBefore->used : 0,
                ]);
                
                // This will check and consume credits atomically with database lock
                if (!$creator->consumeCredits('user', 1)) {
                    // Get fresh credit data after rollback for error message
                    DB::rollBack();
                    
                    // Get credit info after rollback (fresh data)
                    $credit = UserCredit::where('user_id', $effectiveUser->id)
                        ->where('module', 'user')
                        ->first();
                    
                    $available = $credit ? max(0, $credit->credits - $credit->used) : 0;
                    $totalCredits = $credit ? $credit->credits : 0;
                    $usedCredits = $credit ? $credit->used : 0;
                    
                    Log::warning('User creation credit check failed - user creation blocked', [
                        'creator_id' => $creator->id,
                        'creator_email' => $creator->email,
                        'effective_user_id' => $effectiveUser->id,
                        'effective_user_email' => $effectiveUser->email,
                        'available' => $available,
                        'total_credits' => $totalCredits,
                        'used_credits' => $usedCredits,
                        'parent_id' => $creator->parent_id,
                    ]);
                    
                    return response()->json([
                        'message' => 'Insufficient credits to create user',
                        'error' => "You have {$available} user credit(s) available (out of {$totalCredits} total), but need 1.",
                    ], 403);
                }
                
                // Verify credit was actually consumed after successful consumption
                $creditAfter = UserCredit::where('user_id', $effectiveUser->id)
                    ->where('module', 'user')
                    ->lockForUpdate()
                    ->first();
                
                $availableAfter = $creditAfter ? max(0, $creditAfter->credits - $creditAfter->used) : 0;
                
                Log::info('User creation credit consumed successfully', [
                    'creator_id' => $creator->id,
                    'creator_email' => $creator->email,
                    'effective_user_id' => $effectiveUser->id,
                    'effective_user_email' => $effectiveUser->email,
                    'credits_before' => $creditBefore ? $creditBefore->credits : 0,
                    'used_before' => $creditBefore ? $creditBefore->used : 0,
                    'available_before' => $availableBefore,
                    'credits_after' => $creditAfter ? $creditAfter->credits : 0,
                    'used_after' => $creditAfter ? $creditAfter->used : 0,
                    'available_after' => $availableAfter,
                    'credit_deducted' => ($creditBefore ? $creditBefore->used : 0) < ($creditAfter ? $creditAfter->used : 0),
                ]);
            } else {
                Log::info('User creation by super admin - credits not checked', [
                    'creator_id' => $creator->id,
                    'creator_email' => $creator->email,
                ]);
            }

            // Determine parent_id based on creator
            $parentId = null;
            if ($isSuperAdmin) {
                // Super admin: set parent_id to super admin's ID (so all users created by super admin are under them)
                $parentId = $creator->id;
            } else {
                // Non-super admin users: set parent_id to creator's effective user
                // If creator is a main user (parent_id = null), new user's parent_id = creator's id
                // If creator is a team member (parent_id != null), new user's parent_id = creator's effective user's id
                $effectiveUser = $creator->getEffectiveUser();
                $parentId = $effectiveUser->id;
            }

            // Create the user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'parent_id' => $parentId,
            ]);

            // Assign role (default to 'visitor' if not provided)
            $roleName = $request->input('role', 'visitor');
            // Prevent assigning super_admin role
            if ($roleName !== 'super_admin') {
                // Since User model has $guard_name = 'api', we can use assignRole with role name
                $role = Role::where('name', $roleName)->where('guard_name', 'api')->first();
                if ($role) {
                    $user->assignRole($role);
                } else {
                    // Fallback to visitor if role doesn't exist
                    $visitorRole = Role::where('name', 'visitor')->where('guard_name', 'api')->first();
                    if ($visitorRole) {
                        $user->assignRole($visitorRole);
                    }
                }
            }

            // Set credits if provided by super admin and role is visitor
            if ($isSuperAdmin && $request->has('credits') && $roleName === 'visitor') {
                $credits = $request->input('credits', []);
                $modules = ['user', 'email', 'task'];
                
                foreach ($modules as $module) {
                    if (isset($credits[$module])) {
                        // Use updateOrCreate to set credits for the new user
                        UserCredit::updateOrCreate(
                            [
                                'user_id' => $user->id,
                                'module' => $module,
                            ],
                            [
                                'credits' => (int) $credits[$module],
                                'used' => 0,
                            ]
                        );
                    }
                }
            } elseif (!$isSuperAdmin && $roleName === 'visitor') {
                // If non-super admin creates a visitor user, ensure the new user has 0 credits
                // Credits should be managed by the parent (effective user)
                // Don't create credit records for the new user - they'll use parent's credits
            }

            // Credit already consumed above in the atomic check (for non-super-admin users)
            // At this point, if we're here and the creator is not super admin, 
            // the credit has been successfully consumed within the transaction

            DB::commit();

            // Log successful user creation with credit information
            if (!$isSuperAdmin) {
                $finalEffectiveUser = $creator->getEffectiveUser();
                $finalCredit = UserCredit::where('user_id', $finalEffectiveUser->id)
                    ->where('module', 'user')
                    ->first();
                
                Log::info('User created successfully - credit transaction committed', [
                    'creator_id' => $creator->id,
                    'creator_email' => $creator->email,
                    'new_user_id' => $user->id,
                    'new_user_email' => $user->email,
                    'effective_user_id' => $finalEffectiveUser->id,
                    'final_available_credits' => $finalCredit ? max(0, $finalCredit->credits - $finalCredit->used) : 0,
                    'final_used_credits' => $finalCredit ? $finalCredit->used : 0,
                ]);
            }

            return response()->json([
                'data' => new UserResource($user->load(['roles', 'credits', 'permissions'])),
                'message' => 'User created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        
        // Load user roles to check role-based filtering
        if (!$currentUser->relationLoaded('roles')) {
            $currentUser->load('roles');
        }
        
        // Check permission to view users
        if (!$currentUser->checkPermission('view all users') && !$currentUser->checkPermission('view users')) {
            return response()->json([
                'message' => 'You do not have permission to view users'
            ], 403);
        }
        
        // Filter based on role and parent hierarchy
        if (!$currentUser->checkPermission('view all users')) {
            // Check if user has visitor role
            $userRole = $currentUser->roles->first();
            $isVisitor = $userRole && $userRole->name === 'visitor';
            
            if ($isVisitor) {
                // Visitor role users have specific viewing rules
                if ($currentUser->parent_id === null) {
                    // Visitor user is a parent: can only view users with this user's parent_id (their children)
                    if ($user->parent_id !== $currentUser->id) {
                        return response()->json([
                            'message' => 'You do not have permission to view this user'
                        ], 403);
                    }
                } else {
                    // Visitor user is not a parent (has a parent_id): can only view their own profile
                    if ($user->id !== $currentUser->id) {
                        return response()->json([
                            'message' => 'You do not have permission to view this user'
                        ], 403);
                    }
                }
            } else {
                // Non-visitor users with "view users" permission: can view themselves or their children
                if ($currentUser->checkPermission('view users')) {
                    if ($user->id !== $currentUser->id && $user->parent_id !== $currentUser->id) {
                        return response()->json([
                            'message' => 'You do not have permission to view this user'
                        ], 403);
                    }
                }
            }
        }
        
        return response()->json([
            'data' => new UserResource($user->load(['roles', 'credits', 'permissions']))
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        
        // Check permission to edit users
        if (!$currentUser->checkPermission('edit users')) {
            return response()->json([
                'message' => 'You do not have permission to edit users'
            ], 403);
        }
        
        // Load user roles to check role-based filtering
        if (!$currentUser->relationLoaded('roles')) {
            $currentUser->load('roles');
        }
        
        // Filter based on role and parent hierarchy for editing
        if (!$currentUser->checkPermission('view all users')) {
            // Check if user has visitor role
            $userRole = $currentUser->roles->first();
            $isVisitor = $userRole && $userRole->name === 'visitor';
            
            if ($isVisitor) {
                // Visitor role users have specific editing rules
                if ($currentUser->parent_id === null) {
                    // Visitor user is a parent: can only edit users with this user's parent_id (their children)
                    if ($user->parent_id !== $currentUser->id) {
                        return response()->json([
                            'message' => 'You do not have permission to edit this user'
                        ], 403);
                    }
                } else {
                    // Visitor user is not a parent (has a parent_id): can only edit their own profile
                    if ($user->id !== $currentUser->id) {
                        return response()->json([
                            'message' => 'You do not have permission to edit this user'
                        ], 403);
                    }
                }
            } else {
                // Non-visitor users: can edit themselves or their children
                $canEdit = $user->id === $currentUser->id || $user->parent_id === $currentUser->id;
                
                if (!$canEdit) {
                    return response()->json([
                        'message' => 'You do not have permission to edit this user'
                    ], 403);
                }
            }
        }
        
        $isSuperAdmin = $currentUser->isSuperAdmin();

        try {
            DB::beginTransaction();

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            // Only update password if provided
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            // Handle role update (only if super admin and user is not super admin)
            if ($isSuperAdmin && !$user->isSuperAdmin() && $request->has('role')) {
                $roleName = $request->input('role');
                // Prevent assigning super_admin role
                if ($roleName && $roleName !== 'super_admin') {
                    // Since User model has $guard_name = 'api', roles will use api guard
                    $role = Role::where('name', $roleName)->where('guard_name', 'api')->first();
                    if ($role) {
                        $user->syncRoles([$role]);
                    }
                } elseif ($roleName === null || $roleName === '') {
                    // If role is cleared, assign visitor role
                    $visitorRole = Role::where('name', 'visitor')->where('guard_name', 'api')->first();
                    if ($visitorRole) {
                        $user->syncRoles([$visitorRole]);
                    }
                }
            }

            // Handle credits update (only if super admin, role is visitor, and credits are provided)
            $userRole = $user->roles->first();
            $isVisitor = $userRole && $userRole->name === 'visitor';

            if ($isSuperAdmin && $isVisitor && $request->has('credits')) {
                $credits = $request->input('credits', []);
                $modules = ['user', 'email', 'task'];
                
                foreach ($modules as $module) {
                    if (isset($credits[$module])) {
                        UserCredit::updateOrCreate(
                            [
                                'user_id' => $user->id,
                                'module' => $module,
                            ],
                            [
                                'credits' => (int) $credits[$module],
                                // Keep existing used value, only update credits
                            ]
                        );
                    }
                }
            }

            DB::commit();

            return response()->json([
                'data' => new UserResource($user->load(['roles', 'credits', 'permissions'])),
                'message' => 'User updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        
        // Check permission to delete users
        if (!$currentUser->checkPermission('delete users')) {
            return response()->json([
                'message' => 'You do not have permission to delete users'
            ], 403);
        }
        
        // Prevent deletion of the current authenticated user
        if ($user->id === $currentUser->id) {
            return response()->json([
                'error' => 'You cannot delete your own account'
            ], 403);
        }
        
        // Load user roles to check role-based filtering
        if (!$currentUser->relationLoaded('roles')) {
            $currentUser->load('roles');
        }
        
        // Filter based on role and parent hierarchy for deletion
        if (!$currentUser->checkPermission('view all users')) {
            // Check if user has visitor role
            $userRole = $currentUser->roles->first();
            $isVisitor = $userRole && $userRole->name === 'visitor';
            
            if ($isVisitor) {
                // Visitor role users have specific deletion rules
                if ($currentUser->parent_id === null) {
                    // Visitor user is a parent: can only delete users with this user's parent_id (their children)
                    if ($user->parent_id !== $currentUser->id) {
                        return response()->json([
                            'message' => 'You do not have permission to delete this user'
                        ], 403);
                    }
                } else {
                    // Visitor user is not a parent (has a parent_id): cannot delete anyone
                    // (they can only see themselves and cannot delete themselves per check above)
                    return response()->json([
                        'message' => 'You do not have permission to delete this user'
                    ], 403);
                }
            } else {
                // Non-visitor users: can delete their children
                $canDelete = $user->parent_id === $currentUser->id;
                
                if (!$canDelete) {
                    return response()->json([
                        'message' => 'You do not have permission to delete this user'
                    ], 403);
                }
            }
        }

        try {
            // Release user credit to parent if user has a parent (and parent is not super admin)
            if ($user->parent_id) {
                $parent = $user->parent;
                if ($parent && !$parent->isSuperAdmin()) {
                    $parent->releaseCredits('user', 1);
                }
            }

            // Release credits for tasks and emails created by this user
            // Determine the effective user for credit release (parent if exists, otherwise the user themselves)
            $effectiveUser = $user;
            if ($user->parent_id) {
                $effectiveUser = $user->parent ?? $user;
            }
            
            // Only release credits if effective user is not super admin
            if (!$effectiveUser->isSuperAdmin()) {
                $taskCount = $user->createdTasks()->count();
                $emailCount = EmailLog::where('sent_by', $user->id)->where('status', 'sent')->count();
                
                if ($taskCount > 0) {
                    $effectiveUser->releaseCredits('task', $taskCount);
                }
                
                if ($emailCount > 0) {
                    $effectiveUser->releaseCredits('email', $emailCount);
                }
            }

            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to view users
        if (!$user->checkPermission('view all users') && !$user->checkPermission('view users')) {
            return response()->json([
                'message' => 'You do not have permission to view user statistics'
            ], 403);
        }
        
        // Exclude super admin from statistics
        $baseQuery = User::whereDoesntHave('roles', function ($q) {
            $q->where('name', 'super_admin');
        });
        
        // Load user roles to check role-based filtering
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }
        
        // If user can only view their own users, filter by parent hierarchy
        if ($user->checkPermission('view users') && !$user->checkPermission('view all users')) {
            // Check if user has visitor role
            $userRole = $user->roles->first();
            $isVisitor = $userRole && $userRole->name === 'visitor';
            
            if ($isVisitor) {
                // Visitor role users have specific filtering rules
                if ($user->parent_id === null) {
                    // Visitor user is a parent: show only users with this user's parent_id (their children)
                    $baseQuery->where('parent_id', $user->id);
                } else {
                    // Visitor user is not a parent (has a parent_id): show only their own profile
                    $baseQuery->where('id', $user->id);
                }
            } else {
                // Non-visitor users with "view users" permission: see themselves and their children
                $baseQuery->where(function ($q) use ($user) {
                    $q->where('id', $user->id)
                      ->orWhere('parent_id', $user->id);
                });
            }
        }

        $totalUsers = (clone $baseQuery)->count();
        $verifiedUsers = (clone $baseQuery)->whereNotNull('email_verified_at')->count();
        $unverifiedUsers = (clone $baseQuery)->whereNull('email_verified_at')->count();
        
        // Recent users (last 30 days)
        $recentUsers = (clone $baseQuery)->where('created_at', '>=', now()->subDays(30))->count();
        
        // Users with tasks
        $usersWithTasks = (clone $baseQuery)->where(function ($q) {
            $q->whereHas('createdTasks')->orWhereHas('assignedTasks');
        })->count();
        
        // Most active users (by created tasks)
        $mostActiveUsers = (clone $baseQuery)->withCount('createdTasks')
            ->orderBy('created_tasks_count', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_tasks_count']);

        return response()->json([
            'data' => [
                'total_users' => $totalUsers,
                'verified_users' => $verifiedUsers,
                'unverified_users' => $unverifiedUsers,
                'recent_users' => $recentUsers,
                'users_with_tasks' => $usersWithTasks,
                'most_active_users' => $mostActiveUsers,
            ]
        ]);
    }

    /**
     * Get all users for dropdown/select purposes
     */
    public function all(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to view users
        if (!$user->checkPermission('view all users') && !$user->checkPermission('view users')) {
            return response()->json([
                'message' => 'You do not have permission to view users'
            ], 403);
        }
        
        $query = User::select('id', 'name', 'email')
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super_admin');
            });
        
        // Apply filtering based on permissions
        if (!$user->checkPermission('view all users')) {
            // Load user roles to check role-based filtering
            if (!$user->relationLoaded('roles')) {
                $user->load('roles');
            }
            
            // Check if user has visitor role
            $userRole = $user->roles->first();
            $isVisitor = $userRole && $userRole->name === 'visitor';
            
            if ($isVisitor) {
                // Visitor role users have specific filtering rules
                if ($user->parent_id === null) {
                    // Visitor user is a parent: show only users with this user's parent_id (their children)
                    $query->where('parent_id', $user->id);
                } else {
                    // Visitor user is not a parent (has a parent_id): show only their own profile
                    $query->where('id', $user->id);
                }
            } else {
                // Non-visitor users with "view users" permission: see themselves and their children
                if ($user->checkPermission('view users')) {
                    $query->where(function ($q) use ($user) {
                        $q->where('id', $user->id)
                          ->orWhere('parent_id', $user->id);
                    });
                }
            }
        }
        
        $users = $query->orderBy('name')->get();

        return response()->json([
            'data' => $users
        ]);
    }

    /**
     * Get all available roles (excluding super_admin)
     */
    public function roles(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to view roles
        if (!$user->checkPermission('view roles') && !$user->checkPermission('assign roles')) {
            return response()->json([
                'message' => 'You do not have permission to view roles'
            ], 403);
        }
        
        $roles = Role::where('guard_name', 'api')
            ->where('name', '!=', 'super_admin')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $roles
        ]);
    }
}
