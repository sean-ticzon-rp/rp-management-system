<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Roles that have this permission
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'permission_role')
                    ->withTimestamps();
    }

    /**
     * Users who have this permission (direct assignment/override)
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'permission_user')
                    ->withPivot(['granted', 'granted_by', 'granted_at', 'reason'])
                    ->withTimestamps();
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if a specific role has this permission
     */
    public function isGrantedToRole($roleId)
    {
        return $this->roles()->where('role_id', $roleId)->exists();
    }

    /**
     * Check if a specific user has this permission (override)
     */
    public function isGrantedToUser($userId)
    {
        $pivot = $this->users()->where('user_id', $userId)->first();
        return $pivot ? $pivot->pivot->granted : null;
    }
}