<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\PermissionAuditLog;
use App\Models\User;
use App\Models\UserPermissionOverride;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PermissionService
{
    /**
     * Check if actor can manage permissions
     */
    public function canManagePermissions(User $actor): bool
    {
        return $actor->hasPermission('users.assign-permissions');
    }

    /**
     * Check if actor can manage role permissions
     */
    public function canManageRolePermissions(User $actor): bool
    {
        return $actor->hasPermission('system.manage-roles');
    }

    /**
     * Grant extra permission to user (override)
     */
    public function grantToUser(
        User $user,
        Permission|string $permission,
        User $actor,
        ?string $reason = null,
        ?Carbon $expiresAt = null
    ): UserPermissionOverride {
        if (is_string($permission)) {
            $permission = Permission::where('slug', $permission)->firstOrFail();
        }

        // Remove existing override if any
        UserPermissionOverride::where('user_id', $user->id)
            ->where('permission_id', $permission->id)
            ->delete();

        // Create grant override
        $override = UserPermissionOverride::create([
            'user_id' => $user->id,
            'permission_id' => $permission->id,
            'type' => 'grant',
            'reason' => $reason,
            'granted_by' => $actor->id,
            'granted_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        // Log the change
        $this->logChange($user, $permission, 'granted', $actor, [
            'reason' => $reason,
            'expires_at' => $expiresAt?->toDateTimeString(),
        ]);

        // Clear permission cache
        $user->clearPermissionCache();

        return $override;
    }

    /**
     * Revoke permission from user (override - blocks even if role has it)
     */
    public function revokeFromUser(
        User $user,
        Permission|string $permission,
        User $actor,
        ?string $reason = null,
        ?Carbon $expiresAt = null
    ): UserPermissionOverride {
        if (is_string($permission)) {
            $permission = Permission::where('slug', $permission)->firstOrFail();
        }

        // Remove existing override if any
        UserPermissionOverride::where('user_id', $user->id)
            ->where('permission_id', $permission->id)
            ->delete();

        // Create revoke override
        $override = UserPermissionOverride::create([
            'user_id' => $user->id,
            'permission_id' => $permission->id,
            'type' => 'revoke',
            'reason' => $reason,
            'granted_by' => $actor->id,
            'granted_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        // Log the change
        $this->logChange($user, $permission, 'revoked', $actor, [
            'reason' => $reason,
            'expires_at' => $expiresAt?->toDateTimeString(),
        ]);

        // Clear permission cache
        $user->clearPermissionCache();

        return $override;
    }

    /**
     * Remove override (user will get default from role)
     */
    public function removeOverride(User $user, Permission|string $permission, User $actor): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('slug', $permission)->firstOrFail();
        }

        // Delete override
        UserPermissionOverride::where('user_id', $user->id)
            ->where('permission_id', $permission->id)
            ->delete();

        // Log the change
        $this->logChange($user, $permission, 'override_removed', $actor);

        // Clear permission cache
        $user->clearPermissionCache();
    }

    /**
     * Sync multiple overrides at once
     */
    public function syncUserOverrides(
        User $user,
        array $grants,  // permission IDs to grant
        array $revokes, // permission IDs to revoke
        User $actor
    ): void {
        // Get all permissions that should have overrides
        $allOverrideIds = array_merge($grants, $revokes);

        // Remove overrides not in the new list
        UserPermissionOverride::where('user_id', $user->id)
            ->whereNotIn('permission_id', $allOverrideIds)
            ->delete();

        // Process grants
        foreach ($grants as $permissionId) {
            $permission = Permission::findOrFail($permissionId);
            $this->grantToUser($user, $permission, $actor);
        }

        // Process revokes
        foreach ($revokes as $permissionId) {
            $permission = Permission::findOrFail($permissionId);
            $this->revokeFromUser($user, $permission, $actor);
        }

        // Clear permission cache
        $user->clearPermissionCache();
    }

    /**
     * Reset user to role defaults (remove all overrides)
     */
    public function resetToRoleDefaults(User $user, User $actor): void
    {
        // Get all overrides before deletion for logging
        $overrides = UserPermissionOverride::where('user_id', $user->id)->get();

        // Delete all overrides
        UserPermissionOverride::where('user_id', $user->id)->delete();

        // Log each removal
        foreach ($overrides as $override) {
            $this->logChange($user, $override->permission, 'override_removed', $actor, [
                'reset_to_defaults' => true,
                'previous_type' => $override->type,
            ]);
        }

        // Clear permission cache
        $user->clearPermissionCache();
    }

    /**
     * Get permission matrix for UI
     */
    public function getUserPermissionMatrix(User $user): array
    {
        return $user->getPermissionsGroupedForUI();
    }

    /**
     * Get all permissions grouped for UI
     */
    public function getAllPermissionsGrouped(): Collection
    {
        return Permission::active()
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy(function ($permission) {
                return $permission->group ?? $permission->category ?? 'general';
            });
    }

    /**
     * Clean up expired overrides (for scheduled command)
     */
    public function cleanupExpiredOverrides(): int
    {
        $expiredOverrides = UserPermissionOverride::expired()->get();

        $count = 0;

        foreach ($expiredOverrides as $override) {
            // Log the cleanup
            $this->logChange(
                $override->user,
                $override->permission,
                'override_removed',
                $override->user, // System action, use user as actor
                ['reason' => 'expired', 'expired_at' => $override->expires_at]
            );

            $override->delete();
            $override->user->clearPermissionCache();
            $count++;
        }

        return $count;
    }

    /**
     * Log permission change
     */
    protected function logChange(
        User $user,
        Permission $permission,
        string $action,
        User $actor,
        ?array $context = null
    ): void {
        PermissionAuditLog::create([
            'user_id' => $user->id,
            'permission_id' => $permission->id,
            'action' => $action,
            'actor_id' => $actor->id,
            'context' => $context,
        ]);
    }
}
