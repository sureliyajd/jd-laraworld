<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'color' => $this->color,
            'icon' => $this->icon,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'tasks_count' => $this->when(isset($this->tasks_count), $this->tasks_count),
            'completed_tasks_count' => $this->when(isset($this->completed_tasks_count), $this->completed_tasks_count),
            'pending_tasks_count' => $this->when(isset($this->pending_tasks_count), $this->pending_tasks_count),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Tasks relationship (when loaded)
            'tasks' => $this->whenLoaded('tasks', function () {
                return $this->tasks->map(function ($task) {
                    return [
                        'id' => $task->id,
                        'title' => $task->title,
                        'status' => $task->status,
                        'priority' => $task->priority,
                        'due_date' => $task->due_date?->toISOString(),
                    ];
                });
            }),

            // Links for API navigation
            'links' => [
                'self' => url("/api/categories/{$this->id}"),
                'update' => url("/api/categories/{$this->id}"),
                'delete' => url("/api/categories/{$this->id}"),
            ],
        ];
    }
}