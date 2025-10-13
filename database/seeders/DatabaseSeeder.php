<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        // Run all seeders
        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
            InventoryItemSeeder::class,
            AssetSeeder::class,  // ADD THIS LINE
            ProjectSeeder::class,
        ]);
    }
}