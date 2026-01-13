<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Force HTTPS URLs in production
        if (config('app.env') === 'production' || request()->isSecure()) {
            URL::forceScheme('https');
        }
        
        Vite::prefetch(concurrency: 3);
        
        // 🎯 Register User Observer
        User::observe(UserObserver::class);
    }
}