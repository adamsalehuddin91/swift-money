<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Services\BillService;
use App\Services\DebtService;
use App\Services\ExpenseService;
use App\Services\IncomeService;
use App\Services\SavingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SummaryController extends Controller
{
    public function __construct(
        private IncomeService $incomeService,
        private BillService $billService,
        private DebtService $debtService,
        private SavingsService $savingsService,
        private ExpenseService $expenseService,
    ) {}

    public function index(Request $request)
    {
        $user     = $request->user();
        $familyId = $user->family_id;
        abort_unless($familyId, 403);

        $monthYear = $request->get('month', now()->format('m-Y'));
        abort_unless(preg_match('/^\d{2}-\d{4}$/', $monthYear), 422);

        $records  = $this->billService->getRecordsForMonth($familyId, $monthYear);
        $summary  = $this->billService->getBillSummary($records);
        $expenses = $this->expenseService->getForMonth($familyId, $monthYear);
        $income   = $this->incomeService->getTotalForFamily($familyId, $monthYear);
        $totalExp = $this->expenseService->getTotalForMonth($familyId, $monthYear);

        $bills = $records->filter(fn($r) => !$r->is_skipped)->map(fn($r) => [
            'title'  => $r->template->title,
            'amount' => (float) $r->actual_amount,
            'paid'   => $r->is_paid,
        ])->values()->toArray();

        return Inertia::render('MonthlySummary', [
            'monthYear'   => $monthYear,
            'income'      => $income,
            'bills'       => $bills,
            'summary'     => $summary,
            'expenses'    => $expenses,
            'total_expenses' => $totalExp,
            'net'         => $income - $summary['paid_bills'] - $totalExp,
            'savings'     => $this->savingsService->getForFamily($familyId),
            'debts'       => $this->debtService->getForFamily($familyId),
            'family_name' => $user->family->name,
        ]);
    }
}
