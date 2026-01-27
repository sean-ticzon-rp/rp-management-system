<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invite_id')->constrained('onboarding_invites')->onDelete('cascade');

            // Personal Information (JSON for flexibility)
            $table->json('personal_info')->nullable(); // Name, birthday, address, etc.
            $table->json('government_ids')->nullable(); // SSS, TIN, PhilHealth, HDMF, Payroll
            $table->json('emergency_contact')->nullable(); // Name, phone, relationship
            $table->json('additional_info')->nullable(); // Any extra fields

            // Completion Tracking
            $table->integer('completion_percentage')->default(0); // 0-100%
            $table->json('completed_sections')->nullable(); // Array of completed section names

            // Status
            $table->enum('status', [
                'draft',              // Candidate is filling out form
                'approved',           // HR approved - onboarding complete
            ])->default('draft');

            // Metadata
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('hr_notes')->nullable();
            $table->text('revision_notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('invite_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_submissions');
    }
};
