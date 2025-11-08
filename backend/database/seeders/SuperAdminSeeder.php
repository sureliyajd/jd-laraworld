<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create super_admin role for 'api' guard
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'super_admin', 'guard_name' => 'api']
        );

        // Create super admin user if it doesn't exist
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@laraworld.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin@laraworld'),
                'parent_id' => null, // Super admin has no parent
            ]
        );

        // Assign super_admin role to the user
        if (!$superAdmin->hasRole('super_admin')) {
            $superAdmin->assignRole('super_admin');
        }

        $this->command->info('Super Admin created successfully!');
        $this->command->info('Email: admin@laraworld.test');
        $this->command->info('Password: admin@laraworld');
    }
}
