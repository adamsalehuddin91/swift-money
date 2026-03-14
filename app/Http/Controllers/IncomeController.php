<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Services\IncomeService;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function __construct(private IncomeService $incomeService) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'month_year' => ['required', 'string', 'max:7', 'regex:/^\d{2}-\d{4}$/'],
            'is_recurring' => 'boolean',
        ]);

        $validated['family_id'] = $request->user()->family_id;
        $validated['user_id'] = $request->user()->id;

        $this->incomeService->create($validated);

        return back();
    }

    public function update(Request $request, Income $income)
    {
        abort_unless($income->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'source' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $this->incomeService->update($income, $validated);

        return back();
    }

    public function destroy(Request $request, Income $income)
    {
        abort_unless($income->family_id === $request->user()->family_id, 403);

        $this->incomeService->delete($income);

        return back();
    }
}
