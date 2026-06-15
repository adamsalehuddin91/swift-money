<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Services\DebtService;
use App\Services\NetWorthService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NetWorthController extends Controller
{
    public function __construct(
        private NetWorthService $netWorthService,
        private DebtService $debtService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user->family_id, 403);

        return Inertia::render('NetWorth', [
            'summary'   => $this->netWorthService->summary($user->family_id),
            'assets'    => $this->netWorthService->getAssets($user->family_id),
            'snapshots' => $this->netWorthService->snapshots($user->family_id),
            'debts'     => $this->debtService->getForFamily($user->family_id),
            'types'     => NetWorthService::TYPES,
        ]);
    }

    public function storeAsset(Request $request)
    {
        $user = $request->user();
        abort_unless($user->family_id, 403);

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'type'  => 'required|in:' . implode(',', NetWorthService::TYPES),
            'value' => 'required|numeric|min:0',
            'note'  => 'nullable|string|max:500',
        ]);

        Asset::create([...$validated, 'family_id' => $user->family_id]);

        return back();
    }

    public function updateAsset(Request $request, Asset $asset)
    {
        abort_unless($asset->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'type'  => 'required|in:' . implode(',', NetWorthService::TYPES),
            'value' => 'required|numeric|min:0',
            'note'  => 'nullable|string|max:500',
        ]);

        $asset->update($validated);

        return back();
    }

    public function destroyAsset(Request $request, Asset $asset)
    {
        abort_unless($asset->family_id === $request->user()->family_id, 403);

        $asset->delete();

        return back();
    }

    // Snapshot this month's net worth for the trend graph.
    public function capture(Request $request)
    {
        $user = $request->user();
        abort_unless($user->family_id, 403);

        $this->netWorthService->capture($user->family_id);

        return back()->with('flash', 'Snapshot bulan ini disimpan.');
    }
}
