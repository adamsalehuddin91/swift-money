<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(private ExpenseService $expenseService) {}

    public function store(Request $request)
    {
        abort_unless($request->user()->family_id, 403);

        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'amount'     => 'required|numeric|min:0.01',
            'category'   => 'required|string|max:255',
            'month_year' => ['required', 'string', 'max:7', 'regex:/^\d{2}-\d{4}$/'],
            'note'       => 'nullable|string|max:255',
        ]);

        $validated['family_id'] = $request->user()->family_id;
        $validated['user_id']   = $request->user()->id;

        $this->expenseService->create($validated);

        return back();
    }

    public function update(Request $request, Expense $expense)
    {
        abort_unless($expense->family_id === $request->user()->family_id, 403);
        abort_unless($expense->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $validated = $request->validate([
            'title'    => 'required|string|max:255',
            'amount'   => 'required|numeric|min:0.01',
            'category' => 'required|string|max:255',
            'note'     => 'nullable|string|max:255',
        ]);

        $this->expenseService->update($expense, $validated);

        return back();
    }

    public function destroy(Request $request, Expense $expense)
    {
        abort_unless($expense->family_id === $request->user()->family_id, 403);
        abort_unless($expense->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        $this->expenseService->delete($expense);

        return back();
    }
}
