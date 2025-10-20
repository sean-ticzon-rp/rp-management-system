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
        'appeal_reason',
        'appealed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_days' => 'decimal:1',
        'use_default_emergency_contact' => 'boolean',
        'manager_approved_at' => 'datetime',
        'hr_approved_at' => 'datetime',
        'appealed_at' => 'datetime',
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

    public function scopeAppealed($query)
    {
        return $query->where('status', 'appealed');
    }

    public function scopeForManager($query, $managerId)
    {
        return $query->where('manager_id', $managerId);
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

    public function canBeAppealed()
    {
        return $this->status === 'rejected_by_manager';
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending_manager', 'pending_hr']);
    }

    // ============================================
    // APPROVAL WORKFLOW METHODS
    // ============================================

    public function approveByManager($managerId, $comments = null)
    {
        $this->update([
            'status' => 'pending_hr',
            'manager_approved_by' => $managerId,
            'manager_approved_at' => now(),
            'manager_comments' => $comments,
        ]);

        // TODO: Send email to HR
        // TODO: Send update email to employee
    }

    public function rejectByManager($managerId, $reason)
    {
        $this->update([
            'status' => 'rejected_by_manager',
            'manager_approved_by' => $managerId,
            'manager_approved_at' => now(),
            'manager_comments' => $reason,
        ]);

        // TODO: Send email to employee (with appeal option)
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
        // TODO: Send FYI email to manager
        // TODO: Add to team calendar
    }

    public function rejectByHr($hrUserId, $reason)
    {
        $this->update([
            'status' => 'rejected_by_hr',
            'hr_approved_by' => $hrUserId,
            'hr_approved_at' => now(),
            'hr_comments' => $reason,
        ]);

        // TODO: Send rejection email to employee
        // TODO: Send FYI email to manager
    }

    /**
     * ✅ NEW: Employee appeals a manager rejection
     */
    public function appeal($reason)
    {
        if (!$this->canBeAppealed()) {
            throw new \Exception('This request cannot be appealed.');
        }

        $this->update([
            'status' => 'appealed',
            'appeal_reason' => $reason,
            'appealed_at' => now(),
        ]);

        // TODO: Send escalation email to HR
        // TODO: Send confirmation email to employee
    }

    public function cancel()
    {
        if (!$this->canBeCancelled()) {
            throw new \Exception('This request cannot be cancelled.');
        }

        $this->update([
            'status' => 'cancelled',
        ]);

        // TODO: Send cancellation email to manager and HR
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
            'appealed' => 'orange',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'pending_manager' => 'Pending Manager Approval',
            'pending_hr' => 'Pending HR Approval',
            'approved' => 'Approved',
            'rejected_by_manager' => 'Rejected by Manager',
            'rejected_by_hr' => 'Rejected by HR',
            'appealed' => 'Under Appeal',
            'cancelled' => 'Cancelled',
            default => 'Unknown',
        };
    }
}