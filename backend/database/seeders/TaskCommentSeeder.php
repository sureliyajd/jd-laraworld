<?php

namespace Database\Seeders;

use App\Models\TaskComment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskCommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        $tasks = Task::all();

        if (!$user) {
            $this->command->warn('No user found. Please run DemoUserSeeder first.');
            return;
        }

        if ($tasks->isEmpty()) {
            $this->command->warn('No tasks found. Please run TaskSeeder first.');
            return;
        }

        $comments = [
            [
                'content' => 'Great progress on this task! The authentication system is working well. I\'ve tested the login flow and everything looks good.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'Implement user authentication system')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'Status changed to completed',
                'is_system_comment' => true,
                'task_id' => $tasks->where('title', 'Implement user authentication system')->first()->id,
                'user_id' => $user->id,
                'metadata' => ['action' => 'status_changed', 'status' => 'completed'],
            ],
            [
                'content' => 'I\'ve started working on the responsive design. The mobile layout needs some adjustments, but the desktop version is looking good.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'Design responsive dashboard layout')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'Status changed to in_progress',
                'is_system_comment' => true,
                'task_id' => $tasks->where('title', 'Design responsive dashboard layout')->first()->id,
                'user_id' => $user->id,
                'metadata' => ['action' => 'status_changed', 'status' => 'in_progress'],
            ],
            [
                'content' => 'Priority changed to urgent',
                'is_system_comment' => true,
                'task_id' => $tasks->where('title', 'Performance optimization review')->first()->id,
                'user_id' => $user->id,
                'metadata' => ['action' => 'priority_changed', 'priority' => 'urgent'],
            ],
            [
                'content' => 'This is a critical task that needs immediate attention. The application performance has been degrading and users are reporting slow response times.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'Performance optimization review')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'I\'ve completed the initial database schema review. Found several areas for optimization including missing indexes and redundant queries.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'Database schema optimization')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'Status changed to in_progress',
                'is_system_comment' => true,
                'task_id' => $tasks->where('title', 'Database schema optimization')->first()->id,
                'user_id' => $user->id,
                'metadata' => ['action' => 'status_changed', 'status' => 'in_progress'],
            ],
            [
                'content' => 'Task assigned to Demo User',
                'is_system_comment' => true,
                'task_id' => $tasks->where('title', 'Set up automated testing pipeline')->first()->id,
                'user_id' => $user->id,
                'metadata' => ['action' => 'assigned', 'assignee' => 'Demo User'],
            ],
            [
                'content' => 'We need to prioritize this testing pipeline setup. It\'s crucial for maintaining code quality as we scale.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'Set up automated testing pipeline')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'I\'ve researched several mobile frameworks. React Native seems like the best choice for our use case, but we should also consider Flutter.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'Mobile app development planning')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'The prototypes look amazing! The user experience flow is intuitive and the visual design is clean and modern.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'User interface prototyping')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'Status changed to completed',
                'is_system_comment' => true,
                'task_id' => $tasks->where('title', 'User interface prototyping')->first()->id,
                'user_id' => $user->id,
                'metadata' => ['action' => 'status_changed', 'status' => 'completed'],
            ],
            [
                'content' => 'I\'ll schedule this meeting for tomorrow at 2 PM. Please let me know if that works for everyone.',
                'is_system_comment' => false,
                'task_id' => $tasks->where('title', 'Team retrospective meeting')->first()->id,
                'user_id' => $user->id,
                'metadata' => null,
            ],
            [
                'content' => 'Due date changed to Tomorrow',
                'is_system_comment' => true,
                'task_id' => $tasks->where('title', 'Team retrospective meeting')->first()->id,
                'user_id' => $user->id,
                'metadata' => ['action' => 'due_date_changed', 'due_date' => 'Tomorrow'],
            ],
        ];

        foreach ($comments as $commentData) {
            TaskComment::create($commentData);
        }
    }
}