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

class ProcessTaskUpdate implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;
    public $backoff = [15, 45, 90]; // Retry after 15s, 45s, 90s

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Task $task,
        public User $user,
        public array $changes = []
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Processing task update job', [
                'task_id' => $this->task->id,
                'user_id' => $this->user->id,
                'changes' => $this->changes,
            ]);

            // Simulate heavy processing (e.g., generating reports, updating analytics)
            $this->simulateHeavyProcessing();

            // Update task statistics
            $this->updateTaskStatistics();

            // Generate task activity report
            $this->generateActivityReport();

            Log::info('Task update processing completed successfully', [
                'task_id' => $this->task->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process task update', [
                'task_id' => $this->task->id,
                'user_id' => $this->user->id,
                'error' => $e->getMessage(),
            ]);

            throw $e; // Re-throw to trigger retry mechanism
        }
    }

    /**
     * Simulate heavy processing
     */
    private function simulateHeavyProcessing(): void
    {
        // Simulate processing time based on task complexity
        $processingTime = $this->task->priority === 'high' ? 5 : 3;
        sleep($processingTime);

        Log::info('Heavy processing simulation completed', [
            'task_id' => $this->task->id,
            'processing_time' => $processingTime,
        ]);
    }

    /**
     * Update task statistics
     */
    private function updateTaskStatistics(): void
    {
        // In a real application, you might update analytics, metrics, etc.
        Log::info('Task statistics updated', [
            'task_id' => $this->task->id,
            'status' => $this->task->status,
            'priority' => $this->task->priority,
        ]);
    }

    /**
     * Generate activity report
     */
    private function generateActivityReport(): void
    {
        // Simulate generating activity reports
        sleep(1);

        Log::info('Activity report generated', [
            'task_id' => $this->task->id,
            'report_type' => 'task_activity',
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessTaskUpdate job failed permanently', [
            'task_id' => $this->task->id,
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
