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

class TaskController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): TaskCollection
    {
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
        $this->authorize('create', Task::class);

        try {
            DB::beginTransaction();

            $taskData = $request->validated();
            $taskData['created_by'] = $request->user()->id;
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
            $userId = $request->user()->id;

            $task->delete();

            Log::info('Task deleted', [
                'task_id' => $taskId,
                'user_id' => $userId,
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
        $userId = $request->user()->id;

        $stats = [
            'total' => Task::count(),
            'my_tasks' => Task::where('assigned_to', $userId)->count(),
            'created_by_me' => Task::where('created_by', $userId)->count(),
            'pending' => Task::where('status', 'pending')->count(),
            'in_progress' => Task::where('status', 'in_progress')->count(),
            'completed' => Task::where('status', 'completed')->count(),
            'overdue' => Task::overdue()->count(),
            'due_today' => Task::dueToday()->count(),
            'by_priority' => Task::selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority')
                ->toArray(),
            'by_category' => Task::join('categories', 'tasks.category_id', '=', 'categories.id')
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