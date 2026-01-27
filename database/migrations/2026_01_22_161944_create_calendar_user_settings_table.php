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
        Schema::create('calendar_user_settings', function (Blueprint $table) {
            $table->id();

            // User relationship
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');

            // View preferences
            $table->enum('default_view', ['month', 'week', 'day'])->default('month');
            $table->boolean('show_weekends')->default(true);

            // Filter preferences (stored as JSON)
            $table->json('visible_event_types')->nullable(); // Array of event type slugs to show
            $table->json('default_filters')->nullable(); // Saved filter state

            $table->timestamps();

            // Index
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_user_settings');
    }
};
