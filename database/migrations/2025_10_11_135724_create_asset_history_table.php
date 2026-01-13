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
        Schema::create('asset_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Who it was assigned to
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade'); // Who did the action
            $table->string('action'); // 'assigned', 'returned', 'maintenance', 'damaged', 'repaired', 'retired'
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Additional data (condition, location change, etc.)
            $table->timestamp('action_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_history');
    }
};
