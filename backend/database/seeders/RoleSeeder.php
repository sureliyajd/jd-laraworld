<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define the roles
        $roles = ['super_admin', 'visitor', 'public'];

        foreach ($roles as $roleName) {
            // Check if the role already exists for the 'api' guard to avoid duplicates
            if (!Role::where('name', $roleName)->where('guard_name', 'api')->exists()) {
                Role::create([
                    'name' => $roleName,
                    'guard_name' => 'api'
                ]);
            }
        }

        // Get all permissions for 'api' guard
        $allPermissions = Permission::where('guard_name', 'api')->get();
        $permissionsConfig = config('permissions');

        // Super Admin: All permissions
        $superAdmin = Role::where('name', 'super_admin')->where('guard_name', 'api')->first();
        if ($superAdmin) {
            $superAdmin->syncPermissions($allPermissions);
        }

        // Visitor: Specific permissions
        $visitor = Role::where('name', 'visitor')->where('guard_name', 'api')->first();
        if ($visitor) {
            $visitorPermissionNames = [];

            // send_emails: all except 'view all email logs'
            $sendEmailsPermissions = $permissionsConfig['send_emails']['permissions'];
            $visitorPermissionNames = array_merge(
                $visitorPermissionNames,
                array_filter($sendEmailsPermissions, fn($perm) => $perm !== 'view all email logs')
            );

            // task_management: all except 'view all tasks'
            $taskManagementPermissions = $permissionsConfig['task_management']['permissions'];
            $visitorPermissionNames = array_merge(
                $visitorPermissionNames,
                array_filter($taskManagementPermissions, fn($perm) => $perm !== 'view all tasks')
            );

            // users: all permissions
            $visitorPermissionNames = array_merge(
                $visitorPermissionNames,
                $permissionsConfig['users']['permissions']
            );

            // Get permission models for 'api' guard
            $visitorPermissions = Permission::where('guard_name', 'api')
                ->whereIn('name', $visitorPermissionNames)
                ->get();
            
            $visitor->syncPermissions($visitorPermissions);
        }

        // Public: Limited permissions
        $public = Role::where('name', 'public')->where('guard_name', 'api')->first();
        if ($public) {
            $publicPermissionNames = [
                'view all email logs',
                'view all tasks',
                'view all users',
            ];

            // Only assign permissions that exist for 'api' guard
            $existingPublicPermissions = Permission::where('guard_name', 'api')
                ->whereIn('name', $publicPermissionNames)
                ->get();
            
            $public->syncPermissions($existingPublicPermissions);
        }
    }
}

