<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@laraworld.test'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
            ]
        );
        
        // Assign 'public' role for 'api' guard
        $publicRole = Role::where('name', 'public')->where('guard_name', 'api')->first();
        if ($publicRole && !$user->hasRole($publicRole)) {
            $user->assignRole($publicRole);
        }
    }
}
