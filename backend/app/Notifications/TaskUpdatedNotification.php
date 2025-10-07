<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class TaskUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Task $task,
        public User $updatedBy,
        public array $changes = []
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'updated_by_id' => $this->updatedBy->id,
            'updated_by_name' => $this->updatedBy->name,
            'changes' => $this->changes,
            'type' => 'task_updated',
            'message' => "Task '{$this->task->title}' has been updated by {$this->updatedBy->name}",
        ];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'updated_by_id' => $this->updatedBy->id,
            'updated_by_name' => $this->updatedBy->name,
            'changes' => $this->changes,
            'type' => 'task_updated',
            'message' => "Task '{$this->task->title}' has been updated by {$this->updatedBy->name}",
        ];
    }
}
