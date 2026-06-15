<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Debt;
use App\Models\NetWorthSnapshot;
use Carbon\Carbon;

// Net worth = total assets − total liabilities. Assets are tracked here;
// liabilities are pulled live from outstanding `debts`.
class NetWorthService
{
    public const TYPES = ['cash', 'investment', 'property', 'epf', 'gold', 'vehicle', 'other'];

    public function getAssets(int $familyId): array
    {
        return Asset::where('family_id', $familyId)
            ->orderByDesc('value')
            ->get()
            ->map(fn ($a) => [
                'id'    => $a->id,
                'name'  => $a->name,
                'type'  => $a->type,
                'value' => (float) $a->value,
                'note'  => $a->note,
            ])
            ->toArray();
    }

    public function assetsTotal(int $familyId): float
    {
        return (float) Asset::where('family_id', $familyId)->sum('value');
    }

    public function liabilitiesTotal(int $familyId): float
    {
        return (float) Debt::where('family_id', $familyId)->where('current_balance', '>', 0)->sum('current_balance');
    }

    // Current position + breakdown of assets by type (for a donut/legend).
    public function summary(int $familyId): array
    {
        $assets      = $this->assetsTotal($familyId);
        $liabilities = $this->liabilitiesTotal($familyId);

        $byType = Asset::where('family_id', $familyId)
            ->selectRaw('type, SUM(value) as total')
            ->groupBy('type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['type' => $r->type, 'total' => round((float) $r->total, 2)])
            ->toArray();

        $snapshots = $this->snapshots($familyId);
        $last      = count($snapshots) ? end($snapshots) : null;
        $net       = $assets - $liabilities;

        return [
            'total_assets'      => round($assets, 2),
            'total_liabilities' => round($liabilities, 2),
            'net_worth'         => round($net, 2),
            'by_type'           => $byType,
            'change'            => $last ? round($net - $last['net_worth'], 2) : null,
        ];
    }

    public function snapshots(int $familyId): array
    {
        return NetWorthSnapshot::where('family_id', $familyId)
            ->orderBy('month_year') // 'm-Y' — re-sorted chronologically below
            ->get()
            ->sortBy(fn ($s) => Carbon::createFromFormat('m-Y', $s->month_year))
            ->map(fn ($s) => [
                'month_year'  => $s->month_year,
                'label'       => Carbon::createFromFormat('m-Y', $s->month_year)->format('M y'),
                'assets'      => (float) $s->total_assets,
                'liabilities' => (float) $s->total_liabilities,
                'net_worth'   => (float) $s->net_worth,
            ])
            ->values()
            ->toArray();
    }

    // Capture (or update) this month's snapshot from current totals.
    public function capture(int $familyId): NetWorthSnapshot
    {
        $assets      = $this->assetsTotal($familyId);
        $liabilities = $this->liabilitiesTotal($familyId);

        return NetWorthSnapshot::updateOrCreate(
            ['family_id' => $familyId, 'month_year' => now()->format('m-Y')],
            [
                'total_assets'      => $assets,
                'total_liabilities' => $liabilities,
                'net_worth'         => $assets - $liabilities,
            ]
        );
    }
}
