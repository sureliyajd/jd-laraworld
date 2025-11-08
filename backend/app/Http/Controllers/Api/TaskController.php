<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Http\Resources\TaskCollection;
use App\Models\Task;
use App\Models\TaskComment;
use App\Jobs\ProcessTaskUpdate;
use App\Jobs\SendTaskNotification;
use App\Events\TaskUpdated;
use App\Notifications\TaskUpdatedNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Access\AuthorizationException;

class TaskController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): TaskCollection
    {
        $user = $request->user();
        
        // Check permission to view tasks
        if (!$user->checkPermission('view all tasks') && !$user->checkPermission('view assigned tasks')) {
            throw new AuthorizationException('You do not have permission to view tasks');
        }
        
        $query = Task::with([
            'category', 
            'creator', 
            'assignee', 
            'parent', 
            'subtasks', 
            'assignments' => function ($query) {
                $query->whereNull('unassigned_at')->with('user');
            }, 
            'assignedUsers'
        ])
        ->withCount(['comments', 'attachments', 'assignments' => function ($query) {
            $query->whereNull('unassigned_at');
        }]);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        if ($request->has('parent_task_id')) {
            $query->where('parent_task_id', $request->parent_task_id);
        }

        if ($request->has('overdue') && $request->boolean('overdue')) {
            $query->overdue();
        }

        if ($request->has('due_today') && $request->boolean('due_today')) {
            $query->dueToday();
        }

        // Apply search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $allowedSortFields = ['title', 'status', 'priority', 'due_date', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        // If user can only view assigned tasks, filter by assignments
        if ($user->checkPermission('view assigned tasks') && !$user->checkPermission('view all tasks')) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('assigned_to', $user->id)
                  ->orWhereHas('assignments', function ($subQ) use ($user) {
                      $subQ->where('user_id', $user->id)
                           ->whereNull('unassigned_at');
                  });
            });
        }

        // Apply pagination
        $perPage = min($request->get('per_page', 15), 100);
        $tasks = $query->paginate($perPage);

        return new TaskCollection($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to create tasks
        if (!$user->checkPermission('create tasks')) {
            return response()->json([
                'message' => 'You do not have permission to create tasks'
            ], 403);
        }

        $this->authorize('create', Task::class);

        try {
            DB::beginTransaction();

            // Check and consume credits atomically within transaction (unless super admin)
            if (!$user->isSuperAdmin()) {
                // This will check and consume credits atomically with database lock
                if (!$user->consumeCredits('task', 1)) {
                    $effectiveUser = $user->getEffectiveUser();
                    
                    // Get fresh credit data after rollback for error message
                    DB::rollBack();
                    
                    // Get credit info after rollback (fresh data)
                    $credit = \App\Models\UserCredit::where('user_id', $effectiveUser->id)
                        ->where('module', 'task')
                        ->first();
                    
                    $available = $credit ? max(0, $credit->credits - $credit->used) : 0;
                    $totalCredits = $credit ? $credit->credits : 0;
                    
                    Log::warning('Task creation credit check failed', [
                        'user_id' => $user->id,
                        'effective_user_id' => $effectiveUser->id,
                        'available' => $available,
                        'total_credits' => $totalCredits,
                    ]);
                    
                    return response()->json([
                        'message' => 'Insufficient credits to create task',
                        'error' => "You have {$available} task credit(s) available (out of {$totalCredits} total), but need 1.",
                    ], 403);
                }
                
                Log::info('Task creation credit consumed', [
                    'user_id' => $user->id,
                    'effective_user_id' => $user->getEffectiveUser()->id,
                ]);
            }

            $taskData = $request->validated();
            $taskData['created_by'] = $user->id;

            $task = Task::create($taskData);

            // Create a system comment for task creation
            TaskComment::createSystemComment(
                $task,
                $request->user(),
                'created',
                ['title' => $task->title]
            );

            // Load relationships for response
            $task->load(['category', 'creator', 'assignee', 'parent']);

            DB::commit();

            // Dispatch job for task processing
            ProcessTaskUpdate::dispatch($task, $request->user(), ['action' => 'created']);

            Log::info('Task created', [
                'task_id' => $task->id,
                'user_id' => $request->user()->id,
                'title' => $task->title,
            ]);

            return response()->json([
                'message' => 'Task created successfully',
                'data' => new TaskResource($task),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Task creation failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'request_data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to create task',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $task->load([
            'category',
            'creator',
            'assignee',
            'parent',
            'subtasks',
            'comments.user',
            'attachments.uploader',
            'assignments' => function ($query) {
                $query->whereNull('unassigned_at')
                      ->with(['user', 'assigner']);
            },
            'assignedUsers'
        ]);

        return response()->json([
            'data' => new TaskResource($task),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $user = $request->user();
        
        // Check if specific fields are being changed that require special permissions
        $changes = $request->validated();
        
        // Check permission for status changes
        if (isset($changes['status']) && $changes['status'] !== $task->status) {
            if (!$user->can('changeStatus', $task)) {
                throw new AuthorizationException('You do not have permission to change task status');
            }
        }
        
        // Check permission for priority changes
        if (isset($changes['priority']) && $changes['priority'] !== $task->priority) {
            if (!$user->can('changePriority', $task)) {
                throw new AuthorizationException('You do not have permission to change task priority');
            }
        }
        
        // Check permission for assignment changes
        if (isset($changes['assigned_to']) && $changes['assigned_to'] !== $task->assigned_to) {
            if (!$user->checkPermission('assign tasks')) {
                throw new AuthorizationException('You do not have permission to assign tasks');
            }
            if (!$user->can('assign', $task)) {
                throw new AuthorizationException('You do not have permission to assign this task');
            }
        }
        
        // General update permission check
        $this->authorize('update', $task);

        try {
            DB::beginTransaction();

            $originalData = $task->toArray();
            $task->update($request->validated());

            // Create system comments for significant changes
            $this->createSystemCommentsForChanges($task, $request->user(), $originalData);

            // Load relationships for response
            $task->load(['category', 'creator', 'assignee', 'parent', 'assignedUsers']);

            DB::commit();

            // Get changes for broadcasting and notifications (avoid array_diff on nested arrays)
            $changes = $task->getChanges();

            // Dispatch job for task processing
            ProcessTaskUpdate::dispatch($task, $request->user(), $changes);

            // Broadcast task updated event
            broadcast(new TaskUpdated($task, $request->user(), $changes));

            // Send notifications to assigned users
            if ($task->assignedUsers->isNotEmpty()) {
                Notification::send(
                    $task->assignedUsers,
                    new TaskUpdatedNotification($task, $request->user(), $changes)
                );
            }

            Log::info('Task updated', [
                'task_id' => $task->id,
                'user_id' => $request->user()->id,
                'changes' => $changes,
            ]);

            return response()->json([
                'message' => 'Task updated successfully',
                'data' => new TaskResource($task),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Task update failed', [
                'task_id' => $task->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update task',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        try {
            $taskTitle = $task->title;
            $taskId = $task->id;
            $user = $request->user();
            
            // Get the task creator to release credits
            $taskCreator = $task->creator;

            $task->delete();

            // Release credit when task is deleted (based on task creator)
            if ($taskCreator && $taskCreator->id) {
                $taskCreator->releaseCredits('task', 1);
            }

            Log::info('Task deleted', [
                'task_id' => $taskId,
                'user_id' => $user->id,
                'title' => $taskTitle,
            ]);

            return response()->json([
                'message' => 'Task deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Task deletion failed', [
                'task_id' => $task->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete task',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get task statistics for dashboard
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to view tasks
        if (!$user->checkPermission('view all tasks') && !$user->checkPermission('view assigned tasks')) {
            return response()->json([
                'message' => 'You do not have permission to view task statistics'
            ], 403);
        }
        
        $userId = $user->id;
        $canViewAll = $user->checkPermission('view all tasks');

        // Base query - filter by permissions
        $baseQuery = Task::query();
        if (!$canViewAll) {
            $baseQuery->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('assigned_to', $user->id)
                  ->orWhereHas('assignments', function ($subQ) use ($user) {
                      $subQ->where('user_id', $user->id)
                           ->whereNull('unassigned_at');
                  });
            });
        }

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'my_tasks' => Task::where('assigned_to', $userId)->count(),
            'created_by_me' => Task::where('created_by', $userId)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'overdue' => (clone $baseQuery)->overdue()->count(),
            'due_today' => (clone $baseQuery)->dueToday()->count(),
            'by_priority' => (clone $baseQuery)->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority')
                ->toArray(),
            'by_category' => (clone $baseQuery)->join('categories', 'tasks.category_id', '=', 'categories.id')
                ->selectRaw('categories.name, COUNT(*) as count')
                ->groupBy('categories.id', 'categories.name')
                ->pluck('count', 'name')
                ->toArray(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Create system comments for task changes
     */
    private function createSystemCommentsForChanges(Task $task, $user, array $originalData): void
    {
        // Use Eloquent's tracked changes to avoid array to string conversion on nested arrays
        $changes = $task->getChanges();

        foreach ($changes as $field => $newValue) {
            $oldValue = $originalData[$field] ?? null;

            if ($field === 'status' && $oldValue !== $newValue) {
                TaskComment::createSystemComment(
                    $task,
                    $user,
                    'status_changed',
                    ['status' => $newValue, 'old_status' => $oldValue]
                );
            }

            if ($field === 'priority' && $oldValue !== $newValue) {
                TaskComment::createSystemComment(
                    $task,
                    $user,
                    'priority_changed',
                    ['priority' => $newValue, 'old_priority' => $oldValue]
                );
            }

            if ($field === 'assigned_to' && $oldValue !== $newValue) {
                $assignee = $newValue ? \App\Models\User::find($newValue) : null;
                TaskComment::createSystemComment(
                    $task,
                    $user,
                    'assigned',
                    ['assignee' => $assignee ? $assignee->name : 'Unassigned']
                );
            }

            if ($field === 'due_date' && $oldValue !== $newValue) {
                TaskComment::createSystemComment(
                    $task,
                    $user,
                    'due_date_changed',
                    ['due_date' => $newValue ? \Carbon\Carbon::parse($newValue)->format('M j, Y') : 'No due date']
                );
            }
        }
    }
}