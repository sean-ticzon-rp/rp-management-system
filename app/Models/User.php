<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
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
        'profile_picture',  // Add after 'name'
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'email',
        'phone_number',
        'personal_mobile',  // Add
        'work_email',
        'personal_email',
        'gender',
        'civil_status',  // Add this after 'gender'
        'birthday',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postal_code',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_mobile',  // Add
        'emergency_contact_relationship',
        'sss_number',  // Add
        'tin_number',  // Add
        'hdmf_number',  // Add
        'philhealth_number',  // Add
        'payroll_account',  // Add
        'employee_id',
        'department',
        'position',
        'hire_date',
        'employment_status',
        'employment_type',  // Add
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

    // Roles & Permissions
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

    // Projects & Tasks
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

    // OLD SYSTEM: Asset Assignments (inventory_item based)
    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function currentAssets()
    {
        return $this->hasMany(AssetAssignment::class)->where('status', 'active');
    }

    // NEW SYSTEM: Individual Asset Assignments (asset based)
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
            'user_id',      // Foreign key on individual_asset_assignments
            'id',           // Foreign key on assets
            'id',           // Local key on users
            'asset_id'      // Local key on individual_asset_assignments
        )->where('individual_asset_assignments.status', 'active')
         ->whereNull('individual_asset_assignments.actual_return_date');
    }
}