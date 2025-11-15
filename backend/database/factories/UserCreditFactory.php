<?php

namespace Database\Factories;

use App\Models\UserCredit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserCredit>
 */
class UserCreditFactory extends Factory
{
    protected $model = UserCredit::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'module' => fake()->randomElement(['task', 'email', 'user']),
            'credits' => fake()->numberBetween(0, 1000),
            'used' => fake()->numberBetween(0, 500),
        ];
    }
}

