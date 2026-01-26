<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calendar_event_types', function (Blueprint $table) {
            $table->id();

            // Event type details
            $table->string('name'); // Display name: "Leave", "Announcement", etc.
            $table->string('slug')->unique(); // machine-readable: "leave", "announcement"
            $table->string('color'); // Hex color for calendar display
            $table->string('icon')->nullable(); // Lucide icon name
            $table->text('description')->nullable();

            // Configuration
            $table->boolean('is_system')->default(false); // System types can't be deleted
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            // Indexes
            $table->index('slug');
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_event_types');
    }
};
