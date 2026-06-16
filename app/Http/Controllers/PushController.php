<?php

namespace App\Http\Controllers;

use App\Notifications\BillDueReminder;
use Illuminate\Http\Request;

// Stores/removes the browser's Web-Push subscription for the logged-in user.
class PushController extends Controller
{
    // Send a test push to the current user (verify delivery end-to-end).
    public function test(Request $request)
    {
        try {
            $request->user()->notify(new BillDueReminder(
                'Ujian SwiftMoney 🔔',
                'Notifikasi berjaya! Peringatan bil due akan sampai macam ni.',
            ));
            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

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
