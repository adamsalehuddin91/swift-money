<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-generate next month's bill records on the 25th at 8AM
Schedule::command('bills:generate-monthly')->monthlyOn(25, '08:00');
