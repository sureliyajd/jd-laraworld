<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        parent::boot();

        // Horizon::routeSmsNotificationsTo('15556667777');
        // Horizon::routeMailNotificationsTo('example@example.com');
        // Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');
    }

    /**
     * Register the Horizon gate.
     *
     * This gate determines who can access Horizon in non-local environments.
     * Allow any authenticated user to access Horizon.
     */
    protected function gate(): void
    {
        Gate::define('viewHorizon', function ($user = null) {
            // Allow access if user is authenticated
            // In local environment, allow all authenticated users
            if (app()->environment('local')) {
                return $user !== null;
            }
            
            // In production, you can restrict access to specific users or roles
            // For now, allow all authenticated users
            // You can customize this based on your requirements:
            // return $user && $user->hasRole('super_admin');
            return $user !== null;
        });
    }
}
