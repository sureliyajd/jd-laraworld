<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskCommentResource;
use App\Models\TaskComment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TaskCommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TaskComment::with(['user', 'task', 'parent', 'replies']);

        // Apply filters
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('is_system_comment')) {
            $query->where('is_system_comment', $request->boolean('is_system_comment'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $allowedSortFields = ['created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Apply pagination
        $perPage = min($request->get('per_page', 15), 100);
        $comments = $query->paginate($perPage);

        return response()->json([
            'data' => TaskCommentResource::collection($comments->items()),
            'meta' => [
                'total' => $comments->total(),
                'count' => $comments->count(),
                'per_page' => $comments->perPage(),
                'current_page' => $comments->currentPage(),
                'total_pages' => $comments->lastPage(),
                'has_more_pages' => $comments->hasMorePages(),
            ],
            'links' => [
                'first' => $comments->url(1),
                'last' => $comments->url($comments->lastPage()),
                'prev' => $comments->previousPageUrl(),
                'next' => $comments->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to view comments (required to add comments)
        if (!$user->checkPermission('view comments')) {
            return response()->json([
                'message' => 'You do not have permission to add comments'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
            'task_id' => 'required|exists:tasks,id',
            'parent_comment_id' => 'nullable|exists:task_comments,id',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $comment = TaskComment::create([
                'content' => $request->content,
                'task_id' => $request->task_id,
                'parent_comment_id' => $request->parent_comment_id,
                'user_id' => $request->user()->id,
                'metadata' => $request->metadata,
            ]);

            // Load relationships for response
            $comment->load(['user', 'task', 'parent']);

            DB::commit();

            Log::info('Task comment created', [
                'comment_id' => $comment->id,
                'user_id' => $request->user()->id,
                'task_id' => $request->task_id,
            ]);

            return response()->json([
                'message' => 'Comment added successfully',
                'data' => new TaskCommentResource($comment),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Task comment creation failed', [
                'user_id' => $request->user()->id,
                'task_id' => $request->task_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to add comment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskComment $taskComment): JsonResponse
    {
        $taskComment->load(['user', 'task', 'parent', 'replies.user']);

        return response()->json([
            'data' => new TaskCommentResource($taskComment),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaskComment $taskComment): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to manage comments
        if (!$user->checkPermission('manage comments')) {
            // If user can't manage comments, they can only edit their own comments
            if ($taskComment->user_id !== $user->id) {
                return response()->json([
                    'message' => 'You do not have permission to edit this comment'
                ], 403);
            }
        }
        
        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|required|string|max:5000',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $taskComment->update($request->only(['content', 'metadata']));

            // Load relationships for response
            $taskComment->load(['user', 'task', 'parent']);

            DB::commit();

            Log::info('Task comment updated', [
                'comment_id' => $taskComment->id,
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Comment updated successfully',
                'data' => new TaskCommentResource($taskComment),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Task comment update failed', [
                'comment_id' => $taskComment->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update comment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, TaskComment $taskComment): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to manage comments
        if (!$user->checkPermission('manage comments')) {
            // If user can't manage comments, they can only delete their own comments
            if ($taskComment->user_id !== $user->id) {
                return response()->json([
                    'message' => 'You do not have permission to delete this comment'
                ], 403);
            }
        }
        
        try {
            $commentId = $taskComment->id;
            $userId = $user->id;

            $taskComment->delete();

            Log::info('Task comment deleted', [
                'comment_id' => $commentId,
                'user_id' => $userId,
            ]);

            return response()->json([
                'message' => 'Comment deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Task comment deletion failed', [
                'comment_id' => $taskComment->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete comment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}