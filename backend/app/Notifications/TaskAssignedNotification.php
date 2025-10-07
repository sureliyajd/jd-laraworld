<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class TaskAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Task $task,
        public User $assigner
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Task Assignment: ' . $this->task->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have been assigned to a new task.')
            ->line('Task: ' . $this->task->title)
            ->line('Priority: ' . ucfirst($this->task->priority))
            ->line('Status: ' . ucfirst($this->task->status))
            ->when($this->task->due_date, function ($message) {
                return $message->line('Due Date: ' . $this->task->due_date->format('M j, Y'));
            })
            ->line('Assigned by: ' . $this->assigner->name)
            ->action('View Task', url('/tasks/' . $this->task->id))
            ->line('Thank you for using our task management system!');
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'assigner_id' => $this->assigner->id,
            'assigner_name' => $this->assigner->name,
            'priority' => $this->task->priority,
            'status' => $this->task->status,
            'due_date' => $this->task->due_date?->toISOString(),
            'type' => 'task_assigned',
            'message' => "You have been assigned to task: {$this->task->title}",
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
            'assigner_id' => $this->assigner->id,
            'assigner_name' => $this->assigner->name,
            'priority' => $this->task->priority,
            'status' => $this->task->status,
            'due_date' => $this->task->due_date?->toISOString(),
            'type' => 'task_assigned',
            'message' => "You have been assigned to task: {$this->task->title}",
        ];
    }
}
