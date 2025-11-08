<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissionsConfig = config('permissions');

        foreach ($permissionsConfig as $group => $config) {
            foreach ($config['permissions'] as $permissionName) {
                // Check if the permission already exists for the 'api' guard to avoid duplicates
                if (!Permission::where('name', $permissionName)->where('guard_name', 'api')->exists()) {
                    Permission::create([
                        'name' => $permissionName,
                        'guard_name' => 'api'
                    ]);
                }
            }
        }
    }
}

