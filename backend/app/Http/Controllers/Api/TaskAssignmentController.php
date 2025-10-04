<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskAssignmentResource;
use App\Models\TaskAssignment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TaskAssignmentController extends Controller
{
    /**
     * Display a listing of task assignments.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TaskAssignment::with(['task', 'user', 'assigner']);

        // Filter by task ID
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        // Filter by user ID
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by active assignments only
        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'assigned_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $query->orderBy($sortBy, $sortOrder);

        $assignments = $query->get();

        return response()->json([
            'data' => TaskAssignmentResource::collection($assignments)
        ]);
    }

    /**
     * Store a newly created assignment.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:assignee,collaborator,watcher',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if assignment already exists (active or inactive)
        $existingAssignment = TaskAssignment::where('task_id', $request->task_id)
            ->where('user_id', $request->user_id)
            ->where('role', $request->role)
            ->first();

        if ($existingAssignment) {
            if ($existingAssignment->isActive()) {
                return response()->json([
                    'error' => 'User is already assigned to this task with this role'
                ], 409);
            } else {
                // Reactivate the existing assignment
                $existingAssignment->update([
                    'notes' => $request->notes,
                    'assigned_by' => $request->user()->id,
                    'assigned_at' => now(),
                    'unassigned_at' => null,
                ]);
                $assignment = $existingAssignment;
            }
        } else {
            // Create new assignment
            $assignment = TaskAssignment::create([
                'task_id' => $request->task_id,
                'user_id' => $request->user_id,
                'role' => $request->role,
                'notes' => $request->notes,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);
        }

        return response()->json([
            'data' => new TaskAssignmentResource($assignment->load(['task', 'user', 'assigner'])),
            'message' => 'User assigned to task successfully'
        ], 201);
    }

    /**
     * Display the specified assignment.
     */
    public function show(TaskAssignment $taskAssignment): JsonResponse
    {
        return response()->json([
            'data' => new TaskAssignmentResource($taskAssignment->load(['task', 'user', 'assigner']))
        ]);
    }

    /**
     * Update the specified assignment.
     */
    public function update(Request $request, TaskAssignment $taskAssignment): JsonResponse
    {
        $request->validate([
            'role' => 'sometimes|in:assignee,collaborator,watcher',
            'notes' => 'nullable|string|max:1000',
        ]);

        // If role is being updated, check for conflicts
        if ($request->has('role') && $request->role !== $taskAssignment->role) {
            $existingAssignment = TaskAssignment::where('task_id', $taskAssignment->task_id)
                ->where('user_id', $taskAssignment->user_id)
                ->where('role', $request->role)
                ->where('id', '!=', $taskAssignment->id)
                ->active()
                ->first();

            if ($existingAssignment) {
                return response()->json([
                    'error' => 'User already has an active assignment with this role for this task'
                ], 409);
            }
        }

        $taskAssignment->update($request->only(['role', 'notes']));

        return response()->json([
            'data' => new TaskAssignmentResource($taskAssignment->load(['task', 'user', 'assigner'])),
            'message' => 'Assignment updated successfully'
        ]);
    }

    /**
     * Remove the specified assignment (unassign user).
     */
    public function destroy(TaskAssignment $taskAssignment): JsonResponse
    {
        if (!$taskAssignment->isActive()) {
            return response()->json([
                'error' => 'Assignment is already inactive'
            ], 409);
        }

        $taskAssignment->unassign();

        return response()->json([
            'message' => 'User unassigned from task successfully'
        ]);
    }

    /**
     * Assign multiple users to a task
     */
    public function bulkAssign(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'assignments' => 'required|array|min:1',
            'assignments.*.user_id' => 'required|exists:users,id',
            'assignments.*.role' => 'required|in:assignee,collaborator,watcher',
            'assignments.*.notes' => 'nullable|string|max:1000',
        ]);

        $results = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($request->assignments as $assignmentData) {
                // Check if assignment already exists (active or inactive)
                $existingAssignment = TaskAssignment::where('task_id', $request->task_id)
                    ->where('user_id', $assignmentData['user_id'])
                    ->where('role', $assignmentData['role'])
                    ->first();

                if ($existingAssignment) {
                    if ($existingAssignment->isActive()) {
                        $errors[] = "User ID {$assignmentData['user_id']} is already assigned to this task with this role";
                        continue;
                    } else {
                        // Reactivate the existing assignment
                        $existingAssignment->update([
                            'notes' => $assignmentData['notes'] ?? null,
                            'assigned_by' => $request->user()->id,
                            'assigned_at' => now(),
                            'unassigned_at' => null,
                        ]);
                        $assignment = $existingAssignment;
                    }
                } else {
                    // Create new assignment
                    $assignment = TaskAssignment::create([
                        'task_id' => $request->task_id,
                        'user_id' => $assignmentData['user_id'],
                        'role' => $assignmentData['role'],
                        'notes' => $assignmentData['notes'] ?? null,
                        'assigned_by' => $request->user()->id,
                        'assigned_at' => now(),
                    ]);
                }

                $results[] = new TaskAssignmentResource($assignment->load(['task', 'user', 'assigner']));
            }

            DB::commit();

            return response()->json([
                'data' => $results,
                'errors' => $errors,
                'message' => count($results) > 0 ? 'Users assigned successfully' : 'No users were assigned',
            ], count($results) > 0 ? 201 : 400);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to assign users to task'
            ], 500);
        }
    }

    /**
     * Get assignments for a specific task
     */
    public function getTaskAssignments(Task $task): JsonResponse
    {
        $assignments = TaskAssignment::where('task_id', $task->id)
            ->active()
            ->with(['user', 'assigner'])
            ->orderBy('assigned_at', 'desc')
            ->get();

        return response()->json([
            'data' => TaskAssignmentResource::collection($assignments)
        ]);
    }

    /**
     * Get assignments for a specific user
     */
    public function getUserAssignments(User $user): JsonResponse
    {
        $assignments = TaskAssignment::where('user_id', $user->id)
            ->active()
            ->with(['task.category', 'task.creator', 'assigner'])
            ->orderBy('assigned_at', 'desc')
            ->get();

        return response()->json([
            'data' => TaskAssignmentResource::collection($assignments)
        ]);
    }

    /**
     * Get assignment statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_assignments' => TaskAssignment::active()->count(),
            'assignments_by_role' => TaskAssignment::active()
                ->selectRaw('role, count(*) as count')
                ->groupBy('role')
                ->get()
                ->pluck('count', 'role'),
            'recent_assignments' => TaskAssignment::active()
                ->where('assigned_at', '>=', now()->subDays(7))
                ->count(),
            'most_assigned_users' => TaskAssignment::active()
                ->withCount('user')
                ->with('user:id,name,email')
                ->groupBy('user_id')
                ->orderBy('user_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($assignment) {
                    return [
                        'user' => [
                            'id' => $assignment->user->id,
                            'name' => $assignment->user->name,
                            'email' => $assignment->user->email,
                        ],
                        'assignments_count' => $assignment->user_count,
                    ];
                }),
        ];

        return response()->json([
            'data' => $stats
        ]);
    }
}
