<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $family = $user?->family;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'plan' => [
                'is_paid'    => $family?->isPaid() ?? false,
                'plan'       => $family?->plan ?? 'free',
                'expires_at' => $family?->plan_expires_at?->toDateString(),
            ],
            'language' => $user?->language ?? 'ms',
            'flash' => [
                'upgrade_required' => $request->session()->get('upgrade_required'),
            ],
        ];
    }
}
