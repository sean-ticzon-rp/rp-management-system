<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'total_days',
        'duration',
        'custom_start_time',
        'custom_end_time',
        'reason',
        'attachment',
        'emergency_contact_name',
        'emergency_contact_phone',
        'use_default_emergency_contact',
        'availability',
        'manager_id',
        'manager_approved_by',
        'manager_approved_at',
        'manager_comments',
        'hr_approved_by',
        'hr_approved_at',
        'hr_comments',
        'status',
        'cancellation_reason',
        'cancellation_requested_at',
        'cancelled_by',
        'cancellation_approved_by',
        'cancellation_approved_at',
        'cancellation_hr_comments',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_days' => 'decimal:1',
        'use_default_emergency_contact' => 'boolean',
        'manager_approved_at' => 'datetime',
        'hr_approved_at' => 'datetime',
        'cancellation_requested_at' => 'datetime',
        'cancellation_approved_at' => 'datetime',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function managerApprover()
    {
        return $this->belongsTo(User::class, 'manager_approved_by');
    }

    public function hrApprover()
    {
        return $this->belongsTo(User::class, 'hr_approved_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopePendingManager($query)
    {
        return $query->where('status', 'pending_manager');
    }

    public function scopePendingHr($query)
    {
        return $query->where('status', 'pending_hr');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->whereIn('status', ['rejected_by_manager', 'rejected_by_hr']);
    }

    public function scopeCurrentYear($query)
    {
        return $query->whereYear('start_date', now()->year);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>=', now())
            ->where('status', 'approved')
            ->orderBy('start_date');
    }

    // ============================================
    // STATUS CHECK METHODS
    // ============================================

    public function isPendingManager()
    {
        return $this->status === 'pending_manager';
    }

    public function isPendingHr()
    {
        return $this->status === 'pending_hr';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return in_array($this->status, ['rejected_by_manager', 'rejected_by_hr']);
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending_manager', 'pending_hr']);
    }

    /**
     * Check if employee can request cancellation for this approved leave
     */
    public function canRequestCancellation()
    {
        // Can request cancellation if:
        // 1. Leave is approved
        // 2. Start date is in the future (hasn't started yet)
        // 3. Not already cancelled or pending cancellation
        return $this->status === 'approved' 
            && $this->start_date->isFuture()
            && !in_array($this->status, ['cancelled', 'pending_cancellation']);
    }

    /**
     * Employee requests to cancel an approved leave
     */
    public function requestCancellation($reason)
    {
        if (!$this->canRequestCancellation()) {
            throw new \Exception('This leave cannot be cancelled. It may have already started or is not approved.');
        }

        $this->update([
            'status' => 'pending_cancellation',
            'cancellation_reason' => $reason,
            'cancellation_requested_at' => now(),
            'cancelled_by' => auth()->id(),
        ]);

        // TODO: Send notification to HR
        // TODO: Send confirmation email to employee
    }

    /**
     * HR approves the cancellation request and restores balance
     */
    public function approveCancellation($hrUserId, $comments = null)
    {
        if ($this->status !== 'pending_cancellation') {
            throw new \Exception('This leave is not pending cancellation approval.');
        }

        $this->update([
            'status' => 'cancelled',
            'cancellation_approved_by' => $hrUserId,
            'cancellation_approved_at' => now(),
            'cancellation_hr_comments' => $comments,
        ]);

        // ✅ RESTORE BALANCE
        $balance = LeaveBalance::where('user_id', $this->user_id)
            ->where('leave_type_id', $this->leave_type_id)
            ->where('year', $this->start_date->year)
            ->first();

        if ($balance) {
            $balance->restoreDays($this->total_days);
        }

        // TODO: Send approval email to employee
        // TODO: Update team calendar
    }

    /**
     * HR rejects the cancellation request (leave stays approved)
     */
    public function rejectCancellation($hrUserId, $reason)
    {
        if ($this->status !== 'pending_cancellation') {
            throw new \Exception('This leave is not pending cancellation approval.');
        }

        $this->update([
            'status' => 'approved', // Revert back to approved
            'cancellation_approved_by' => $hrUserId,
            'cancellation_approved_at' => now(),
            'cancellation_hr_comments' => $reason,
        ]);

        // TODO: Send rejection email to employee (leave stays approved)
    }

    /**
     * Get cancellation status badge info
     */
    public function getCancellationStatusAttribute()
    {
        if ($this->status === 'pending_cancellation') {
            return [
                'label' => 'Cancellation Pending',
                'color' => 'orange',
                'description' => 'Employee requested to cancel this approved leave'
            ];
        }

        if ($this->status === 'cancelled' && $this->cancellation_requested_at) {
            return [
                'label' => 'Cancelled by Employee',
                'color' => 'gray',
                'description' => 'Leave was cancelled after approval'
            ];
        }

        return null;
    }

    // ============================================
    // APPROVAL WORKFLOW METHODS
    // ============================================

    public function approveByManager($approverId, $comments = null)
    {
        $this->update([
            'status' => 'pending_hr',
            'manager_approved_by' => $approverId,
            'manager_approved_at' => now(),
            'manager_comments' => $comments,
        ]);

        // TODO: Send email to HR
        // TODO: Send update email to employee
    }

    public function rejectByManager($approverId, $reason)
    {
        // ✅ Manager rejection is FINAL (no appeals)
        $this->update([
            'status' => 'rejected_by_manager',
            'manager_approved_by' => $approverId,
            'manager_approved_at' => now(),
            'manager_comments' => $reason,
        ]);

        // TODO: Send FINAL rejection email to employee
        // TODO: Send FYI email to HR
    }

    public function approveByHr($hrUserId, $comments = null)
    {
        $this->update([
            'status' => 'approved',
            'hr_approved_by' => $hrUserId,
            'hr_approved_at' => now(),
            'hr_comments' => $comments,
        ]);

        // Deduct from leave balance
        $this->deductFromBalance();

        // TODO: Send success email to employee
        // TODO: Send FYI email to approver
        // TODO: Add to team calendar
    }

    public function rejectByHr($hrUserId, $reason)
    {
        // ✅ HR rejection is ALWAYS final
        $this->update([
            'status' => 'rejected_by_hr',
            'hr_approved_by' => $hrUserId,
            'hr_approved_at' => now(),
            'hr_comments' => $reason,
        ]);

        // TODO: Send FINAL rejection email to employee
        // TODO: Send FYI email to first approver if any
    }

    public function cancel()
    {
        if (!$this->canBeCancelled()) {
            throw new \Exception('This request cannot be cancelled.');
        }

        $this->update([
            'status' => 'cancelled',
        ]);

        // TODO: Send cancellation email to HR and approver
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    protected function deductFromBalance()
    {
        $balance = LeaveBalance::where('user_id', $this->user_id)
            ->where('leave_type_id', $this->leave_type_id)
            ->where('year', $this->start_date->year)
            ->first();

        if ($balance) {
            $balance->deductDays($this->total_days);
        }
    }

    public function requiresMedicalCertificate()
    {
        return $this->leaveType->requiresMedicalCertForDays($this->total_days);
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending_manager' => 'yellow',
            'pending_hr' => 'blue',
            'approved' => 'green',
            'rejected_by_manager', 'rejected_by_hr' => 'red',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'pending_manager' => 'Pending Review',
            'pending_hr' => 'Pending HR Approval',
            'approved' => 'Approved',
            'rejected_by_manager' => 'Rejected',
            'rejected_by_hr' => 'Rejected by HR',
            'cancelled' => 'Cancelled',
            default => 'Unknown',
        };
    }
}