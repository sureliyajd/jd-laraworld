<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\UserCredit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserCreditModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_a_user_credit()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 0,
        ]);

        $this->assertDatabaseHas('user_credits', [
            'id' => $credit->id,
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
        ]);
    }

    /** @test */
    public function it_calculates_available_credits()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 30,
        ]);

        $this->assertEquals(70, $credit->available);
    }

    /** @test */
    public function it_returns_zero_if_used_exceeds_credits()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 150,
        ]);

        $this->assertEquals(0, $credit->available);
    }

    /** @test */
    public function it_can_check_if_user_has_enough_credits()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 50,
        ]);

        $this->assertTrue($credit->hasEnough(50));
        $this->assertTrue($credit->hasEnough(49));
        $this->assertFalse($credit->hasEnough(51));
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

        $result = $credit->consume(25);

        $this->assertTrue($result);
        $credit->refresh();
        $this->assertEquals(25, $credit->used);
        $this->assertEquals(75, $credit->available);
    }

    /** @test */
    public function it_cannot_consume_more_credits_than_available()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 90,
        ]);

        $result = $credit->consume(15);

        $this->assertFalse($result);
        $credit->refresh();
        $this->assertEquals(90, $credit->used);
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

        $credit->release(20);

        $credit->refresh();
        $this->assertEquals(30, $credit->used);
        $this->assertEquals(70, $credit->available);
    }

    /** @test */
    public function it_prevents_used_from_going_below_zero()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 10,
        ]);

        $credit->release(20);

        $credit->refresh();
        $this->assertEquals(0, $credit->used);
    }

    /** @test */
    public function it_belongs_to_a_user()
    {
        $user = User::factory()->create();
        $credit = UserCredit::create([
            'user_id' => $user->id,
            'module' => 'task',
            'credits' => 100,
            'used' => 0,
        ]);

        $this->assertInstanceOf(User::class, $credit->user);
        $this->assertEquals($user->id, $credit->user->id);
    }
}

