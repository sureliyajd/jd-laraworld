<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        $categories = Category::all();

        if (!$user) {
            $this->command->warn('No user found. Please run DemoUserSeeder first.');
            return;
        }

        $tasks = [
            // Development Tasks
            [
                'title' => 'Implement user authentication system',
                'description' => 'Create a comprehensive authentication system with login, registration, password reset, and email verification features. Include OAuth2 integration with Google and GitHub.',
                'status' => 'completed',
                'priority' => 'high',
                'due_date' => Carbon::now()->subDays(5),
                'completed_at' => Carbon::now()->subDays(3),
                'estimated_hours' => 16,
                'actual_hours' => 18,
                'category_id' => $categories->where('slug', 'development')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 1',
                    'story_points' => 8,
                    'labels' => ['backend', 'security', 'oauth'],
                ],
            ],
            [
                'title' => 'Design responsive dashboard layout',
                'description' => 'Create a modern, responsive dashboard layout with sidebar navigation, header, and main content area. Ensure it works well on desktop, tablet, and mobile devices.',
                'status' => 'in_progress',
                'priority' => 'medium',
                'due_date' => Carbon::now()->addDays(3),
                'estimated_hours' => 12,
                'actual_hours' => 6,
                'category_id' => $categories->where('slug', 'design')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 2',
                    'story_points' => 5,
                    'labels' => ['frontend', 'responsive', 'ui'],
                ],
            ],
            [
                'title' => 'Set up automated testing pipeline',
                'description' => 'Configure CI/CD pipeline with automated testing for unit tests, integration tests, and end-to-end tests. Include code coverage reporting and quality gates.',
                'status' => 'pending',
                'priority' => 'high',
                'due_date' => Carbon::now()->addDays(7),
                'estimated_hours' => 20,
                'category_id' => $categories->where('slug', 'devops')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 2',
                    'story_points' => 8,
                    'labels' => ['devops', 'testing', 'ci-cd'],
                ],
            ],
            [
                'title' => 'Write API documentation',
                'description' => 'Create comprehensive API documentation using OpenAPI/Swagger. Include authentication examples, request/response schemas, and error handling documentation.',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => Carbon::now()->addDays(5),
                'estimated_hours' => 8,
                'category_id' => $categories->where('slug', 'documentation')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 2',
                    'story_points' => 3,
                    'labels' => ['documentation', 'api', 'swagger'],
                ],
            ],
            [
                'title' => 'Performance optimization review',
                'description' => 'Conduct a comprehensive performance review of the application. Identify bottlenecks, optimize database queries, and implement caching strategies.',
                'status' => 'pending',
                'priority' => 'urgent',
                'due_date' => Carbon::now()->addDays(2),
                'estimated_hours' => 24,
                'category_id' => $categories->where('slug', 'testing')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 2',
                    'story_points' => 13,
                    'labels' => ['performance', 'optimization', 'database'],
                ],
            ],
            [
                'title' => 'User interface prototyping',
                'description' => 'Create interactive prototypes for the main user flows including dashboard, task management, and settings pages. Use Figma or similar tools.',
                'status' => 'completed',
                'priority' => 'medium',
                'due_date' => Carbon::now()->subDays(10),
                'completed_at' => Carbon::now()->subDays(8),
                'estimated_hours' => 14,
                'actual_hours' => 16,
                'category_id' => $categories->where('slug', 'design')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 1',
                    'story_points' => 8,
                    'labels' => ['design', 'prototyping', 'figma'],
                ],
            ],
            [
                'title' => 'Database schema optimization',
                'description' => 'Review and optimize the database schema for better performance. Add necessary indexes, normalize tables, and implement proper foreign key constraints.',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => Carbon::now()->addDays(4),
                'estimated_hours' => 16,
                'actual_hours' => 8,
                'category_id' => $categories->where('slug', 'development')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 2',
                    'story_points' => 8,
                    'labels' => ['database', 'optimization', 'backend'],
                ],
            ],
            [
                'title' => 'Security audit and penetration testing',
                'description' => 'Conduct a comprehensive security audit of the application. Test for common vulnerabilities and implement security best practices.',
                'status' => 'pending',
                'priority' => 'urgent',
                'due_date' => Carbon::now()->addDays(6),
                'estimated_hours' => 32,
                'category_id' => $categories->where('slug', 'testing')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 3',
                    'story_points' => 13,
                    'labels' => ['security', 'audit', 'testing'],
                ],
            ],
            [
                'title' => 'Mobile app development planning',
                'description' => 'Research and plan the development of a mobile application. Evaluate frameworks, create technical specifications, and define the development roadmap.',
                'status' => 'pending',
                'priority' => 'low',
                'due_date' => Carbon::now()->addDays(14),
                'estimated_hours' => 12,
                'category_id' => $categories->where('slug', 'research')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 4',
                    'story_points' => 5,
                    'labels' => ['mobile', 'research', 'planning'],
                ],
            ],
            [
                'title' => 'Team retrospective meeting',
                'description' => 'Organize and facilitate a team retrospective meeting to discuss sprint outcomes, identify improvements, and plan for the next iteration.',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => Carbon::now()->addDays(1),
                'estimated_hours' => 2,
                'category_id' => $categories->where('slug', 'meeting')->first()->id,
                'created_by' => $user->id,
                'assigned_to' => $user->id,
                'metadata' => [
                    'sprint' => 'Sprint 2',
                    'story_points' => 2,
                    'labels' => ['meeting', 'retrospective', 'team'],
                ],
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::create($taskData);
        }

        // Create some subtasks for the main development task
        $mainTask = Task::where('title', 'Implement user authentication system')->first();
        if ($mainTask) {
            $subtasks = [
                [
                    'title' => 'Set up Laravel Passport',
                    'description' => 'Install and configure Laravel Passport for OAuth2 authentication',
                    'status' => 'completed',
                    'priority' => 'high',
                    'due_date' => Carbon::now()->subDays(8),
                    'completed_at' => Carbon::now()->subDays(7),
                    'estimated_hours' => 4,
                    'actual_hours' => 5,
                    'created_by' => $user->id,
                    'assigned_to' => $user->id,
                    'parent_task_id' => $mainTask->id,
                ],
                [
                    'title' => 'Create user registration API',
                    'description' => 'Implement user registration endpoint with validation and email verification',
                    'status' => 'completed',
                    'priority' => 'high',
                    'due_date' => Carbon::now()->subDays(6),
                    'completed_at' => Carbon::now()->subDays(5),
                    'estimated_hours' => 6,
                    'actual_hours' => 7,
                    'created_by' => $user->id,
                    'assigned_to' => $user->id,
                    'parent_task_id' => $mainTask->id,
                ],
                [
                    'title' => 'Implement login and logout APIs',
                    'description' => 'Create secure login and logout endpoints with token management',
                    'status' => 'completed',
                    'priority' => 'high',
                    'due_date' => Carbon::now()->subDays(4),
                    'completed_at' => Carbon::now()->subDays(3),
                    'estimated_hours' => 6,
                    'actual_hours' => 6,
                    'created_by' => $user->id,
                    'assigned_to' => $user->id,
                    'parent_task_id' => $mainTask->id,
                ],
            ];

            foreach ($subtasks as $subtaskData) {
                Task::create($subtaskData);
            }
        }
    }
}