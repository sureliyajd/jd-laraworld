<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskAssignmentResource extends JsonResource
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
            'role' => $this->role,
            'role_label' => $this->role_label,
            'role_color' => $this->role_color,
            'notes' => $this->notes,
            'assigned_at' => $this->assigned_at?->toISOString(),
            'assigned_at_formatted' => $this->assigned_at?->format('M j, Y H:i'),
            'unassigned_at' => $this->unassigned_at?->toISOString(),
            'duration' => $this->duration,
            'human_duration' => $this->human_duration,
            'is_active' => $this->isActive(),

            // Relationships
            'task' => $this->whenLoaded('task', function () {
                return [
                    'id' => $this->task->id,
                    'title' => $this->task->title,
                    'status' => $this->task->status,
                    'priority' => $this->task->priority,
                    'due_date' => $this->task->due_date?->toISOString(),
                    'due_date_formatted' => $this->task->due_date?->format('M j, Y'),
                ];
            }),

            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),

            'assigner' => $this->whenLoaded('assigner', function () {
                return [
                    'id' => $this->assigner->id,
                    'name' => $this->assigner->name,
                    'email' => $this->assigner->email,
                ];
            }),

            // Links for API navigation
            'links' => [
                'self' => url("/api/task-assignments/{$this->id}"),
                'update' => url("/api/task-assignments/{$this->id}"),
                'delete' => url("/api/task-assignments/{$this->id}"),
                'task' => url("/api/tasks/{$this->task_id}"),
                'user' => url("/api/users/{$this->user_id}"),
            ],
        ];
    }
}
