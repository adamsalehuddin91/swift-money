<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// 29hb setiap bulan — jana bills bulan depan + carry recurring income
Schedule::command('bills:generate-monthly')->monthlyOn(29, '08:00');
Schedule::command('income:carry-recurring')->monthlyOn(29, '08:05');
