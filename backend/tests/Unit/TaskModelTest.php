<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Task;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class TaskModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /** @test */
    public function it_can_create_a_task()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $task = Task::create([
            'title' => 'Test Task',
            'description' => 'Test Description',
            'status' => 'pending',
            'priority' => 'medium',
            'due_date' => now()->addDays(7),
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Test Task',
            'status' => 'pending',
        ]);
    }

    /** @test */
    public function it_sets_completed_at_when_status_changes_to_completed()
    {
        $user = User::factory()->create();
        $task = Task::create([
            'title' => 'Test Task',
            'status' => 'pending',
            'created_by' => $user->id,
        ]);

        $this->assertNull($task->completed_at);

        $task->update(['status' => 'completed']);

        $this->assertNotNull($task->fresh()->completed_at);
    }

    /** @test */
    public function it_clears_completed_at_when_status_changes_from_completed()
    {
        $user = User::factory()->create();
        $task = Task::create([
            'title' => 'Test Task',
            'status' => 'completed',
            'completed_at' => now(),
            'created_by' => $user->id,
        ]);

        $this->assertNotNull($task->completed_at);

        $task->update(['status' => 'in_progress']);

        $this->assertNull($task->fresh()->completed_at);
    }

    /** @test */
    public function it_belongs_to_a_category()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $task = Task::create([
            'title' => 'Test Task',
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(Category::class, $task->category);
        $this->assertEquals($category->id, $task->category->id);
    }

    /** @test */
    public function it_belongs_to_a_creator()
    {
        $user = User::factory()->create();
        $task = Task::create([
            'title' => 'Test Task',
            'created_by' => $user->id,
        ]);

        $this->assertInstanceOf(User::class, $task->creator);
        $this->assertEquals($user->id, $task->creator->id);
    }

    /** @test */
    public function it_belongs_to_an_assignee()
    {
        $creator = User::factory()->create();
        $assignee = User::factory()->create();

        $task = Task::create([
            'title' => 'Test Task',
            'created_by' => $creator->id,
            'assigned_to' => $assignee->id,
        ]);

        $this->assertInstanceOf(User::class, $task->assignee);
        $this->assertEquals($assignee->id, $task->assignee->id);
    }

    /** @test */
    public function it_can_have_subtasks()
    {
        $user = User::factory()->create();
        $parentTask = Task::create([
            'title' => 'Parent Task',
            'created_by' => $user->id,
        ]);

        $subtask = Task::create([
            'title' => 'Subtask',
            'parent_task_id' => $parentTask->id,
            'created_by' => $user->id,
        ]);

        $this->assertTrue($parentTask->subtasks->contains($subtask));
        $this->assertEquals($parentTask->id, $subtask->parent->id);
    }

    /** @test */
    public function it_can_filter_by_status()
    {
        $user = User::factory()->create();
        Task::create(['title' => 'Pending Task', 'status' => 'pending', 'created_by' => $user->id]);
        Task::create(['title' => 'Completed Task', 'status' => 'completed', 'created_by' => $user->id]);
        Task::create(['title' => 'In Progress Task', 'status' => 'in_progress', 'created_by' => $user->id]);

        $pendingTasks = Task::byStatus('pending')->get();
        $this->assertCount(1, $pendingTasks);
        $this->assertEquals('Pending Task', $pendingTasks->first()->title);
    }

    /** @test */
    public function it_can_filter_by_priority()
    {
        $user = User::factory()->create();
        Task::create(['title' => 'High Priority', 'priority' => 'high', 'created_by' => $user->id]);
        Task::create(['title' => 'Low Priority', 'priority' => 'low', 'created_by' => $user->id]);

        $highPriorityTasks = Task::byPriority('high')->get();
        $this->assertCount(1, $highPriorityTasks);
        $this->assertEquals('High Priority', $highPriorityTasks->first()->title);
    }

    /** @test */
    public function it_can_filter_overdue_tasks()
    {
        $user = User::factory()->create();
        Task::create([
            'title' => 'Overdue Task',
            'due_date' => now()->subDays(5),
            'status' => 'pending',
            'created_by' => $user->id,
        ]);
        Task::create([
            'title' => 'Future Task',
            'due_date' => now()->addDays(5),
            'status' => 'pending',
            'created_by' => $user->id,
        ]);
        Task::create([
            'title' => 'Completed Overdue',
            'due_date' => now()->subDays(5),
            'status' => 'completed',
            'created_by' => $user->id,
        ]);

        $overdueTasks = Task::overdue()->get();
        $this->assertCount(1, $overdueTasks);
        $this->assertEquals('Overdue Task', $overdueTasks->first()->title);
    }

    /** @test */
    public function it_can_filter_tasks_due_today()
    {
        $user = User::factory()->create();
        Task::create([
            'title' => 'Due Today',
            'due_date' => today(),
            'status' => 'pending',
            'created_by' => $user->id,
        ]);
        Task::create([
            'title' => 'Due Tomorrow',
            'due_date' => today()->addDay(),
            'status' => 'pending',
            'created_by' => $user->id,
        ]);

        $dueTodayTasks = Task::dueToday()->get();
        $this->assertCount(1, $dueTodayTasks);
        $this->assertEquals('Due Today', $dueTodayTasks->first()->title);
    }

    /** @test */
    public function it_can_check_if_task_is_overdue()
    {
        $user = User::factory()->create();
        $overdueTask = Task::create([
            'title' => 'Overdue',
            'due_date' => now()->subDays(1),
            'status' => 'pending',
            'created_by' => $user->id,
        ]);

        $this->assertTrue($overdueTask->isOverdue());

        $completedTask = Task::create([
            'title' => 'Completed Overdue',
            'due_date' => now()->subDays(1),
            'status' => 'completed',
            'created_by' => $user->id,
        ]);

        $this->assertFalse($completedTask->isOverdue());
    }

    /** @test */
    public function it_can_check_if_task_is_due_today()
    {
        $user = User::factory()->create();
        $dueTodayTask = Task::create([
            'title' => 'Due Today',
            'due_date' => today(),
            'created_by' => $user->id,
        ]);

        $this->assertTrue($dueTodayTask->isDueToday());
    }

    /** @test */
    public function it_calculates_progress_percentage_based_on_subtasks()
    {
        $user = User::factory()->create();
        $parentTask = Task::create([
            'title' => 'Parent',
            'status' => 'in_progress',
            'created_by' => $user->id,
        ]);

        // No subtasks - should return 0 for in_progress
        $this->assertEquals(0, $parentTask->progress_percentage);

        // Create subtasks
        Task::create([
            'title' => 'Subtask 1',
            'status' => 'completed',
            'parent_task_id' => $parentTask->id,
            'created_by' => $user->id,
        ]);
        Task::create([
            'title' => 'Subtask 2',
            'status' => 'pending',
            'parent_task_id' => $parentTask->id,
            'created_by' => $user->id,
        ]);

        $parentTask->refresh();
        $this->assertEquals(50, $parentTask->progress_percentage);
    }

    /** @test */
    public function it_returns_100_percent_for_completed_task_without_subtasks()
    {
        $user = User::factory()->create();
        $task = Task::create([
            'title' => 'Completed',
            'status' => 'completed',
            'created_by' => $user->id,
        ]);

        $this->assertEquals(100, $task->progress_percentage);
    }

    /** @test */
    public function it_calculates_total_estimated_hours_including_subtasks()
    {
        $user = User::factory()->create();
        $parentTask = Task::create([
            'title' => 'Parent',
            'estimated_hours' => 10,
            'created_by' => $user->id,
        ]);

        Task::create([
            'title' => 'Subtask 1',
            'estimated_hours' => 5,
            'parent_task_id' => $parentTask->id,
            'created_by' => $user->id,
        ]);
        Task::create([
            'title' => 'Subtask 2',
            'estimated_hours' => 3,
            'parent_task_id' => $parentTask->id,
            'created_by' => $user->id,
        ]);

        $parentTask->refresh();
        $this->assertEquals(18, $parentTask->total_estimated_hours);
    }

    /** @test */
    public function it_returns_correct_priority_color()
    {
        $user = User::factory()->create();
        $lowTask = Task::create(['title' => 'Low', 'priority' => 'low', 'created_by' => $user->id]);
        $mediumTask = Task::create(['title' => 'Medium', 'priority' => 'medium', 'created_by' => $user->id]);
        $highTask = Task::create(['title' => 'High', 'priority' => 'high', 'created_by' => $user->id]);
        $urgentTask = Task::create(['title' => 'Urgent', 'priority' => 'urgent', 'created_by' => $user->id]);

        $this->assertEquals('green', $lowTask->priority_color);
        $this->assertEquals('yellow', $mediumTask->priority_color);
        $this->assertEquals('orange', $highTask->priority_color);
        $this->assertEquals('red', $urgentTask->priority_color);
    }

    /** @test */
    public function it_returns_correct_status_color()
    {
        $user = User::factory()->create();
        $pendingTask = Task::create(['title' => 'Pending', 'status' => 'pending', 'created_by' => $user->id]);
        $inProgressTask = Task::create(['title' => 'In Progress', 'status' => 'in_progress', 'created_by' => $user->id]);
        $completedTask = Task::create(['title' => 'Completed', 'status' => 'completed', 'created_by' => $user->id]);
        $cancelledTask = Task::create(['title' => 'Cancelled', 'status' => 'cancelled', 'created_by' => $user->id]);

        $this->assertEquals('gray', $pendingTask->status_color);
        $this->assertEquals('blue', $inProgressTask->status_color);
        $this->assertEquals('green', $completedTask->status_color);
        $this->assertEquals('red', $cancelledTask->status_color);
    }
}

