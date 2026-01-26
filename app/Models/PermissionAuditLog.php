<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermissionAuditLog extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // Only created_at, no updated_at

    protected $fillable = [
        'user_id',
        'permission_id',
        'action',
        'actor_id',
        'context',
    ];

    protected $casts = [
        'context' => 'array',
        'created_at' => 'datetime',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * The user who was affected by this change
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The permission that was changed
     */
    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }

    /**
     * The user who made the change
     */
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForPermission($query, int $permissionId)
    {
        return $query->where('permission_id', $permissionId);
    }

    public function scopeByActor($query, int $actorId)
    {
        return $query->where('actor_id', $actorId);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
