<?php

namespace Database\Seeders;

use App\Models\CalendarEventType;
use Illuminate\Database\Seeder;

class CalendarEventTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $eventTypes = [
            [
                'name' => 'Leave',
                'slug' => 'leave',
                'color' => '#3B82F6', // Blue
                'icon' => 'calendar-off',
                'description' => 'Employee leave and time off',
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Announcement',
                'slug' => 'announcement',
                'color' => '#F59E0B', // Amber
                'icon' => 'megaphone',
                'description' => 'Company-wide announcements and notices',
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Holiday',
                'slug' => 'holiday',
                'color' => '#10B981', // Green
                'icon' => 'party-popper',
                'description' => 'Public holidays and office closures',
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Birthday',
                'slug' => 'birthday',
                'color' => '#EC4899', // Pink
                'icon' => 'cake',
                'description' => 'Employee birthdays',
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Company Event',
                'slug' => 'event',
                'color' => '#8B5CF6', // Purple
                'icon' => 'calendar-star',
                'description' => 'Company events, meetings, and gatherings',
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Training',
                'slug' => 'training',
                'color' => '#06B6D4', // Cyan
                'icon' => 'graduation-cap',
                'description' => 'Training sessions and workshops',
                'is_system' => false,
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Other',
                'slug' => 'other',
                'color' => '#6B7280', // Gray
                'icon' => 'calendar',
                'description' => 'Other calendar events',
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 99,
            ],
        ];

        foreach ($eventTypes as $eventType) {
            CalendarEventType::updateOrCreate(
                ['slug' => $eventType['slug']],
                $eventType
            );
        }

        $this->command->info('✅ Calendar event types seeded successfully!');
    }
}
