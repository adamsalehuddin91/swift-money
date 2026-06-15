<?php

namespace App\Console\Commands;

use App\Models\BillRecord;
use App\Models\User;
use App\Notifications\BillDueReminder;
use Illuminate\Console\Command;

// Daily: push a reminder for unpaid bills due within the next few days.
class RemindDueBills extends Command
{
    protected $signature = 'app:remind-due-bills {--days=2 : Days ahead to warn}';
    protected $description = 'Web-push reminder for unpaid bills due soon';

    public function handle(): int
    {
        $monthYear = now()->format('m-Y');
        $today     = (int) now()->day;
        $window    = (int) $this->option('days');

        $records = BillRecord::with('template')
            ->where('month_year', $monthYear)
            ->where('is_paid', false)
            ->where('is_skipped', false)
            ->whereHas('template', fn ($q) => $q->where('is_active', true)->whereNotNull('due_day'))
            ->get();

        // Bills due today .. today+window
        $dueSoon = $records->filter(function ($r) use ($today, $window) {
            $due = (int) $r->template->due_day;
            return $due >= $today && ($due - $today) <= $window;
        })->groupBy(fn ($r) => $r->template->family_id);

        $sent = 0;
        foreach ($dueSoon as $familyId => $bills) {
            $count = $bills->count();
            $total = $bills->sum(fn ($r) => (float) $r->actual_amount);
            $names = $bills->take(3)->map(fn ($r) => $r->template->title)->implode(', ');
            if ($count > 3) {
                $names .= ' +' . ($count - 3);
            }

            $body = "{$count} bil due tak lama lagi (RM" . number_format($total, 2) . "): {$names}";

            User::where('family_id', $familyId)->get()->each(function (User $user) use ($body, &$sent) {
                $user->notify(new BillDueReminder('Peringatan Bil 💸', $body));
                $sent++;
            });
        }

        $this->info("Reminders queued for {$sent} user(s).");
        return self::SUCCESS;
    }
}
