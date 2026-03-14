<?php

namespace App\Services;

use App\Models\Income;

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
}
