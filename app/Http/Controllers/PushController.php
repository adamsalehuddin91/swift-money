<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// Stores/removes the browser's Web-Push subscription for the logged-in user.
class PushController extends Controller
{
    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'endpoint'        => 'required|string',
            'keys.p256dh'     => 'required|string',
            'keys.auth'       => 'required|string',
        ]);

        $request->user()->updatePushSubscription(
            $data['endpoint'],
            $data['keys']['p256dh'],
            $data['keys']['auth'],
        );

        return response()->json(['ok' => true]);
    }

    public function unsubscribe(Request $request)
    {
        $data = $request->validate(['endpoint' => 'required|string']);

        $request->user()->deletePushSubscription($data['endpoint']);

        return response()->json(['ok' => true]);
    }
}
