<?php

namespace Database\Factories;

use App\Models\Mailer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Crypt;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Mailer>
 */
class MailerFactory extends Factory
{
    protected $model = Mailer::class;

    public function definition(): array
    {
        $provider = fake()->randomElement(['smtp', 'mailgun', 'ses', 'postmark', 'resend', 'log']);
        $credentials = match($provider) {
            'smtp' => [
                'host' => 'smtp.example.com',
                'port' => 587,
                'username' => 'user@example.com',
                'password' => 'password',
                'encryption' => 'tls',
            ],
            'mailgun' => [
                'domain' => 'mg.example.com',
                'secret' => 'secret-key',
            ],
            'ses' => [
                'key' => 'aws-key',
                'secret' => 'aws-secret',
                'region' => 'us-east-1',
            ],
            'postmark' => [
                'token' => 'postmark-token',
            ],
            'resend' => [
                'key' => 'resend-key',
            ],
            default => [],
        };

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true) . ' Mailer',
            'provider' => $provider,
            'is_active' => fake()->boolean(70),
            'credentials' => $credentials,
            'from_address' => fake()->safeEmail(),
            'from_name' => fake()->name(),
            'test_status' => fake()->boolean(50),
            'test_error' => null,
            'last_tested_at' => fake()->optional()->dateTime(),
        ];
    }
}

