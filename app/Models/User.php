<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'profile_picture',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'email',
        'phone_number',
        'personal_mobile',
        'work_email',
        'personal_email',
        'gender',
        'civil_status',
        'birthday',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_mobile',
        'emergency_contact_relationship',
        'sss_number',
        'tin_number',
        'hdmf_number',
        'philhealth_number',
        'payroll_account',
        'employee_id',
        'department',
        'position',
        'manager_id',        // ✅ NEW - For leave approval workflow
        'hire_date',
        'employment_status',
        'employment_type',
        'account_status',
        'approved_by',
        'approved_at',
        'password',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birthday' => 'date',
        'hire_date' => 'date',
        'password' => 'hashed',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factory_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ============================================
    // ROLES & PERMISSIONS
    // ============================================

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole($role)
    {
        return $this->roles()->where('slug', $role)->exists();
    }

    public function hasPermission($permission)
    {
        return $this->roles()->whereHas('permissions', function ($query) use ($permission) {
            $query->where('slug', $permission);
        })->exists();
    }

    // ============================================
    // PROJECTS & TASKS
    // ============================================

    public function ownedProjects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    // ============================================
    // ASSET ASSIGNMENTS - OLD SYSTEM
    // ============================================

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function currentAssets()
    {
        return $this->hasMany(AssetAssignment::class)->where('status', 'active');
    }

    // ============================================
    // ASSET ASSIGNMENTS - NEW SYSTEM
    // ============================================

    public function individualAssetAssignments()
    {
        return $this->hasMany(IndividualAssetAssignment::class);
    }

    public function currentIndividualAssets()
    {
        return $this->hasMany(IndividualAssetAssignment::class)
                    ->where('status', 'active')
                    ->whereNull('actual_return_date')
                    ->with('asset.inventoryItem');
    }

    public function assignedAssets()
    {
        return $this->hasManyThrough(
            Asset::class,
            IndividualAssetAssignment::class,
            'user_id',
            'id',
            'id',
            'asset_id'
        )->where('individual_asset_assignments.status', 'active')
         ->whereNull('individual_asset_assignments.actual_return_date');
    }

    // ============================================
    // LEAVE MANAGEMENT RELATIONSHIPS
    // ============================================

    /**
     * The manager who approves this user's leaves
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Users who report to this user (if this user is a manager)
     */
    public function subordinates()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * This user's leave balances
     */
    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    /**
     * This user's leave balances for current year
     */
    public function currentYearLeaveBalances()
    {
        return $this->hasMany(LeaveBalance::class)
                    ->where('year', now()->year)
                    ->with('leaveType');
    }

    /**
     * This user's leave requests
     */
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * This user's pending leave requests
     */
    public function pendingLeaveRequests()
    {
        return $this->hasMany(LeaveRequest::class)
                    ->whereIn('status', ['pending_manager', 'pending_hr']);
    }

    /**
     * This user's approved leave requests
     */
    public function approvedLeaveRequests()
    {
        return $this->hasMany(LeaveRequest::class)
                    ->where('status', 'approved');
    }

    /**
     * Leave requests waiting for this user's approval (if they're a manager)
     */
    public function leaveRequestsToApprove()
    {
        return $this->hasMany(LeaveRequest::class, 'manager_id')
                    ->where('status', 'pending_manager')
                    ->with(['user', 'leaveType']);
    }

    /**
     * Get total available leave days for a specific leave type this year
     */
    public function getLeaveBalance($leaveTypeId)
    {
        return $this->leaveBalances()
                    ->where('leave_type_id', $leaveTypeId)
                    ->where('year', now()->year)
                    ->first();
    }

    /**
     * Check if this user is a manager (has subordinates)
     */
    public function isManager()
    {
        return $this->subordinates()->exists();
    }

    /**
     * Get count of pending leave approvals (if this user is a manager)
     */
    public function getPendingLeaveApprovalsCountAttribute()
    {
        return $this->leaveRequestsToApprove()->count();
    }
}