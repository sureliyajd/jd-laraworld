<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'status_label' => ucfirst(str_replace('_', ' ', $this->status)),
            'status_color' => $this->status_color,
            'priority' => $this->priority,
            'priority_label' => ucfirst($this->priority),
            'priority_color' => $this->priority_color,
            'due_date' => $this->due_date?->toISOString(),
            'due_date_formatted' => $this->due_date?->format('M j, Y'),
            'due_date_human' => $this->due_date?->diffForHumans(),
            'completed_at' => $this->completed_at?->toISOString(),
            'completed_at_formatted' => $this->completed_at?->format('M j, Y H:i'),
            'estimated_hours' => $this->estimated_hours,
            'actual_hours' => $this->actual_hours,
            'total_estimated_hours' => $this->total_estimated_hours,
            'total_actual_hours' => $this->total_actual_hours,
            'progress_percentage' => $this->progress_percentage,
            'is_overdue' => $this->isOverdue(),
            'is_due_today' => $this->isDueToday(),
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Relationships
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                    'color' => $this->category->color,
                    'icon' => $this->category->icon,
                ];
            }),

            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email,
                ];
            }),

            'assignee' => $this->whenLoaded('assignee', function () {
                return [
                    'id' => $this->assignee->id,
                    'name' => $this->assignee->name,
                    'email' => $this->assignee->email,
                ];
            }),

            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'title' => $this->parent->title,
                    'status' => $this->parent->status,
                ];
            }),

            'subtasks' => $this->whenLoaded('subtasks', function () {
                return $this->subtasks->map(function ($subtask) {
                    return [
                        'id' => $subtask->id,
                        'title' => $subtask->title,
                        'status' => $subtask->status,
                        'priority' => $subtask->priority,
                        'due_date' => $subtask->due_date?->toISOString(),
                    ];
                });
            }),

            'comments_count' => $this->when(isset($this->comments_count), $this->comments_count),
            'attachments_count' => $this->when(isset($this->attachments_count), $this->attachments_count),
            'assignments_count' => $this->when(isset($this->assignments_count), $this->assignments_count),

            'assignments' => $this->whenLoaded('assignments', function () {
                return $this->assignments->map(function ($assignment) {
                    return [
                        'id' => $assignment->id,
                        'role' => $assignment->role,
                        'role_label' => $assignment->role_label,
                        'role_color' => $assignment->role_color,
                        'notes' => $assignment->notes,
                        'assigned_at' => $assignment->assigned_at?->toISOString(),
                        'assigned_at_formatted' => $assignment->assigned_at?->format('M j, Y H:i'),
                        'is_active' => $assignment->isActive(),
                        'user' => $assignment->user ? [
                            'id' => $assignment->user->id,
                            'name' => $assignment->user->name,
                            'email' => $assignment->user->email,
                        ] : null,
                        'assigner' => $assignment->assigner ? [
                            'id' => $assignment->assigner->id,
                            'name' => $assignment->assigner->name,
                            'email' => $assignment->assigner->email,
                        ] : null,
                    ];
                });
            }),

            'comments' => $this->whenLoaded('comments', function () {
                return TaskCommentResource::collection($this->comments);
            }),

            'attachments' => $this->whenLoaded('attachments', function () {
                return $this->attachments->map(function ($attachment) {
                    return [
                        'id' => $attachment->id,
                        'filename' => $attachment->filename,
                        'original_filename' => $attachment->original_filename,
                        'mime_type' => $attachment->mime_type,
                        'file_size' => $attachment->file_size,
                        'human_file_size' => $attachment->human_file_size,
                        'is_image' => $attachment->is_image,
                        'is_document' => $attachment->is_document,
                        'icon_class' => $attachment->icon_class,
                        'url' => $attachment->url,
                        'uploaded_by' => [
                            'id' => $attachment->uploader->id,
                            'name' => $attachment->uploader->name,
                        ],
                        'created_at' => $attachment->created_at->toISOString(),
                    ];
                });
            }),

            'assigned_users' => $this->whenLoaded('assignedUsers', function () {
                return $this->assignedUsers->map(function ($user) {
                    $assignedAt = $user->pivot->assigned_at;
                    
                    // Handle datetime conversion safely
                    if ($assignedAt) {
                        try {
                            // If it's already a Carbon instance, use it directly
                            if ($assignedAt instanceof \Carbon\Carbon) {
                                $assignedAt = $assignedAt->toISOString();
                            } else {
                                // If it's a string, parse it
                                $assignedAt = \Carbon\Carbon::parse($assignedAt)->toISOString();
                            }
                        } catch (\Exception $e) {
                            // If parsing fails, set to null
                            $assignedAt = null;
                        }
                    }
                    
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->pivot->role,
                        'assigned_at' => $assignedAt,
                    ];
                });
            }),

            // Links for API navigation
            'links' => [
                'self' => url("/api/tasks/{$this->id}"),
                'update' => url("/api/tasks/{$this->id}"),
                'delete' => url("/api/tasks/{$this->id}"),
            ],
        ];
    }
}