<?php

namespace App\Services;

use App\Models\Income;
use App\Models\TaxReliefCategory;
use App\Models\TaxReliefItem;

// LHDN tax-relief tracking + rough chargeable-income / tax estimate.
// CAPS + BRACKETS ARE ESTIMATES — verify against official LHDN figures for the YA.
class TaxService
{
    // Resident individual progressive brackets (estimate, YA2024+).
    // [upper_bound, rate]. Last band uses PHP_INT_MAX as open-ended.
    private const BRACKETS = [
        [5000, 0.00],
        [20000, 0.01],
        [35000, 0.03],
        [50000, 0.06],
        [70000, 0.11],
        [100000, 0.19],
        [400000, 0.25],
        [600000, 0.26],
        [2000000, 0.28],
        [PHP_INT_MAX, 0.30],
    ];

    // Years of assessment that have categories seeded.
    public function availableYas(): array
    {
        $yas = TaxReliefCategory::distinct()->orderByDesc('ya')->pluck('ya')->all();
        return $yas ?: [(int) now()->format('Y')];
    }

    public function defaultYa(): int
    {
        return $this->availableYas()[0];
    }

    // Full tax summary for a family (optionally scoped to one user) for a YA.
    public function getSummary(int $familyId, int $ya, ?int $userId = null): array
    {
        $categories = TaxReliefCategory::where('ya', $ya)
            ->where('active', true)
            ->orderBy('sort_order')
            ->get();

        $itemQuery = TaxReliefItem::where('family_id', $familyId)->where('ya', $ya);
        if ($userId) {
            $itemQuery->where('user_id', $userId);
        }
        $items = $itemQuery->get();

        $claimedByCat = $items->groupBy('tax_relief_category_id')
            ->map(fn ($g) => (float) $g->sum('amount'));

        $reliefTotal = 0.0;
        $rebateTotal = 0.0;

        $rows = $categories->map(function ($c) use ($claimedByCat, &$reliefTotal, &$rebateTotal) {
            $claimed = (float) ($claimedByCat[$c->id] ?? 0);
            $cap     = $c->cap_amount !== null ? (float) $c->cap_amount : null;
            $counted = $cap !== null ? min($claimed, $cap) : $claimed;

            if ($c->type === 'rebate') {
                $rebateTotal += $counted;
            } else {
                $reliefTotal += $counted;
            }

            return [
                'id'        => $c->id,
                'code'      => $c->code,
                'name'      => $c->name,
                'type'      => $c->type,
                'cap'       => $cap,
                'claimed'   => round($claimed, 2),
                'counted'   => round($counted, 2),
                'remaining' => $cap !== null ? round(max($cap - $claimed, 0), 2) : null,
                'pct'       => $cap !== null && $cap > 0 ? min((int) round($claimed / $cap * 100), 100) : 0,
                'over'      => $cap !== null && $claimed > $cap,
                'count'     => $claimedByCat->has($c->id) ? 1 : 0,
            ];
        })->values()->toArray();

        $income     = $this->annualIncome($familyId, $ya, $userId);
        $chargeable = max(0, $income - $reliefTotal);
        $taxBefore  = $this->estimateTax($chargeable);
        $taxAfter   = max(0, $taxBefore - $rebateTotal);

        return [
            'ya'              => $ya,
            'categories'      => $rows,
            'relief_total'    => round($reliefTotal, 2),
            'rebate_total'    => round($rebateTotal, 2),
            'income'          => round($income, 2),
            'chargeable'      => round($chargeable, 2),
            'tax_before'      => round($taxBefore, 2),
            'tax_after_rebate'=> round($taxAfter, 2),
            'item_count'      => $items->count(),
        ];
    }

    // Items list (for the page table), newest first.
    public function getItems(int $familyId, int $ya, ?int $userId = null): array
    {
        $q = TaxReliefItem::with('category', 'user')
            ->where('family_id', $familyId)
            ->where('ya', $ya);
        if ($userId) {
            $q->where('user_id', $userId);
        }

        return $q->orderByDesc('date')->orderByDesc('id')->get()->map(fn ($i) => [
            'id'           => $i->id,
            'category_id'  => $i->tax_relief_category_id,
            'category'     => $i->category?->name,
            'title'        => $i->title,
            'amount'       => (float) $i->amount,
            'date'         => $i->date?->format('Y-m-d'),
            'note'         => $i->note,
            'source'       => $i->source,
            'has_receipt'  => (bool) $i->receipt_path,
            'by'           => $i->user?->name,
        ])->toArray();
    }

    // Sum of all family/user income recorded for the YA (month_year is 'm-Y').
    private function annualIncome(int $familyId, int $ya, ?int $userId = null): float
    {
        $q = Income::where('family_id', $familyId)
            ->where('month_year', 'like', "%-{$ya}");
        if ($userId) {
            $q->where('user_id', $userId);
        }
        return (float) $q->sum('amount');
    }

    // Progressive tax on chargeable income (estimate).
    public function estimateTax(float $chargeable): float
    {
        $tax  = 0.0;
        $prev = 0.0;
        foreach (self::BRACKETS as [$bound, $rate]) {
            if ($chargeable <= $prev) break;
            $slice = min($chargeable, $bound) - $prev;
            $tax  += $slice * $rate;
            $prev  = $bound;
        }
        return $tax;
    }
}
