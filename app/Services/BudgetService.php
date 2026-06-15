<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Expense;

class BudgetService
{
    // Budgets (per-category monthly limit) joined with actual spending for the month.
    public function getForMonth(int $familyId, string $monthYear): array
    {
        $spentByCategory = Expense::where('family_id', $familyId)
            ->where('month_year', $monthYear)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        return Budget::where('family_id', $familyId)
            ->orderBy('category')
            ->get()
            ->map(function ($b) use ($spentByCategory) {
                $spent = (float) ($spentByCategory[$b->category] ?? 0);
                $limit = (float) $b->monthly_limit;
                return [
                    'id'        => $b->id,
                    'category'  => $b->category,
                    'limit'     => $limit,
                    'spent'     => round($spent, 2),
                    'remaining' => round($limit - $spent, 2),
                    'pct'       => $limit > 0 ? (int) round($spent / $limit * 100) : 0,
                    'over'      => $spent > $limit,
                ];
            })
            ->toArray();
    }
}
