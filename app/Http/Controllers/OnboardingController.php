<?php

namespace App\Http\Controllers;

use App\Models\Family;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function setupFamily(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Idempotent — skip if user already has a family
        if ($user->family_id) {
            return redirect()->route('dashboard');
        }

        $request->validate([
            'family_name' => 'required|string|max:100',
        ]);

        $family = Family::create([
            'name' => $request->family_name,
            'plan' => 'free',
        ]);

        $user->update([
            'family_id' => $family->id,
            'role'      => 'admin',
        ]);

        return redirect()->route('dashboard')->with('success', 'Akaun anda telah disediakan!');
    }
}
