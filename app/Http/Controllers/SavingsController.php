<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use App\Services\SavingsService;
use Illuminate\Http\Request;

class SavingsController extends Controller
{
    public function __construct(private SavingsService $savingsService) {}

    public function store(Request $request)
    {
        abort_unless($request->user()->family_id, 403, 'Akaun belum dikaitkan dengan family.');
        abort_unless($request->user()->family->isPaid(), 403, 'upgrade_required');

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'deadline'      => 'nullable|date|after:today',
            'emoji'         => 'nullable|string|max:10',
        ]);

        $validated['family_id']      = $request->user()->family_id;
        $validated['current_amount'] = 0;
        $validated['emoji']          = $validated['emoji'] ?: '💰';

        $this->savingsService->create($validated);

        return back();
    }

    public function update(Request $request, SavingsGoal $savingsGoal)
    {
        abort_unless($savingsGoal->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'deadline'      => 'nullable|date',
            'emoji'         => 'nullable|string|max:10',
        ]);

        $this->savingsService->update($savingsGoal, $validated);

        return back();
    }

    public function destroy(Request $request, SavingsGoal $savingsGoal)
    {
        abort_unless($savingsGoal->family_id === $request->user()->family_id, 403);

        $this->savingsService->destroy($savingsGoal);

        return back();
    }

    public function contribute(Request $request, SavingsGoal $savingsGoal)
    {
        abort_unless($savingsGoal->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note'   => 'nullable|string|max:255',
        ]);

        $this->savingsService->addContribution($savingsGoal, (float) $validated['amount'], $validated['note'] ?? null);

        return back();
    }

    public function history(Request $request, SavingsGoal $savingsGoal)
    {
        abort_unless($savingsGoal->family_id === $request->user()->family_id, 403);

        return response()->json($this->savingsService->getHistory($savingsGoal));
    }
}
