<?php

namespace App\Http\Controllers;

use App\Models\FamilyInvite;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InviteController extends Controller
{
    // Admin generates a new invite link (valid 7 days)
    public function generate(Request $request)
    {
        $user = $request->user();
        abort_unless($user->family_id, 403);

        // Invalidate old unused tokens for this family
        FamilyInvite::where('family_id', $user->family_id)
            ->whereNull('used_at')
            ->delete();

        $invite = FamilyInvite::create([
            'family_id'  => $user->family_id,
            'token'      => Str::random(48),
            'expires_at' => now()->addDays(7),
        ]);

        $link = url("/join/{$invite->token}");

        return back()->with('invite_link', $link);
    }

    // Spouse opens the invite link
    public function show(string $token)
    {
        $invite = FamilyInvite::where('token', $token)->with('family')->first();

        if (!$invite || !$invite->isValid()) {
            return Inertia::render('Invite/Invalid');
        }

        // Store token in session — used after Google login
        session(['invite_token' => $token]);

        return Inertia::render('Invite/Accept', [
            'family_name' => $invite->family->name,
            'google_url'  => route('auth.google'),
        ]);
    }
}
