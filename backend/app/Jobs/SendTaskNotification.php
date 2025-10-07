<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendTaskNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 30;
    public $backoff = [5, 15, 30]; // Retry after 5s, 15s, 30s

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Task $task,
        public User $user,
        public string $type,
        public array $data = []
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Processing task notification job', [
                'task_id' => $this->task->id,
                'user_id' => $this->user->id,
                'type' => $this->type,
            ]);

            // Send notification based on type
            $this->sendNotification();

            Log::info('Task notification sent successfully', [
                'task_id' => $this->task->id,
                'user_id' => $this->user->id,
                'type' => $this->type,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send task notification', [
                'task_id' => $this->task->id,
                'user_id' => $this->user->id,
                'type' => $this->type,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-throw to trigger retry mechanism
        }
    }

    /**
     * Send the appropriate notification
     */
    private function sendNotification(): void
    {
        switch ($this->type) {
            case 'assigned':
                $this->sendTaskAssignedNotification();
                break;
            case 'updated':
                $this->sendTaskUpdatedNotification();
                break;
            case 'due_soon':
                $this->sendTaskDueSoonNotification();
                break;
            case 'overdue':
                $this->sendTaskOverdueNotification();
                break;
            default:
                Log::warning('Unknown notification type', ['type' => $this->type]);
        }
    }

    /**
     * Send task assigned notification
     */
    private function sendTaskAssignedNotification(): void
    {
        // In a real application, you would use:
        // Notification::send($this->user, new TaskAssignedNotification($this->task));
        
        Log::info('Task assigned notification sent', [
            'task_id' => $this->task->id,
            'user_id' => $this->user->id,
            'task_title' => $this->task->title,
        ]);
    }

    /**
     * Send task updated notification
     */
    private function sendTaskUpdatedNotification(): void
    {
        Log::info('Task updated notification sent', [
            'task_id' => $this->task->id,
            'user_id' => $this->user->id,
            'changes' => $this->data,
        ]);
    }

    /**
     * Send task due soon notification
     */
    private function sendTaskDueSoonNotification(): void
    {
        Log::info('Task due soon notification sent', [
            'task_id' => $this->task->id,
            'user_id' => $this->user->id,
            'due_date' => $this->task->due_date,
        ]);
    }

    /**
     * Send task overdue notification
     */
    private function sendTaskOverdueNotification(): void
    {
        Log::info('Task overdue notification sent', [
            'task_id' => $this->task->id,
            'user_id' => $this->user->id,
            'due_date' => $this->task->due_date,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendTaskNotification job failed permanently', [
            'task_id' => $this->task->id,
            'user_id' => $this->user->id,
            'type' => $this->type,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
