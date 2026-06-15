<?php

namespace App\Services;

use Carbon\Carbon;

// "Boleh survive sampai gaji?" — projects end-of-month balance from current
// cash in hand, unpaid bills, and the running daily spend rate this month.
class ForecastService
{
    public function project(float $netBalance, float $unpaidBills, float $monthExpenses, string $monthYear): array
    {
        $now     = now();
        $current = $now->format('m-Y');

        // Only the live (current) month can be forecast.
        if ($monthYear !== $current) {
            return ['applicable' => false];
        }

        $daysInMonth   = (int) $now->daysInMonth;
        $today         = (int) $now->day;
        $daysElapsed   = max($today, 1);
        $daysRemaining = max($daysInMonth - $today, 0);

        $dailyAvg       = $monthExpenses / $daysElapsed;
        $projectedSpend = $dailyAvg * $daysRemaining;

        // Cash now, minus bills still due, minus expected remaining daily spend.
        $projectedEnd = $netBalance - $unpaidBills - $projectedSpend;

        // Status: red if it goes negative, amber if thin (< ~3 days buffer).
        $buffer = $dailyAvg * 3;
        $status = $projectedEnd < 0 ? 'risk' : ($projectedEnd < $buffer ? 'tight' : 'safe');

        return [
            'applicable'      => true,
            'current_balance' => round($netBalance, 2),
            'unpaid_bills'    => round($unpaidBills, 2),
            'daily_avg'       => round($dailyAvg, 2),
            'days_remaining'  => $daysRemaining,
            'projected_spend' => round($projectedSpend, 2),
            'projected_end'   => round($projectedEnd, 2),
            'status'          => $status,
        ];
    }
}
