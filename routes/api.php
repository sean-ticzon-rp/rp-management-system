<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

/**
 * API Routes
 *
 * These routes are loaded by the RouteServiceProvider and all of them will
 * be assigned to the "api" middleware group.
 */

// Health check endpoint for Docker and monitoring
Route::get('/health', function () {
    try {
        // Check database connection
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'disconnected';
    }

    $status = $dbStatus === 'connected' ? 'healthy' : 'unhealthy';
    $statusCode = $dbStatus === 'connected' ? 200 : 503;

    return response()->json([
        'status' => $status,
        'timestamp' => now()->toISOString(),
        'services' => [
            'database' => $dbStatus,
            'cache' => cache()->getStore() instanceof \Illuminate\Contracts\Cache\Store ? 'connected' : 'disconnected',
        ],
        'application' => [
            'name' => config('app.name'),
            'environment' => config('app.env'),
            'debug' => config('app.debug'),
        ],
    ], $statusCode);
})->name('api.health');

// API version endpoint
Route::get('/version', function () {
    return response()->json([
        'version' => config('app.version', '1.0.0'),
        'laravel' => app()->version(),
        'php' => PHP_VERSION,
    ]);
})->name('api.version');
