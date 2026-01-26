<?php

use App\Http\Controllers\CalendarController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

Route::middleware(['auth:sanctum'])->group(function () {

    // ============================================
    // 📅 CALENDAR API ROUTES
    // ============================================
    Route::prefix('calendar')->name('api.calendar.')->group(function () {
        // Get calendar events
        Route::get('/events', [CalendarController::class, 'events'])->name('events');

        // Get calendar statistics
        Route::get('/statistics', [CalendarController::class, 'statistics'])->name('statistics');

        // Get users on leave for a specific date
        Route::get('/users-on-leave', [CalendarController::class, 'usersOnLeave'])->name('users-on-leave');

        // Get event types (with optional counts)
        Route::get('/event-types', [CalendarController::class, 'eventTypes'])->name('event-types');
    });
});
