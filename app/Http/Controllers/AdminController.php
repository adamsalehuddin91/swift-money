<?php

namespace App\Http\Controllers;

use App\Models\Family;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_families' => Family::count(),
            'paid_families'  => Family::where('plan', 'paid')->count(),
            'free_families'  => Family::where('plan', 'free')->count(),
            'total_users'    => User::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats'    => $stats,
            'families' => [],
            'query'    => '',
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');

        $families = collect();

        if ($query) {
            $userMatch = User::where('email', 'like', "%{$query}%")
                ->orWhere('name', 'like', "%{$query}%")
                ->with('family')
                ->get();

            $families = $userMatch
                ->filter(fn($u) => $u->family)
                ->map(fn($u) => $u->family)
                ->unique('id')
                ->merge(
                    Family::where('id', 'like', "%{$query}%")->get()
                )
                ->unique('id')
                ->map(fn($f) => $this->formatFamily($f));
        }

        $stats = [
            'total_families' => Family::count(),
            'paid_families'  => Family::where('plan', 'paid')->count(),
            'free_families'  => Family::where('plan', 'free')->count(),
            'total_users'    => User::count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats'    => $stats,
            'families' => $families->values(),
            'query'    => $query,
        ]);
    }

    public function upgrade(Request $request, Family $family)
    {
        $validated = $request->validate([
            'months' => 'required|numeric|min:1|max:24',
        ]);

        $months = (int) $validated['months'];

        $family->plan            = 'paid';
        $family->plan_expires_at = now()->addMonths($months);
        $family->subscribed_at   = $family->subscribed_at ?? now();
        $family->save();

        return back()->with('success', "{$family->name} upgraded untuk {$months} bulan.");
    }

    public function downgrade(Family $family)
    {
        $family->update([
            'plan'            => 'free',
            'plan_expires_at' => null,
        ]);

        return back()->with('success', "{$family->name} diturunkan ke Free.");
    }

    private function formatFamily(Family $family): array
    {
        $family->load('users');
        return [
            'id'              => $family->id,
            'name'            => $family->name,
            'plan'            => $family->plan,
            'is_paid'         => $family->isPaid(),
            'plan_expires_at' => $family->plan_expires_at?->toDateString(),
            'subscribed_at'   => $family->subscribed_at?->toDateString(),
            'users'           => $family->users->map(fn($u) => [
                'id'     => $u->id,
                'name'   => $u->name,
                'email'  => $u->email,
                'role'   => $u->role,
            ]),
        ];
    }
}
