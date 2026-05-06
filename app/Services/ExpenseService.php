<?php

namespace App\Services;

use App\Models\Expense;

class ExpenseService
{
    public function getForMonth(int $familyId, string $monthYear): array
    {
        return Expense::where('family_id', $familyId)
            ->where('month_year', $monthYear)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($e) => [
                'id'         => $e->id,
                'title'      => $e->title,
                'amount'     => (float) $e->amount,
                'category'   => $e->category,
                'note'       => $e->note,
                'by'         => $e->user->name,
                'user_id'    => $e->user_id,
            ])
            ->toArray();
    }

    public function getTotalForMonth(int $familyId, string $monthYear): float
    {
        return (float) Expense::where('family_id', $familyId)
            ->where('month_year', $monthYear)
            ->sum('amount');
    }

    public function create(array $data): Expense
    {
        return Expense::create($data);
    }

    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);
        return $expense->fresh();
    }

    public function delete(Expense $expense): void
    {
        $expense->delete();
    }
}
