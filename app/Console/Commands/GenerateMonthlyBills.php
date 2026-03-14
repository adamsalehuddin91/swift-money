<?php

namespace App\Console\Commands;

use App\Models\Family;
use App\Services\BillService;
use Illuminate\Console\Command;

class GenerateMonthlyBills extends Command
{
    protected $signature = 'bills:generate-monthly {--month= : Month in mm-YYYY format (defaults to next month)}';
    protected $description = 'Auto-generate bill records for all families. Runs on 25th to prep next month.';

    public function handle(BillService $billService): int
    {
        $monthYear = $this->option('month')
            ?? now()->addMonth()->format('m-Y');

        $families = Family::all();
        $totalCreated = 0;

        foreach ($families as $family) {
            $created = $billService->generateMonthlyRecords($family->id, $monthYear);
            $totalCreated += $created;

            if ($created > 0) {
                $this->info("Family #{$family->id}: {$created} bil dijana untuk {$monthYear}");
            }
        }

        $this->info("Siap! {$totalCreated} bil dijana untuk {$families->count()} keluarga.");

        return self::SUCCESS;
    }
}
