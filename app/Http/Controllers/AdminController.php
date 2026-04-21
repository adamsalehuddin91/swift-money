<?php

namespace App\Http\Controllers;

use App\Models\Family;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_families'     => Family::count(),
            'paid_families'      => Family::where('plan', 'paid')->count(),
            'free_families'      => Family::where('plan', 'free')->count(),
            'total_users'        => User::count(),
            'suspended_families' => Family::whereNotNull('suspended_at')->count(),
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
            'total_families'     => Family::count(),
            'paid_families'      => Family::where('plan', 'paid')->count(),
            'free_families'      => Family::where('plan', 'free')->count(),
            'total_users'        => User::count(),
            'suspended_families' => Family::whereNotNull('suspended_at')->count(),
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

        return back()->with('success', "{$family->name} diupgrade untuk {$months} bulan.");
    }

    public function extend(Request $request, Family $family)
    {
        $validated = $request->validate([
            'months' => 'required|numeric|min:1|max:24',
        ]);

        $months = (int) $validated['months'];

        // Extend from current expiry (if still future) or from now
        $base = ($family->plan_expires_at && $family->plan_expires_at->isFuture())
            ? $family->plan_expires_at
            : now();

        $family->update([
            'plan'            => 'paid',
            'plan_expires_at' => $base->addMonths($months),
        ]);

        return back()->with('success', "{$family->name} dilanjutkan {$months} bulan lagi.");
    }

    public function downgrade(Family $family)
    {
        $family->update([
            'plan'            => 'free',
            'plan_expires_at' => null,
        ]);

        return back()->with('success', "{$family->name} diturunkan ke Free.");
    }

    public function suspend(Family $family)
    {
        if ($family->isSuspended()) {
            $family->update(['suspended_at' => null]);
            return back()->with('success', "{$family->name} telah diaktifkan semula.");
        }

        $family->update(['suspended_at' => now()]);
        return back()->with('success', "{$family->name} telah digantung.");
    }

    public function deleteFamily(Family $family)
    {
        $name = $family->name;
        $family->users()->delete();
        $family->delete();

        return back()->with('success', "Akaun {$name} telah dipadam sepenuhnya.");
    }

    public function sendEmail(Request $request, Family $family)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body'    => 'required|string|max:5000',
        ]);

        $family->load('users');

        foreach ($family->users as $user) {
            Mail::raw($validated['body'], function ($message) use ($user, $validated) {
                $message->to($user->email, $user->name)
                        ->subject($validated['subject'])
                        ->from(config('mail.from.address', 'noreply@swiftmoney.my'), 'SwiftMoney');
            });
        }

        return back()->with('success', "Email dihantar ke {$family->users->count()} ahli {$family->name}.");
    }

    private function formatFamily(Family $family): array
    {
        $family->load('users');
        return [
            'id'              => $family->id,
            'name'            => $family->name,
            'plan'            => $family->plan,
            'is_paid'         => $family->isPaid(),
            'is_suspended'    => $family->isSuspended(),
            'plan_expires_at' => $family->plan_expires_at?->toDateString(),
            'subscribed_at'   => $family->subscribed_at?->toDateString(),
            'suspended_at'    => $family->suspended_at?->toDateString(),
            'users'           => $family->users->map(fn($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'role'          => $u->role,
                'last_login_at' => $u->last_login_at?->toDateString(),
            ]),
        ];
    }
}
