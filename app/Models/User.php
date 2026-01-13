<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

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
        'manager_id',
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
        'approved_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factory_recovery_codes',
        'remember_token',
    ];

    // ✅ ADD THESE APPENDS
    protected $appends = [
        'can_approve_users',
        'can_manage_users',
        'can_approve_leaves',
        'can_manage_inventory',
        'can_manage_projects',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ============================================
    // ROLES RELATIONSHIP
    // ============================================

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole($role)
    {
        return $this->roles()->where('slug', $role)->exists();
    }

    // ============================================
    // PERMISSIONS RELATIONSHIP
    // ============================================

    /**
     * Direct permissions assigned to this user (overrides)
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_user')
                    ->withPivot(['granted', 'granted_by', 'granted_at', 'reason'])
                    ->withTimestamps();
    }

    /**
     * Check if user has a specific permission
     * Checks: 1) Direct user permission override, 2) Role permissions
     */
    public function hasPermission($permissionSlug): bool
    {
        // Check if user has direct permission assignment (override)
        $userPermission = $this->permissions()
            ->where('slug', $permissionSlug)
            ->first();

        if ($userPermission) {
            // If user has direct assignment, use that (granted true/false)
            return $userPermission->pivot->granted;
        }

        // Otherwise, check role permissions
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissionSlug) {
                $query->where('slug', $permissionSlug);
            })
            ->exists();
    }

    // ============================================
    // ✅ PERMISSION ACCESSORS (for frontend)
    // ============================================

    /**
     * Check if user can approve new user accounts (Senior/PM/Lead/HR/Admin)
     */
    public function getCanApproveUsersAttribute(): bool
    {
        return $this->hasPermission('approve-users');
    }

    /**
     * Check if user can manage users (view all, edit, delete) - HR/Admin ONLY
     */
    public function getCanManageUsersAttribute(): bool
    {
        return $this->roles()->whereIn('slug', [
            'super-admin',
            'admin',
            'hr-manager'
        ])->exists();
    }

    /**
     * Check if user can approve leave requests
     */
    public function getCanApproveLeavesAttribute(): bool
    {
        return $this->hasPermission('approve-leaves');
    }

    /**
     * Check if user can manage inventory
     */
    public function getCanManageInventoryAttribute(): bool
    {
        return $this->hasPermission('manage-inventory');
    }

    /**
     * Check if user can manage projects
     */
    public function getCanManageProjectsAttribute(): bool
    {
        return $this->hasPermission('manage-projects');
    }

    // ============================================
    // ✅ PERMISSION METHODS (for backend logic)
    // ============================================

    /**
     * Check if user can approve new user accounts
     */
    public function canApproveUsers(): bool
    {
        return $this->hasPermission('approve-users');
    }

    /**
     * Check if user can approve leave requests
     */
    public function canApproveLeaves(): bool
    {
        return $this->hasPermission('approve-leaves');
    }

    /**
     * Check if user can manage inventory
     */
    public function canManageInventory(): bool
    {
        return $this->hasPermission('manage-inventory');
    }

    /**
     * Check if user can manage projects
     */
    public function canManageProjects(): bool
    {
        return $this->hasPermission('manage-projects');
    }

    /**
     * Grant a permission directly to this user
     */
    public function grantPermission($permissionSlug, $grantedBy = null, $reason = null)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();
        
        if (!$permission) {
            return false;
        }

        $this->permissions()->syncWithoutDetaching([
            $permission->id => [
                'granted' => true,
                'granted_by' => $grantedBy ?? auth()->id(),
                'granted_at' => now(),
                'reason' => $reason,
            ]
        ]);

        return true;
    }

    /**
     * Revoke a permission directly from this user
     */
    public function revokePermission($permissionSlug, $revokedBy = null, $reason = null)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();
        
        if (!$permission) {
            return false;
        }

        $this->permissions()->syncWithoutDetaching([
            $permission->id => [
                'granted' => false,
                'granted_by' => $revokedBy ?? auth()->id(),
                'granted_at' => now(),
                'reason' => $reason,
            ]
        ]);

        return true;
    }

    /**
     * Remove direct permission assignment (revert to role-based)
     */
    public function clearPermissionOverride($permissionSlug)
    {
        $permission = Permission::where('slug', $permissionSlug)->first();
        
        if ($permission) {
            $this->permissions()->detach($permission->id);
        }
    }

    /**
     * Get all user permissions (from roles + direct assignments)
     */
    public function getAllPermissions()
    {
        $rolePermissions = $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');

        $userPermissions = $this->permissions;

        return $rolePermissions->merge($userPermissions)->unique('id');
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

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function subordinates()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function currentYearLeaveBalances()
    {
        return $this->hasMany(LeaveBalance::class)
                    ->where('year', now()->year)
                    ->with('leaveType');
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function pendingLeaveRequests()
    {
        return $this->hasMany(LeaveRequest::class)
                    ->whereIn('status', ['pending_manager', 'pending_hr']);
    }

    public function approvedLeaveRequests()
    {
        return $this->hasMany(LeaveRequest::class)
                    ->where('status', 'approved');
    }

    public function leaveRequestsToApprove()
    {
        return $this->hasMany(LeaveRequest::class, 'manager_id')
                    ->where('status', 'pending_manager')
                    ->with(['user', 'leaveType']);
    }

    public function getLeaveBalance($leaveTypeId)
    {
        return $this->leaveBalances()
                    ->where('leave_type_id', $leaveTypeId)
                    ->where('year', now()->year)
                    ->first();
    }

    public function isManager()
    {
        return $this->subordinates()->exists();
    }

    public function getPendingLeaveApprovalsCountAttribute()
    {
        return $this->leaveRequestsToApprove()->count();
    }
}