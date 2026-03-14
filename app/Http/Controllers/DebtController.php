<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Services\DebtService;
use Illuminate\Http\Request;

class DebtController extends Controller
{
    public function __construct(private DebtService $debtService) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:fixed,flexible',
        ]);

        $validated['family_id'] = $request->user()->family_id;

        $this->debtService->create($validated);

        return back();
    }

    public function recordPayment(Request $request, Debt $debt)
    {
        abort_unless($debt->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $this->debtService->recordPayment($debt, (float) $validated['amount']);

        return back();
    }

    public function history(Request $request, Debt $debt)
    {
        abort_unless($debt->family_id === $request->user()->family_id, 403);

        return response()->json($this->debtService->getPaymentHistory($debt));
    }
}
