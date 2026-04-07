<?php

namespace App\Services;

use App\Models\Debt;
use App\Models\DebtPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DebtService
{
    public function getForFamily(int $familyId)
    {
        return Debt::where('family_id', $familyId)
            ->where('current_balance', '>', 0)
            ->select(['id', 'title', 'total_amount', 'current_balance', 'type'])
            ->get()
            ->map(fn ($debt) => [
                'id' => $debt->id,
                'title' => $debt->title,
                'total' => (float) $debt->total_amount,
                'remaining' => (float) $debt->current_balance,
                'paid' => (float) $debt->paid_amount,
                'pct' => $debt->progress_percent,
                'type' => $debt->type,
            ]);
    }

    public function recordPayment(Debt $debt, float $amount, ?int $billRecordId = null): DebtPayment
    {
        return DB::transaction(function () use ($debt, $amount, $billRecordId) {
            $payment = DebtPayment::create([
                'debt_id' => $debt->id,
                'bill_record_id' => $billRecordId,
                'amount_paid' => $amount,
                'payment_date' => now()->toDateString(),
            ]);

            $debt->decrement('current_balance', $amount);

            return $payment;
        });
    }

    public function reversePayment(Debt $debt, int $billRecordId): void
    {
        $payment = DebtPayment::where('debt_id', $debt->id)
            ->where('bill_record_id', $billRecordId)
            ->first();

        if ($payment) {
            $debt->increment('current_balance', $payment->amount_paid);
            $payment->delete();
        } else {
            Log::warning('reversePayment: No payment found', [
                'debt_id' => $debt->id,
                'bill_record_id' => $billRecordId,
            ]);
        }
    }

    public function create(array $data): Debt
    {
        $data['current_balance'] = $data['total_amount'];
        return Debt::create($data);
    }

    public function getPaymentHistory(Debt $debt)
    {
        return $debt->payments()
            ->orderByDesc('payment_date')
            ->get();
    }
}
