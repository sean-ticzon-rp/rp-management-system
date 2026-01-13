<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🔐 Creating permissions...');

        $permissions = [
            // ============================================
            // USER MANAGEMENT PERMISSIONS
            // ============================================
            [
                'name' => 'Approve Users',
                'slug' => 'approve-users',
                'description' => 'Can approve pending user account registrations',
                'category' => 'user-management',
            ],
            [
                'name' => 'Manage Users',
                'slug' => 'manage-users',
                'description' => 'Can create, edit, and delete user accounts',
                'category' => 'user-management',
            ],
            [
                'name' => 'View All Users',
                'slug' => 'view-all-users',
                'description' => 'Can view all user profiles and information',
                'category' => 'user-management',
            ],

            // ============================================
            // LEAVE MANAGEMENT PERMISSIONS
            // ============================================
            [
                'name' => 'Approve Leave Requests',
                'slug' => 'approve-leaves',
                'description' => 'Can approve employee leave requests',
                'category' => 'leave-management',
            ],
            [
                'name' => 'Approve Leave Appeals',
                'slug' => 'approve-leave-appeals',
                'description' => 'Can review and approve/reject leave appeals (HR only)',
                'category' => 'leave-management',
            ],
            [
                'name' => 'Manage Leave Types',
                'slug' => 'manage-leave-types',
                'description' => 'Can create and configure leave types',
                'category' => 'leave-management',
            ],
            [
                'name' => 'View All Leaves',
                'slug' => 'view-all-leaves',
                'description' => 'Can view all employee leave requests',
                'category' => 'leave-management',
            ],

            // ============================================
            // INVENTORY MANAGEMENT PERMISSIONS
            // ============================================
            [
                'name' => 'Manage Inventory',
                'slug' => 'manage-inventory',
                'description' => 'Can create, edit, and delete inventory items',
                'category' => 'inventory-management',
            ],
            [
                'name' => 'Assign Assets',
                'slug' => 'assign-assets',
                'description' => 'Can assign assets to employees',
                'category' => 'inventory-management',
            ],
            [
                'name' => 'View Inventory',
                'slug' => 'view-inventory',
                'description' => 'Can view inventory items and assignments',
                'category' => 'inventory-management',
            ],

            // ============================================
            // PROJECT MANAGEMENT PERMISSIONS
            // ============================================
            [
                'name' => 'Manage Projects',
                'slug' => 'manage-projects',
                'description' => 'Can create, edit, and delete projects',
                'category' => 'project-management',
            ],
            [
                'name' => 'Assign Tasks',
                'slug' => 'assign-tasks',
                'description' => 'Can assign tasks to team members',
                'category' => 'project-management',
            ],
            [
                'name' => 'View All Projects',
                'slug' => 'view-all-projects',
                'description' => 'Can view all projects and tasks',
                'category' => 'project-management',
            ],

            // ============================================
            // SYSTEM PERMISSIONS
            // ============================================
            [
                'name' => 'Manage Roles',
                'slug' => 'manage-roles',
                'description' => 'Can create and edit roles and permissions',
                'category' => 'system',
            ],
            [
                'name' => 'View System Logs',
                'slug' => 'view-system-logs',
                'description' => 'Can view system activity logs',
                'category' => 'system',
            ],
            [
                'name' => 'Manage Settings',
                'slug' => 'manage-settings',
                'description' => 'Can configure system settings',
                'category' => 'system',
            ],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        $this->command->info('✅ Created/Updated ' . count($permissions) . ' permissions!');

        // ============================================
        // ASSIGN PERMISSIONS TO ROLES
        // ============================================
        $this->assignPermissionsToRoles();
    }

    private function assignPermissionsToRoles()
    {
        $this->command->info('🔗 Assigning permissions to roles...');

        // Super Admin - ALL permissions
        $superAdmin = Role::where('slug', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->sync(Permission::all()->pluck('id'));
            $this->command->info('   ✅ Super Admin → All permissions');
        }

        // Admin - Most permissions
        $admin = Role::where('slug', 'admin')->first();
        if ($admin) {
            $admin->permissions()->sync(
                Permission::whereIn('slug', [
                    'approve-users', 'manage-users', 'view-all-users',
                    'approve-leaves', 'view-all-leaves',
                    'manage-inventory', 'assign-assets', 'view-inventory',
                    'manage-projects', 'assign-tasks', 'view-all-projects',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Admin → Management permissions');
        }

        // HR Manager
        $hrManager = Role::where('slug', 'hr-manager')->first();
        if ($hrManager) {
            $hrManager->permissions()->sync(
                Permission::whereIn('slug', [
                    'approve-users', 'manage-users', 'view-all-users',
                    'approve-leaves', 'approve-leave-appeals', 'manage-leave-types', 'view-all-leaves',
                    'assign-assets',
                ])->pluck('id')
            );
            $this->command->info('   ✅ HR Manager → User + Leave permissions');
        }

        // Project Manager
        $projectManager = Role::where('slug', 'project-manager')->first();
        if ($projectManager) {
            $projectManager->permissions()->sync(
                Permission::whereIn('slug', [
                    'approve-users',
                    'approve-leaves',
                    'manage-projects', 'assign-tasks', 'view-all-projects',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Project Manager → User approval + Project permissions');
        }

        // Lead Engineer
        $leadEngineer = Role::where('slug', 'lead-engineer')->first();
        if ($leadEngineer) {
            $leadEngineer->permissions()->sync(
                Permission::whereIn('slug', [
                    'approve-users',
                    'approve-leaves',
                    'manage-projects', 'assign-tasks',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Lead Engineer → User approval + Team management');
        }

        // Senior Engineer
        $seniorEngineer = Role::where('slug', 'senior-engineer')->first();
        if ($seniorEngineer) {
            $seniorEngineer->permissions()->sync(
                Permission::whereIn('slug', [
                    'approve-users',
                    'approve-leaves',
                ])->pluck('id')
            );
            $this->command->info('   ✅ Senior Engineer → User + Leave approval');
        }

        $this->command->info('✅ Permission assignments complete!');
    }
}