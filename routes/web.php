<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserImportController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ============================================
// API Routes for Postman Testing (JSON Responses)
// ============================================
Route::prefix('api')->name('api.')->group(function () {
    
    // Get all inventory items
    Route::get('/inventory', function () {
        $items = \App\Models\InventoryItem::with(['category', 'creator', 'assets'])
            ->get();
        
        return response()->json([
            'success' => true,
            'count' => $items->count(),
            'data' => $items
        ]);
    })->name('inventory.index');
    
    // Get single inventory item by ID
    Route::get('/inventory/{id}', function ($id) {
        $item = \App\Models\InventoryItem::with(['category', 'creator', 'assets.currentAssignment.user'])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    })->name('inventory.show');
    
});

// ============================================
// API Routes for Postman Testing (JSON Responses)
// ============================================
Route::prefix('api')->name('api.')->group(function () {
    
    // Get all inventory items
    Route::get('/inventory', function () {
        $items = \App\Models\InventoryItem::with(['category', 'creator', 'assets'])
            ->get();
        
        return response()->json([
            'success' => true,
            'count' => $items->count(),
            'data' => $items
        ]);
    })->name('inventory.index');
    
    // Get single inventory item by ID
    Route::get('/inventory/{id}', function ($id) {
        $item = \App\Models\InventoryItem::with(['category', 'creator', 'assets.currentAssignment.user'])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    })->name('inventory.show');
    
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Pending Approval Page (must be outside auth middleware but require authentication)
Route::middleware('auth')->get('/account/pending', function () {
    return Inertia::render('Auth/PendingApproval');
})->name('account.pending');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::post('/profile', [SettingsController::class, 'updateProfile'])->name('update-profile');
        Route::put('/password', [SettingsController::class, 'updatePassword'])->name('update-password');
        Route::delete('/account', [SettingsController::class, 'destroy'])->name('destroy');
    });

    // Inventory
    Route::post('/inventory/delete-assets', [InventoryController::class, 'deleteSelectedAssets'])->name('inventory.delete-assets');
    Route::resource('inventory', InventoryController::class);

    // Users - Import routes MUST come BEFORE resource routes
    Route::get('/users/import', [UserImportController::class, 'show'])->name('users.import');
    Route::post('/users/import', [UserImportController::class, 'import'])->name('users.import.store');
    
    // ✅ NEW: User Approval Routes (BEFORE resource routes)
    Route::post('/users/{user}/approve', [UserController::class, 'approve'])->name('users.approve');
    Route::post('/users/{user}/reject', [UserController::class, 'reject'])->name('users.reject');
    
    Route::resource('users', UserController::class);

    // Projects
    Route::resource('projects', ProjectController::class);

    // Tasks
    Route::prefix('tasks')->name('tasks.')->group(function () {
        Route::get('/', [TaskController::class, 'index'])->name('index');
        Route::get('/kanban', [TaskController::class, 'kanban'])->name('kanban');
        Route::get('/create', [TaskController::class, 'create'])->name('create');
        Route::post('/', [TaskController::class, 'store'])->name('store');
        Route::put('/{task}', [TaskController::class, 'update'])->name('update');
        Route::patch('/{task}/status', [TaskController::class, 'updateStatus'])->name('updateStatus');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
    });

    // Individual Assets (NEW system - tracks specific physical items)
    // ✅ IMPORTANT: Specific routes MUST come BEFORE dynamic {asset} routes
    Route::prefix('individual-assets')->name('individual-assets.')->group(function () {
        Route::get('/', [AssetController::class, 'index'])->name('index');
        
        // Specific routes FIRST
        Route::get('/assign/{asset?}', [AssetController::class, 'assignForm'])->name('assign');
        Route::post('/assign', [AssetController::class, 'assign'])->name('store-assignment');
        Route::post('/lookup', [AssetController::class, 'lookup'])->name('lookup');
        
        // Dynamic routes LAST
        Route::get('/{asset}/edit', [AssetController::class, 'edit'])->name('edit');
        Route::put('/{asset}', [AssetController::class, 'update'])->name('update');
        Route::post('/{assignment}/return', [AssetController::class, 'return'])->name('return');
        Route::get('/{asset}', [AssetController::class, 'show'])->name('show');
    });
});

require __DIR__.'/auth.php';