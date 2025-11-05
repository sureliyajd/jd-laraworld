<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

// Authorize private user channel: user.{id}
Broadcast::channel('user.{id}', function ($user, $id) {
    Log::info('Broadcasting channel authorization', [
        'user_id' => $user->id,
        'requested_id' => $id,
        'authorized' => (int) $user->id === (int) $id,
        'channel' => "user.{$id}"
    ]);
    return (int) $user->id === (int) $id;
});


