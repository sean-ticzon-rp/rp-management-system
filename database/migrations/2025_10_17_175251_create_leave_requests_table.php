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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            
            // Employee Information
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who is requesting
            $table->foreignId('leave_type_id')->constrained()->onDelete('restrict'); // What type
            
            // Leave Dates
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_days', 5, 1);                      // 3.0, 1.5 (for half-day), etc.
            
            // Duration Type
            $table->enum('duration', [
                'full_day',           // Full day(s)
                'half_day_am',        // Half day - Morning (8 AM - 12 PM)
                'half_day_pm',        // Half day - Afternoon (1 PM - 5 PM)
                'custom_hours'        // Custom time range
            ])->default('full_day');
            
            // Custom Hours (only if duration = 'custom_hours')
            $table->time('custom_start_time')->nullable();
            $table->time('custom_end_time')->nullable();
            
            // Request Details
            $table->text('reason');                                   // Why they need leave
            $table->string('attachment')->nullable();                 // Medical cert file path
            
            // Emergency Contact During Leave
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->boolean('use_default_emergency_contact')->default(true);
            
            // Availability During Leave (optional)
            $table->enum('availability', [
                'reachable',          // Can respond to urgent matters
                'offline',            // Completely offline
                'emergency_only'      // Only for critical issues
            ])->nullable();
            
            // ============================================
            // APPROVAL WORKFLOW - LEVEL 1: MANAGER
            // ============================================
            $table->foreignId('manager_id')->nullable()->constrained('users'); // Auto-assigned from user.manager_id
            $table->foreignId('manager_approved_by')->nullable()->constrained('users');
            $table->timestamp('manager_approved_at')->nullable();
            $table->text('manager_comments')->nullable();             // Manager's note/reason
            
            // ============================================
            // APPROVAL WORKFLOW - LEVEL 2: HR
            // ============================================
            $table->foreignId('hr_approved_by')->nullable()->constrained('users');
            $table->timestamp('hr_approved_at')->nullable();
            $table->text('hr_comments')->nullable();                  // HR's note/reason
            
            // ============================================
            // STATUS TRACKING
            // ============================================
            $table->enum('status', [
                'pending_manager',    // Just filed, awaiting manager approval
                'pending_hr',         // Manager approved, awaiting HR approval
                'approved',           // Fully approved by HR ✅
                'rejected_by_manager',// Manager rejected ❌
                'rejected_by_hr',     // HR rejected ❌
                'appealed',           // Employee appealed rejection
                'cancelled'           // Employee cancelled request
            ])->default('pending_manager');
            
            // Appeal Information (if employee appeals rejection)
            $table->text('appeal_reason')->nullable();                // Why employee appeals
            $table->timestamp('appealed_at')->nullable();
            
            // Metadata
            $table->timestamps();
            $table->softDeletes();                                    // Soft delete for record keeping
            
            // Indexes for performance
            $table->index('user_id');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};