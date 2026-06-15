<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\FamilyInvite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    private function createWithFamily($googleUser): User
    {
        $family = Family::create([
            'name' => $googleUser->getName() . "'s Family",
        ]);

        return User::create([
            'name'              => $googleUser->getName(),
            'email'             => $googleUser->getEmail(),
            'google_id'         => $googleUser->getId(),
            'avatar'            => $googleUser->getAvatar(),
            'family_id'         => $family->id,
            'role'              => 'admin',
            'email_verified_at' => now(),
            'last_login_at'     => now(),
        ]);
    }

    private function acceptInvite(User $user, string $token): void
    {
        $invite = FamilyInvite::where('token', $token)->first();
        if ($invite && $invite->isValid()) {
            $user->update(['family_id' => $invite->family_id, 'role' => 'member']);
            $invite->update(['used_at' => now()]);
        }
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        $inviteToken = session('invite_token');

        if ($user) {
            // Existing user — update google_id + avatar if missing
            $user->update([
                'google_id'     => $googleUser->getId(),
                'avatar'        => $googleUser->getAvatar(),
                'last_login_at' => now(),
            ]);

            // If user has no family yet + valid invite → join that family
            if (!$user->family_id && $inviteToken) {
                $this->acceptInvite($user, $inviteToken);
            }
        } else {
            // REGISTRATION CLOSED (private mode, 2026-06-15) — only allow NEW
            // accounts via a VALID invite (so Adam can still invite his wife).
            $invite = $inviteToken ? FamilyInvite::where('token', $inviteToken)->first() : null;

            if ($invite && $invite->isValid()) {
                $user = User::create([
                    'name'              => $googleUser->getName(),
                    'email'             => $googleUser->getEmail(),
                    'google_id'         => $googleUser->getId(),
                    'avatar'            => $googleUser->getAvatar(),
                    'family_id'         => $invite->family_id,
                    'role'              => 'member',
                    'email_verified_at' => now(),
                    'last_login_at'     => now(),
                ]);

                $invite->update(['used_at' => now()]);
            } else {
                // No valid invite + no existing account → registration closed.
                session()->forget('invite_token');
                return redirect()->route('login')->withErrors(['email' => 'Pendaftaran ditutup buat masa ini.']);
            }
        }

        session()->forget('invite_token');
        Auth::login($user, true);

        return redirect()->intended(route('dashboard'));
    }
}
