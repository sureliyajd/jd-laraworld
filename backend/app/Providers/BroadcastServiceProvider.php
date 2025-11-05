<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;
use Log;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register broadcasting auth endpoint with API auth middleware
        Broadcast::routes(['middleware' => ['auth:api']]);

        // Load channel authorization callbacks
        $channelsFile = base_path('routes/channels.php');
        if (file_exists($channelsFile)) {
            require $channelsFile;
        }
    }
}


