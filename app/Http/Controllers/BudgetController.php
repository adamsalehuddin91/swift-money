<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function store(Request $request)
    {
        abort_unless($request->user()->family_id, 403);

        $validated = $request->validate([
            'category'      => 'required|string|max:255',
            'monthly_limit' => 'required|numeric|min:0',
        ]);

        // Idempotent: set budget for a category (create or update its limit).
        Budget::updateOrCreate(
            ['family_id' => $request->user()->family_id, 'category' => $validated['category']],
            ['monthly_limit' => $validated['monthly_limit']]
        );

        return back();
    }

    public function update(Request $request, Budget $budget)
    {
        abort_unless($budget->family_id === $request->user()->family_id, 403);

        $validated = $request->validate([
            'monthly_limit' => 'required|numeric|min:0',
        ]);

        $budget->update($validated);

        return back();
    }

    public function destroy(Request $request, Budget $budget)
    {
        abort_unless($budget->family_id === $request->user()->family_id, 403);

        $budget->delete();

        return back();
    }
}
