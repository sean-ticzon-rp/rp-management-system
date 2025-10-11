<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super-admin',
                'description' => 'Has full access to all features',
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Can manage users and system settings',
            ],
            [
                'name' => 'HR Manager',
                'slug' => 'hr-manager',
                'description' => 'Can manage employees and asset assignments',
            ],
            [
                'name' => 'Inventory Manager',
                'slug' => 'inventory-manager',
                'description' => 'Can manage inventory items and stock',
            ],
            [
                'name' => 'Project Manager',
                'slug' => 'project-manager',
                'description' => 'Can create and manage projects',
            ],
            [
                'name' => 'Engineer',
                'slug' => 'engineer',
                'description' => 'Can be assigned to projects and tasks',
            ],
            [
                'name' => 'Employee',
                'slug' => 'employee',
                'description' => 'Basic employee access',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}