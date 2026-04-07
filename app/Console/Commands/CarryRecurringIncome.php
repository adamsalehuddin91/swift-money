<?php

namespace App\Console\Commands;

use App\Models\Family;
use App\Services\IncomeService;
use Illuminate\Console\Command;

class CarryRecurringIncome extends Command
{
    protected $signature = 'income:carry-recurring {--month= : Target month in mm-YYYY format (defaults to next month)}';
    protected $description = 'Auto-carry recurring incomes to next month. Runs on 29th alongside bill generation.';

    public function handle(IncomeService $incomeService): int
    {
        $monthYear = $this->option('month')
            ?? now()->addMonth()->format('m-Y');

        $families = Family::all();

        foreach ($families as $family) {
            $incomeService->carryRecurring($family->id, $monthYear);
            $this->info("Family #{$family->id}: recurring income carried to {$monthYear}");
        }

        $this->info("Siap! Recurring income carried for {$families->count()} keluarga.");

        return self::SUCCESS;
    }
}
