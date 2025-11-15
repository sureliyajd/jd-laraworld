<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Category;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CategoryModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_category()
    {
        $category = Category::create([
            'name' => 'Development',
            'description' => 'Development tasks',
            'color' => '#FF5733',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Development',
        ]);
    }

    /** @test */
    public function it_automatically_generates_slug_from_name()
    {
        $category = Category::create([
            'name' => 'Development Tasks',
            'is_active' => true,
        ]);

        $this->assertEquals('development-tasks', $category->slug);
    }

    /** @test */
    public function it_updates_slug_when_name_changes()
    {
        $category = Category::create([
            'name' => 'Development',
            'is_active' => true,
        ]);

        $category->update(['name' => 'New Development']);

        $this->assertEquals('new-development', $category->fresh()->slug);
    }

    /** @test */
    public function it_can_filter_active_categories()
    {
        Category::create(['name' => 'Active Category', 'is_active' => true]);
        Category::create(['name' => 'Inactive Category', 'is_active' => false]);

        $activeCategories = Category::active()->get();

        $this->assertCount(1, $activeCategories);
        $this->assertEquals('Active Category', $activeCategories->first()->name);
    }

    /** @test */
    public function it_can_order_categories_by_sort_order()
    {
        Category::create(['name' => 'Third', 'sort_order' => 3, 'is_active' => true]);
        Category::create(['name' => 'First', 'sort_order' => 1, 'is_active' => true]);
        Category::create(['name' => 'Second', 'sort_order' => 2, 'is_active' => true]);

        $orderedCategories = Category::ordered()->get();

        $this->assertEquals('First', $orderedCategories[0]->name);
        $this->assertEquals('Second', $orderedCategories[1]->name);
        $this->assertEquals('Third', $orderedCategories[2]->name);
    }

    /** @test */
    public function it_has_relationship_with_tasks()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Development', 'is_active' => true]);
        $task = Task::create([
            'title' => 'Test Task',
            'category_id' => $category->id,
            'created_by' => $user->id,
        ]);

        $this->assertTrue($category->tasks->contains($task));
    }

    /** @test */
    public function it_can_count_tasks()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Development', 'is_active' => true]);
        Task::create(['title' => 'Task 1', 'category_id' => $category->id, 'created_by' => $user->id]);
        Task::create(['title' => 'Task 2', 'category_id' => $category->id, 'created_by' => $user->id]);

        $this->assertEquals(2, $category->tasks_count);
    }

    /** @test */
    public function it_can_count_completed_tasks()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Development', 'is_active' => true]);
        Task::create(['title' => 'Completed', 'category_id' => $category->id, 'status' => 'completed', 'created_by' => $user->id]);
        Task::create(['title' => 'Pending', 'category_id' => $category->id, 'status' => 'pending', 'created_by' => $user->id]);

        $this->assertEquals(1, $category->completed_tasks_count);
    }

    /** @test */
    public function it_can_count_pending_tasks()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Development', 'is_active' => true]);
        Task::create(['title' => 'Pending', 'category_id' => $category->id, 'status' => 'pending', 'created_by' => $user->id]);
        Task::create(['title' => 'In Progress', 'category_id' => $category->id, 'status' => 'in_progress', 'created_by' => $user->id]);
        Task::create(['title' => 'Completed', 'category_id' => $category->id, 'status' => 'completed', 'created_by' => $user->id]);

        $this->assertEquals(2, $category->pending_tasks_count);
    }

    /** @test */
    public function it_uses_slug_as_route_key()
    {
        $category = Category::create(['name' => 'Development', 'is_active' => true]);

        $this->assertEquals('slug', $category->getRouteKeyName());
    }
}

