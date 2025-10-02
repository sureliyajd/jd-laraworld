<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskCommentResource extends JsonResource
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
            'content' => $this->content,
            'formatted_content' => $this->formatted_content,
            'is_system_comment' => $this->is_system_comment,
            'metadata' => $this->metadata,
            'author_name' => $this->author_name,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // User relationship (when loaded)
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),

            // Task relationship (when loaded)
            'task' => $this->whenLoaded('task', function () {
                return [
                    'id' => $this->task->id,
                    'title' => $this->task->title,
                ];
            }),

            // Parent comment relationship (when loaded)
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'content' => $this->parent->content,
                    'author_name' => $this->parent->author_name,
                    'created_at' => $this->parent->created_at->toISOString(),
                ];
            }),

            // Replies relationship (when loaded)
            'replies' => $this->whenLoaded('replies', function () {
                return TaskCommentResource::collection($this->replies);
            }),

            // Links for API navigation
            'links' => [
                'self' => url("/api/task-comments/{$this->id}"),
                'update' => url("/api/task-comments/{$this->id}"),
                'delete' => url("/api/task-comments/{$this->id}"),
            ],
        ];
    }
}