<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Development',
                'slug' => 'development',
                'description' => 'Tasks related to software development, coding, and technical implementation',
                'color' => '#3B82F6',
                'icon' => 'fas fa-code',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Design',
                'slug' => 'design',
                'description' => 'UI/UX design, wireframing, mockups, and visual design tasks',
                'color' => '#8B5CF6',
                'icon' => 'fas fa-palette',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Testing',
                'slug' => 'testing',
                'description' => 'Quality assurance, testing, bug fixes, and validation tasks',
                'color' => '#10B981',
                'icon' => 'fas fa-bug',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Documentation',
                'slug' => 'documentation',
                'description' => 'Writing documentation, user guides, and technical specifications',
                'color' => '#F59E0B',
                'icon' => 'fas fa-file-alt',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'DevOps',
                'slug' => 'devops',
                'description' => 'Infrastructure, deployment, CI/CD, and server management tasks',
                'color' => '#EF4444',
                'icon' => 'fas fa-server',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Research',
                'slug' => 'research',
                'description' => 'Market research, technology evaluation, and feasibility studies',
                'color' => '#06B6D4',
                'icon' => 'fas fa-search',
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Planning',
                'slug' => 'planning',
                'description' => 'Project planning, sprint planning, and roadmap development',
                'color' => '#84CC16',
                'icon' => 'fas fa-tasks',
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Meeting',
                'slug' => 'meeting',
                'description' => 'Team meetings, client calls, and collaborative sessions',
                'color' => '#F97316',
                'icon' => 'fas fa-users',
                'is_active' => true,
                'sort_order' => 8,
            ],
            [
                'name' => 'Review',
                'slug' => 'review',
                'description' => 'Code reviews, design reviews, and quality assessments',
                'color' => '#EC4899',
                'icon' => 'fas fa-eye',
                'is_active' => true,
                'sort_order' => 9,
            ],
            [
                'name' => 'Maintenance',
                'slug' => 'maintenance',
                'description' => 'System maintenance, updates, and routine tasks',
                'color' => '#6B7280',
                'icon' => 'fas fa-wrench',
                'is_active' => true,
                'sort_order' => 10,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}