<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskAttachment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TaskAttachmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TaskAttachment::with(['uploader', 'task']);

        // Apply filters
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        if ($request->has('uploaded_by')) {
            $query->where('uploaded_by', $request->uploaded_by);
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $allowedSortFields = ['filename', 'file_size', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Apply pagination
        $perPage = min($request->get('per_page', 15), 100);
        $attachments = $query->paginate($perPage);

        return response()->json([
            'data' => $attachments->items(),
            'meta' => [
                'total' => $attachments->total(),
                'count' => $attachments->count(),
                'per_page' => $attachments->perPage(),
                'current_page' => $attachments->currentPage(),
                'total_pages' => $attachments->lastPage(),
                'has_more_pages' => $attachments->hasMorePages(),
            ],
            'links' => [
                'first' => $attachments->url(1),
                'last' => $attachments->url($attachments->lastPage()),
                'prev' => $attachments->previousPageUrl(),
                'next' => $attachments->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'task_id' => 'required|exists:tasks,id',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $file = $request->file('file');
            $originalFilename = $file->getClientOriginalName();
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('task-attachments', $filename, 'local');

            $attachment = TaskAttachment::create([
                'filename' => $filename,
                'original_filename' => $originalFilename,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'file_path' => $path,
                'disk' => 'local',
                'description' => $request->description,
                'is_public' => $request->boolean('is_public', false),
                'task_id' => $request->task_id,
                'uploaded_by' => $request->user()->id,
            ]);

            // Load relationships for response
            $attachment->load(['uploader', 'task']);

            DB::commit();

            Log::info('Task attachment created', [
                'attachment_id' => $attachment->id,
                'user_id' => $request->user()->id,
                'task_id' => $request->task_id,
                'filename' => $originalFilename,
            ]);

            return response()->json([
                'message' => 'File uploaded successfully',
                'data' => $attachment,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Task attachment creation failed', [
                'user_id' => $request->user()->id,
                'task_id' => $request->task_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to upload file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskAttachment $taskAttachment): JsonResponse
    {
        $taskAttachment->load(['uploader', 'task']);

        return response()->json([
            'data' => $taskAttachment,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaskAttachment $taskAttachment): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $taskAttachment->update($request->only(['description', 'is_public']));

            // Load relationships for response
            $taskAttachment->load(['uploader', 'task']);

            DB::commit();

            Log::info('Task attachment updated', [
                'attachment_id' => $taskAttachment->id,
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Attachment updated successfully',
                'data' => $taskAttachment,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Task attachment update failed', [
                'attachment_id' => $taskAttachment->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update attachment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskAttachment $taskAttachment): JsonResponse
    {
        try {
            $attachmentId = $taskAttachment->id;
            $filename = $taskAttachment->filename;
            $userId = auth()->id();

            // Delete the physical file
            if (Storage::disk($taskAttachment->disk)->exists($taskAttachment->file_path)) {
                Storage::disk($taskAttachment->disk)->delete($taskAttachment->file_path);
            }

            $taskAttachment->delete();

            Log::info('Task attachment deleted', [
                'attachment_id' => $attachmentId,
                'user_id' => $userId,
                'filename' => $filename,
            ]);

            return response()->json([
                'message' => 'Attachment deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Task attachment deletion failed', [
                'attachment_id' => $taskAttachment->id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete attachment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download the attachment file.
     */
    public function download(TaskAttachment $attachment): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        if (!Storage::disk($attachment->disk)->exists($attachment->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk($attachment->disk)->download(
            $attachment->file_path,
            $attachment->original_filename
        );
    }
}