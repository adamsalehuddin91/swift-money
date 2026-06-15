<?php

namespace App\Services;

use App\Models\Income;
use App\Models\SavingsGoal;

// Zakat pendapatan + zakat simpanan/harta @ 2.5%, compared against nisab.
// NISAB IS A PLACEHOLDER — it tracks the current gold price (85g). Verify with
// your state's zakat authority before relying on it.
class ZakatService
{
    public const RATE = 0.025;          // 2.5%
    public const DEFAULT_NISAB = 25000; // placeholder (≈ 85g emas) — sahkan semasa

    // Prefill the calculator from existing data.
    public function prefill(int $familyId, ?int $userId = null): array
    {
        $year = (int) now()->format('Y');

        $incomeQ = Income::where('family_id', $familyId)->where('month_year', 'like', "%-{$year}");
        if ($userId) {
            $incomeQ->where('user_id', $userId);
        }

        $savings = (float) SavingsGoal::where('family_id', $familyId)->sum('current_amount');

        return [
            'annual_income' => round((float) $incomeQ->sum('amount'), 2),
            'savings_total' => round($savings, 2),
            'nisab'         => self::DEFAULT_NISAB,
            'rate'          => self::RATE,
            'year'          => $year,
        ];
    }

    // Zakat due — only charged when the base meets nisab.
    public function compute(float $income, float $savings, float $nisab): array
    {
        $zIncome  = $income  >= $nisab ? $income  * self::RATE : 0.0;
        $zSavings = $savings >= $nisab ? $savings * self::RATE : 0.0;

        return [
            'zakat_income'  => round($zIncome, 2),
            'zakat_savings' => round($zSavings, 2),
            'total'         => round($zIncome + $zSavings, 2),
        ];
    }
}
