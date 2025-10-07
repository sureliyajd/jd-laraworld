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
use Illuminate\Support\Facades\Mail;

class SendTaskAssignedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 30;
    public $backoff = [10, 30, 60]; // Retry after 10s, 30s, 60s

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Task $task,
        public User $assignedUser,
        public User $assigner
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Processing SendTaskAssignedEmail job', [
                'task_id' => $this->task->id,
                'assigned_user_id' => $this->assignedUser->id,
                'assigner_id' => $this->assigner->id,
            ]);

            // Simulate email sending (in a real app, you'd use Mail::send)
            $this->simulateEmailSending();

            Log::info('Task assignment email sent successfully', [
                'task_id' => $this->task->id,
                'assigned_user_id' => $this->assignedUser->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send task assignment email', [
                'task_id' => $this->task->id,
                'assigned_user_id' => $this->assignedUser->id,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-throw to trigger retry mechanism
        }
    }

    /**
     * Simulate email sending with some processing time
     */
    private function simulateEmailSending(): void
    {
        // Simulate email processing time
        sleep(2);

        // In a real application, you would use:
        // Mail::to($this->assignedUser->email)
        //     ->send(new TaskAssignedMail($this->task, $this->assignedUser, $this->assigner));
        
        Log::info('Email simulation completed', [
            'to' => $this->assignedUser->email,
            'subject' => "Task Assigned: {$this->task->title}",
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendTaskAssignedEmail job failed permanently', [
            'task_id' => $this->task->id,
            'assigned_user_id' => $this->assignedUser->id,
            'assigner_id' => $this->assigner->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
