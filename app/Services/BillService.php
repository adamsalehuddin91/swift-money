<?php

namespace App\Services;

use App\Models\BillRecord;
use App\Models\BillTemplate;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class BillService
{
    public function getTemplatesForFamily(int $familyId)
    {
        return BillTemplate::where('family_id', $familyId)
            ->where('is_active', true)
            ->orderBy('category')
            ->get();
    }

    public function getRecordsForMonth(int $familyId, string $monthYear)
    {
        return BillRecord::whereHas('template', fn ($q) => $q->where('family_id', $familyId))
            ->where('month_year', $monthYear)
            ->with(['template.debt'])
            ->get();
    }

    public function getCategorizedBills(Collection $records, ?string $assignedTo = null): array
    {
        if ($assignedTo) {
            $records = $records->filter(fn ($r) => $r->template->assigned_to === $assignedTo);
        }

        return $records->groupBy(fn ($r) => $r->template->category)
            ->map(fn ($group) => $group->map(fn ($r) => [
                'id' => $r->id,
                'template_id' => $r->template->id,
                'title' => $r->template->title,
                'amount' => (float) $r->actual_amount,
                'paid' => $r->is_paid,
                'paid_at' => $r->paid_at?->toDateTimeString(),
                'assigned' => $r->template->assigned_to,
                'category' => $r->template->category,
                'debt_id' => $r->template->debt_id,
                'debt_title' => $r->template->debt?->title,
                'receipt_path' => $r->receipt_path,
                'default_amount' => (float) $r->template->default_amount,
            ])->values())
            ->toArray();
    }

    public function getBillSummary(Collection $records, ?string $assignedTo = null): array
    {
        if ($assignedTo) {
            $records = $records->filter(fn ($r) => $r->template->assigned_to === $assignedTo);
        }

        $totalBills = $records->sum('actual_amount');
        $paidBills = $records->where('is_paid', true)->sum('actual_amount');
        $unpaidBills = $totalBills - $paidBills;
        $progress = $totalBills > 0 ? round(($paidBills / $totalBills) * 100) : 0;

        return [
            'total_bills' => (float) $totalBills,
            'paid_bills' => (float) $paidBills,
            'unpaid_bills' => (float) $unpaidBills,
            'progress' => (int) $progress,
        ];
    }

    public function updateTemplate(BillTemplate $template, array $data): BillTemplate
    {
        $template->update($data);

        // Sync current month's unpaid record if default_amount changed
        if (isset($data['default_amount'])) {
            BillRecord::where('bill_template_id', $template->id)
                ->where('month_year', now()->format('m-Y'))
                ->where('is_paid', false)
                ->update(['actual_amount' => $data['default_amount']]);
        }

        return $template->fresh();
    }

    public function togglePaid(BillRecord $record): BillRecord
    {
        $record->update([
            'is_paid' => !$record->is_paid,
            'paid_at' => !$record->is_paid ? now() : null,
        ]);

        return $record->fresh();
    }

    public function createTemplate(array $data): BillTemplate
    {
        $template = BillTemplate::create($data);
        // Invalidate cache so the new template gets a record on next dashboard load
        Cache::forget("bills_generated_{$data['family_id']}_" . now()->format('m-Y'));
        return $template;
    }

    public function generateMonthlyRecords(int $familyId, string $monthYear): int
    {
        $cacheKey = "bills_generated_{$familyId}_{$monthYear}";
        if (Cache::has($cacheKey)) {
            return 0;
        }

        $templates = BillTemplate::where('family_id', $familyId)
            ->where('is_active', true)
            ->get();

        $created = 0;

        foreach ($templates as $template) {
            $exists = BillRecord::where('bill_template_id', $template->id)
                ->where('month_year', $monthYear)
                ->exists();

            if (!$exists) {
                BillRecord::create([
                    'bill_template_id' => $template->id,
                    'month_year' => $monthYear,
                    'actual_amount' => $template->default_amount,
                    'is_paid' => false,
                ]);
                $created++;
            }
        }

        Cache::put($cacheKey, true, now()->endOfMonth()->addDay());

        return $created;
    }
}
