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
        Schema::table('onboarding_documents', function (Blueprint $table) {
            $table->index('deleted_at'); // Add index for soft delete query performance
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('onboarding_documents', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
        });
    }
};
