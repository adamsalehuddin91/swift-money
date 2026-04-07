<?php

namespace App\Services;

use App\Models\Income;
use Illuminate\Support\Facades\Cache;

class IncomeService
{
    public function getForFamily(int $familyId, string $monthYear)
    {
        return Income::where('family_id', $familyId)
            ->where('month_year', $monthYear)
            ->get();
    }

    public function getForUser(int $userId, string $monthYear)
    {
        return Income::where('user_id', $userId)
            ->where('month_year', $monthYear)
            ->get();
    }

    public function getTotalForFamily(int $familyId, string $monthYear): float
    {
        return (float) Income::where('family_id', $familyId)
            ->where('month_year', $monthYear)
            ->sum('amount');
    }

    public function getTotalForUser(int $userId, string $monthYear): float
    {
        return (float) Income::where('user_id', $userId)
            ->where('month_year', $monthYear)
            ->sum('amount');
    }

    public function create(array $data): Income
    {
        return Income::create($data);
    }

    public function update(Income $income, array $data): Income
    {
        $income->update($data);
        return $income->fresh();
    }

    public function delete(Income $income): void
    {
        $income->delete();
    }

    public function carryRecurring(int $familyId, string $monthYear): void
    {
        $cacheKey = "recurring_carried_{$familyId}_{$monthYear}";
        if (Cache::has($cacheKey)) return;

        // Skip if this month already has recurring incomes
        $alreadyCarried = Income::where('family_id', $familyId)
            ->where('month_year', $monthYear)
            ->where('is_recurring', true)
            ->exists();

        if ($alreadyCarried) {
            Cache::put($cacheKey, true, now()->endOfMonth()->addDay());
            return;
        }

        // Get last month's recurring incomes
        [$m, $y] = explode('-', $monthYear);
        $lastMonth = \Carbon\Carbon::createFromFormat('m-Y', $monthYear)->subMonth()->format('m-Y');

        $recurring = Income::where('family_id', $familyId)
            ->where('month_year', $lastMonth)
            ->where('is_recurring', true)
            ->get();

        foreach ($recurring as $income) {
            Income::create([
                'family_id'    => $income->family_id,
                'user_id'      => $income->user_id,
                'source'       => $income->source,
                'amount'       => $income->amount,
                'month_year'   => $monthYear,
                'is_recurring' => true,
            ]);
        }

        Cache::put($cacheKey, true, now()->endOfMonth()->addDay());
    }
}
