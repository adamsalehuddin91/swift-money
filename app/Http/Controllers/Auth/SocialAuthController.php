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
                'google_id' => $googleUser->getId(),
                'avatar'    => $googleUser->getAvatar(),
            ]);

            // If user has no family yet + valid invite → join that family
            if (!$user->family_id && $inviteToken) {
                $this->acceptInvite($user, $inviteToken);
            }
        } else {
            if ($inviteToken) {
                // New user via invite — join existing family as member
                $invite = FamilyInvite::where('token', $inviteToken)->first();

                if ($invite && $invite->isValid()) {
                    $user = User::create([
                        'name'              => $googleUser->getName(),
                        'email'             => $googleUser->getEmail(),
                        'google_id'         => $googleUser->getId(),
                        'avatar'            => $googleUser->getAvatar(),
                        'family_id'         => $invite->family_id,
                        'role'              => 'member',
                        'email_verified_at' => now(),
                    ]);

                    $invite->update(['used_at' => now()]);
                } else {
                    // Invite invalid — create own family
                    $user = $this->createWithFamily($googleUser);
                }
            } else {
                // Brand new user, no invite — create own family
                $user = $this->createWithFamily($googleUser);
            }
        }

        session()->forget('invite_token');
        Auth::login($user, true);

        return redirect()->intended(route('dashboard'));
    }
}
