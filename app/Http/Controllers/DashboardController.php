<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use App\Models\FamilyInvite;
use App\Services\BillService;
use App\Services\DebtService;
use App\Services\IncomeService;
use App\Services\SavingsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private IncomeService $incomeService,
        private BillService $billService,
        private DebtService $debtService,
        private SavingsService $savingsService,
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
        abort_unless(preg_match('/^\d{2}-\d{4}$/', $monthYear), 422, 'Invalid month format.');

        // Free plan: current month only
        $currentMonth = now()->format('m-Y');
        if (!$user->family->isPaid() && $monthYear !== $currentMonth) {
            $monthYear = $currentMonth;
        }
        $userName = $user->name;

        // Auto-carry recurring incomes from last month (cached)
        $this->incomeService->carryRecurring($familyId, $monthYear);

        // Auto-generate bill records for current month if none exist (cached)
        $this->billService->generateMonthlyRecords($familyId, $monthYear);

        // Fetch records once — reused by summary + categorized calls below
        $records = $this->billService->getRecordsForMonth($familyId, $monthYear);

        // Personal data
        $myIncome = $this->incomeService->getTotalForUser($user->id, $monthYear);
        $mySummary = $this->billService->getBillSummary($records, $userName);
        $myNetBalance = $myIncome - $mySummary['paid_bills'];

        // Family data
        $familyIncome = $this->incomeService->getTotalForFamily($familyId, $monthYear);
        $familySummary = $this->billService->getBillSummary($records);
        $familyNetBalance = $familyIncome - $familySummary['paid_bills'];

        return Inertia::render('Dashboard', [
            'user' => [
                'name'      => $userName,
                'role'      => $user->role,
                'family_id' => $familyId,
                'avatar'    => $user->avatar,
            ],
            'monthYear' => $monthYear,
            'my_summary' => [
                'net_balance'  => $myNetBalance,
                'total_income' => $myIncome,
                'total_unpaid' => $mySummary['unpaid_bills'],
                'total_bills'  => $mySummary['total_bills'],
                'progress_pct' => $mySummary['progress'],
            ],
            'summary' => [
                'net_balance'  => $familyNetBalance,
                'total_income' => $familyIncome,
                'total_unpaid' => $familySummary['unpaid_bills'],
                'total_bills'  => $familySummary['total_bills'],
                'progress_pct' => $familySummary['progress'],
            ],
            'my_incomes'       => $this->incomeService->getForUser($user->id, $monthYear),
            'incomes'          => $this->incomeService->getForFamily($familyId, $monthYear),
            'my_bills'         => $this->billService->getCategorizedBills($records, $userName),
            'categorized_bills'=> $this->billService->getCategorizedBills($records),
            'active_debts'     => $this->debtService->getForFamily($familyId),
            'all_debts'        => Debt::where('family_id', $familyId)->select('id', 'title', 'current_balance')->get(),
            'savings_goals'    => $this->savingsService->getForFamily($familyId),
            'family_members'   => $user->family->users()->select('id', 'name', 'avatar', 'role')->get(),
            'invite_link'      => $this->getActiveInviteLink($familyId, $user->role),
        ]);
    }

    private function getActiveInviteLink(int $familyId, string $role): ?string
    {
        if ($role !== 'admin') return null;

        $invite = FamilyInvite::where('family_id', $familyId)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        return $invite ? url("/join/{$invite->token}") : null;
    }

    public function analytics(Request $request)
    {
        $user = $request->user();
        $familyId = $user->family_id;
        abort_unless($familyId, 403);
        abort_unless($user->family->isPaid(), 403, 'upgrade_required');

        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->push(now()->subMonths($i)->format('m-Y'));
        }

        $trend = $months->map(function ($month) use ($familyId) {
            $income  = $this->incomeService->getTotalForFamily($familyId, $month);
            $records = $this->billService->getRecordsForMonth($familyId, $month);
            $summary = $this->billService->getBillSummary($records);

            [$m, $y] = explode('-', $month);
            $label = Carbon::createFromDate($y, $m, 1)->format('M');

            return [
                'month'  => $label,
                'income' => $income,
                'bills'  => $summary['total_bills'],
                'paid'   => $summary['paid_bills'],
                'saved'  => max(0, $income - $summary['paid_bills']),
            ];
        });

        // Category breakdown for current month
        $currentMonth = now()->format('m-Y');
        $currentRecords = $this->billService->getRecordsForMonth($familyId, $currentMonth);
        $categoryBreakdown = $currentRecords
            ->groupBy(fn ($r) => $r->template->category)
            ->map(fn ($group) => round($group->sum('actual_amount'), 2))
            ->sortByDesc(fn ($v) => $v)
            ->map(fn ($amount, $category) => ['category' => $category, 'amount' => $amount])
            ->values();

        return response()->json([
            'trend'     => $trend,
            'breakdown' => $categoryBreakdown,
        ]);
    }
}
