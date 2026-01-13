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
        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Engineer assigned to
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade'); // HR person who assigned
            $table->date('assigned_date');
            $table->date('return_date')->nullable();
            $table->enum('status', ['active', 'returned', 'damaged', 'lost'])->default('active');
            $table->text('notes')->nullable();
            $table->text('condition_on_assignment')->nullable(); // Condition when assigned
            $table->text('condition_on_return')->nullable(); // Condition when returned
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_assignments');
    }
};
