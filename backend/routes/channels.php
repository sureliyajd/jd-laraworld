<?php

use Illuminate\Support\Facades\Broadcast;

// Authorize private user channel: user.{id}
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


