<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('family.{familyId}', function ($user, $familyId) {
    return (int) $user->family_id === (int) $familyId;
});
