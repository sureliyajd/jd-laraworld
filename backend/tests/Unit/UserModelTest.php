<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\UserCredit;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /** @test */
    public function it_can_create_a_user()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }

    /** @test */
    public function it_can_check_if_user_is_super_admin()
    {
        $user = User::factory()->create();
        $superAdminRole = Role::create(['name' => 'super_admin', 'guard_name' => 'api']);
        $user->assignRole($superAdminRole);

        $this->assertTrue($user->isSuperAdmin());
    }

    /** @test */
    public function it_can_check_if_user_is_main_user()
    {
        $mainUser = User::factory()->create(['parent_id' => null]);
        $childUser = User::factory()->create(['parent_id' => $mainUser->id]);

        $this->assertTrue($mainUser->isMainUser());
        $this->assertFalse($childUser->isMainUser());
    }

    /** @test */
    public function it_returns_self_as_effective_user_for_main_user()
    {
        $user = User::factory()->create(['parent_id' => null]);

        $this->assertEquals($user->id, $user->getEffectiveUser()->id);
    }

    /** @test */
    public function it_returns_parent_as_effective_user_for_child_user()
    {
        $parent = User::factory()->create(['parent_id' => null]);
        $child = User::factory()->create(['parent_id' => $parent->id]);

        $effectiveUser = $child->getEffectiveUser();
        $this->assertEquals($parent->id, $effectiveUser->id);
    }

    /** @test */
    public function it_returns_self_as_effective_user_for_super_admin()
    {
        $superAdminRole = Role::create(['name' => 'super_admin', 'guard_name' => 'api']);
        $user = User::factory()->create();
        $user->assignRole($superAdminRole);

        $this->assertEquals($user->id, $user->getEffectiveUser()->id);
    }

    /** @test */
    public function it_has_unlimited_credits_if_super_admin()
    {
        $superAdminRole = Role::create(['name' => 'super_admin', 'guard_name' => 'api']);
        $user = User::factory()->create();
        $user->assignRole($superAdminRole);

        $this->assertTrue($user->hasEnoughCredits('task', 999999));
    }

    /** @test */
    public function it_can_check_if_user_has_enough_credits()
    {
        $user = User::factory()->create();
        UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 50,
        ]);

        $this->assertTrue($user->hasEnoughCredits('task', 50));
        $this->assertFalse($user->hasEnoughCredits('task', 51));
    }

    /** @test */
    public function it_returns_false_if_no_credit_record_exists()
    {
        $user = User::factory()->create();

        $this->assertFalse($user->hasEnoughCredits('task', 1));
    }

    /** @test */
    public function it_can_consume_credits()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 0,
        ]);

        $result = $user->consumeCredits('task', 10);

        $this->assertTrue($result);
        $credit->refresh();
        $this->assertEquals(10, $credit->used);
    }

    /** @test */
    public function it_cannot_consume_more_credits_than_available()
    {
        $user = User::factory()->create();
        UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 95,
        ]);

        $result = $user->consumeCredits('task', 10);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_skips_credit_consumption_for_super_admin()
    {
        $superAdminRole = Role::create(['name' => 'super_admin', 'guard_name' => 'api']);
        $user = User::factory()->create();
        $user->assignRole($superAdminRole);

        $result = $user->consumeCredits('task', 10);

        $this->assertTrue($result);
    }

    /** @test */
    public function it_can_release_credits()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 50,
        ]);

        $user->releaseCredits('task', 10);

        $credit->refresh();
        $this->assertEquals(40, $credit->used);
    }

    /** @test */
    public function it_can_get_credit_statistics()
    {
        $user = User::factory()->create();
        UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 30,
        ]);
        UserCredit::create([
            'user_id' => $user->id,
            'module' => 'email',
            'credits' => 50,
            'used' => 10,
        ]);

        $stats = $user->getCreditStats();

        $this->assertEquals(100, $stats['task']['credits']);
        $this->assertEquals(30, $stats['task']['used']);
        $this->assertEquals(70, $stats['task']['available']);
        $this->assertEquals(50, $stats['email']['credits']);
        $this->assertEquals(10, $stats['email']['used']);
    }

    /** @test */
    public function it_returns_unlimited_stats_for_super_admin()
    {
        $superAdminRole = Role::create(['name' => 'super_admin', 'guard_name' => 'api']);
        $user = User::factory()->create();
        $user->assignRole($superAdminRole);

        $stats = $user->getCreditStats();

        $this->assertEquals(-1, $stats['task']['credits']);
        $this->assertEquals(-1, $stats['task']['available']);
    }

    /** @test */
    public function it_can_get_task_statistics()
    {
        $user = User::factory()->create();
        Task::create(['title' => 'Created', 'created_by' => $user->id, 'status' => 'pending']);
        Task::create(['title' => 'Assigned', 'assigned_to' => $user->id, 'status' => 'completed']);
        Task::create(['title' => 'Assigned Pending', 'assigned_to' => $user->id, 'status' => 'pending']);

        $stats = $user->task_stats;

        $this->assertEquals(1, $stats['created']);
        $this->assertEquals(2, $stats['assigned']);
        $this->assertEquals(1, $stats['completed']);
        $this->assertEquals(1, $stats['pending']);
    }

    /** @test */
    public function it_has_relationship_with_created_tasks()
    {
        $user = User::factory()->create();
        $task = Task::create(['title' => 'Test', 'created_by' => $user->id]);

        $this->assertTrue($user->createdTasks->contains($task));
    }

    /** @test */
    public function it_has_relationship_with_assigned_tasks()
    {
        $user = User::factory()->create();
        $task = Task::create(['title' => 'Test', 'assigned_to' => $user->id]);

        $this->assertTrue($user->assignedTasks->contains($task));
    }

    /** @test */
    public function it_has_relationship_with_credits()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 0,
        ]);

        $this->assertTrue($user->credits->contains($credit));
    }
}

