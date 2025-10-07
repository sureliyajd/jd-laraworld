<?php

/**
 * Demo script to test Laravel Queues, Broadcasting, and Notifications
 * 
 * This script demonstrates:
 * 1. Job dispatching to queues
 * 2. Real-time broadcasting with events
 * 3. Database notifications
 * 4. Failed job handling
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Jobs\SendTaskAssignedEmail;
use App\Jobs\ProcessTaskUpdate;
use App\Jobs\SendTaskNotification;
use App\Events\TaskAssigned;
use App\Events\TaskUpdated;
use App\Notifications\TaskAssignedNotification;
use App\Notifications\TaskUpdatedNotification;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🚀 Laravel Advanced Features Demo\n";
echo "================================\n\n";

// Get demo users
$users = User::limit(3)->get();
if ($users->count() < 2) {
    echo "❌ Need at least 2 users for demo. Please run seeders first.\n";
    exit(1);
}

$assigner = $users->first();
$assignee = $users->skip(1)->first();

echo "👤 Assigner: {$assigner->name} (ID: {$assigner->id})\n";
echo "👤 Assignee: {$assignee->name} (ID: {$assignee->id})\n\n";

// Create a demo task
echo "📋 Creating demo task...\n";
$task = Task::create([
    'title' => 'Demo Task for Queue Testing',
    'description' => 'This is a demo task to test Laravel queues, broadcasting, and notifications.',
    'status' => 'pending',
    'priority' => 'high',
    'created_by' => $assigner->id,
    'assigned_to' => $assignee->id,
    'due_date' => now()->addDays(3),
    'category_id' => 1, // Assuming category exists
]);

echo "✅ Task created: {$task->title} (ID: {$task->id})\n\n";

// 1. Test Job Dispatching
echo "🔄 Testing Job Dispatching...\n";

// Dispatch email job
SendTaskAssignedEmail::dispatch($task, $assignee, $assigner);
echo "📧 Dispatched SendTaskAssignedEmail job\n";

// Dispatch processing job
ProcessTaskUpdate::dispatch($task, $assigner, ['action' => 'created']);
echo "⚙️ Dispatched ProcessTaskUpdate job\n";

// Dispatch notification job
SendTaskNotification::dispatch($task, $assignee, 'assigned');
echo "🔔 Dispatched SendTaskNotification job\n\n";

// 2. Test Broadcasting
echo "📡 Testing Broadcasting...\n";

// Broadcast task assigned event
broadcast(new TaskAssigned($task, $assignee, $assigner));
echo "📢 Broadcasted TaskAssigned event\n";

// Broadcast task updated event
broadcast(new TaskUpdated($task, $assigner, ['status' => 'in_progress']));
echo "📢 Broadcasted TaskUpdated event\n\n";

// 3. Test Notifications
echo "🔔 Testing Notifications...\n";

// Send notification to assigned user
$assignee->notify(new TaskAssignedNotification($task, $assigner));
echo "📬 Sent TaskAssignedNotification to {$assignee->name}\n";

// Send notification to all assigned users
Notification::send([$assignee], new TaskUpdatedNotification($task, $assigner, ['status' => 'in_progress']));
echo "📬 Sent TaskUpdatedNotification to assigned users\n\n";

// 4. Check queue status
echo "📊 Queue Status:\n";
$jobsCount = DB::table('jobs')->count();
$failedJobsCount = DB::table('failed_jobs')->count();
echo "   Jobs in queue: {$jobsCount}\n";
echo "   Failed jobs: {$failedJobsCount}\n\n";

// 5. Check notifications
echo "📬 Notification Status:\n";
$notificationsCount = DB::table('notifications')->count();
$unreadNotificationsCount = DB::table('notifications')->whereNull('read_at')->count();
echo "   Total notifications: {$notificationsCount}\n";
echo "   Unread notifications: {$unreadNotificationsCount}\n\n";

echo "🎉 Demo completed successfully!\n";
echo "\nNext steps:\n";
echo "1. Run 'php artisan queue:work' to process jobs\n";
echo "2. Check the jobs table: SELECT * FROM jobs;\n";
echo "3. Check the notifications table: SELECT * FROM notifications;\n";
echo "4. Check the failed_jobs table if any jobs failed\n";
echo "5. Test real-time notifications in the React frontend\n";
