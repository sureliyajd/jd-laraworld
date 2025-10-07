<?php

namespace App\Events;

use App\Models\Task;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Task $task,
        public User $user,
        public array $changes = []
    ) {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('task.' . $this->task->id),
        ];

        // Broadcast to all assigned users
        foreach ($this->task->assignedUsers as $assignedUser) {
            $channels[] = new PrivateChannel('user.' . $assignedUser->id);
        }

        return $channels;
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'task' => [
                'id' => $this->task->id,
                'title' => $this->task->title,
                'status' => $this->task->status,
                'priority' => $this->task->priority,
                'due_date' => $this->task->due_date,
            ],
            'updated_by' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
            'changes' => $this->changes,
            'message' => "Task '{$this->task->title}' has been updated",
            'type' => 'task_updated',
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'task.updated';
    }
}
