<?php

use App\Http\Controllers\BillController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Income
    Route::post('/incomes', [IncomeController::class, 'store'])->name('incomes.store');
    Route::put('/incomes/{income}', [IncomeController::class, 'update'])->name('incomes.update');
    Route::delete('/incomes/{income}', [IncomeController::class, 'destroy'])->name('incomes.destroy');

    // Bills
    Route::post('/bills/templates', [BillController::class, 'storeTemplate'])->name('bills.templates.store');
    Route::put('/bills/templates/{template}/assign', [BillController::class, 'updateTemplate'])->name('bills.templates.assign');
    Route::post('/bills/{record}/toggle', [BillController::class, 'togglePaid'])->name('bills.toggle');
    Route::put('/bills/{record}/amount', [BillController::class, 'updateAmount'])->name('bills.amount.update');
    Route::post('/bills/{record}/receipt', [BillController::class, 'uploadReceipt'])->name('bills.receipt.upload');
    Route::delete('/bills/{record}/receipt', [BillController::class, 'deleteReceipt'])->name('bills.receipt.delete');

    // Debts
    Route::post('/debts', [DebtController::class, 'store'])->name('debts.store');
    Route::post('/debts/{debt}/pay', [DebtController::class, 'recordPayment'])->name('debts.pay');
    Route::get('/debts/{debt}/history', [DebtController::class, 'history'])->name('debts.history');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
