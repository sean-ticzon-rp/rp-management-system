<?php

namespace App\Console\Commands;

use App\Services\PermissionService;
use Illuminate\Console\Command;

class CleanupExpiredPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:cleanup-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove expired permission overrides';

    /**
     * Execute the console command.
     */
    public function handle(PermissionService $permissionService): int
    {
        $this->info('🧹 Cleaning up expired permission overrides...');

        $count = $permissionService->cleanupExpiredOverrides();

        if ($count > 0) {
            $this->info("✅ Removed {$count} expired permission override(s)");
        } else {
            $this->info('✅ No expired permission overrides found');
        }

        return Command::SUCCESS;
    }
}
