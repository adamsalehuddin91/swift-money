<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Services\BillService;
use App\Services\DebtService;
use App\Services\IncomeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private IncomeService $incomeService,
        private BillService $billService,
        private DebtService $debtService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $familyId = $user->family_id;

        if (!$familyId) {
            return Inertia::render('Dashboard', [
                'needsSetup' => true,
            ]);
        }

        $monthYear = $request->get('month', now()->format('m-Y'));
        $userName = $user->name; // "Abg" or "Ayg" — matches assigned_to

        // Auto-generate bill records for current month if none exist
        $this->billService->generateMonthlyRecords($familyId, $monthYear);

        // Personal data (filtered by assigned_to / user_id)
        $myIncome = $this->incomeService->getTotalForUser($user->id, $monthYear);
        $mySummary = $this->billService->getBillSummary($familyId, $monthYear, $userName);
        $myNetBalance = $myIncome - $mySummary['total_bills'];

        // Family data (all members combined)
        $familyIncome = $this->incomeService->getTotalForFamily($familyId, $monthYear);
        $familySummary = $this->billService->getBillSummary($familyId, $monthYear);
        $familyNetBalance = $familyIncome - $familySummary['total_bills'];

        return Inertia::render('Dashboard', [
            'user' => [
                'name' => $userName,
                'role' => $user->role,
                'family_id' => $familyId,
            ],
            'monthYear' => $monthYear,
            // Personal summary
            'my_summary' => [
                'net_balance' => $myNetBalance,
                'total_income' => $myIncome,
                'total_unpaid' => $mySummary['unpaid_bills'],
                'total_bills' => $mySummary['total_bills'],
                'progress_pct' => $mySummary['progress'],
            ],
            // Family summary
            'summary' => [
                'net_balance' => $familyNetBalance,
                'total_income' => $familyIncome,
                'total_unpaid' => $familySummary['unpaid_bills'],
                'total_bills' => $familySummary['total_bills'],
                'progress_pct' => $familySummary['progress'],
            ],
            'my_incomes' => $this->incomeService->getForUser($user->id, $monthYear),
            'incomes' => $this->incomeService->getForFamily($familyId, $monthYear),
            'my_bills' => $this->billService->getCategorizedBills($familyId, $monthYear, $userName),
            'categorized_bills' => $this->billService->getCategorizedBills($familyId, $monthYear),
            'active_debts' => $this->debtService->getForFamily($familyId),
            'all_debts' => Debt::where('family_id', $familyId)->select('id', 'title', 'current_balance')->get(),
        ]);
    }
}
