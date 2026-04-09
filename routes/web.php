<?php

use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SavingsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// Google OAuth
Route::get('/auth/google', [SocialAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [SocialAuthController::class, 'callback'])->name('auth.google.callback');

// Family Invite
Route::get('/join/{token}', [InviteController::class, 'show'])->name('invite.show');
Route::post('/invite/generate', [InviteController::class, 'generate'])->name('invite.generate')->middleware('auth');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/analytics', [DashboardController::class, 'analytics'])->name('analytics');

    // Income
    Route::post('/incomes', [IncomeController::class, 'store'])->name('incomes.store');
    Route::put('/incomes/{income}', [IncomeController::class, 'update'])->name('incomes.update');
    Route::delete('/incomes/{income}', [IncomeController::class, 'destroy'])->name('incomes.destroy');

    // Bills
    Route::post('/bills/templates', [BillController::class, 'storeTemplate'])->name('bills.templates.store');
    Route::put('/bills/templates/{template}', [BillController::class, 'updateTemplate'])->name('bills.templates.update');
    Route::put('/bills/templates/{template}/assign', [BillController::class, 'updateTemplate'])->name('bills.templates.assign');
    Route::delete('/bills/templates/{template}', [BillController::class, 'archiveTemplate'])->name('bills.templates.destroy');
    Route::post('/bills/{record}/toggle', [BillController::class, 'togglePaid'])->name('bills.toggle');
    Route::put('/bills/{record}/amount', [BillController::class, 'updateAmount'])->name('bills.amount.update');
    Route::get('/bills/{record}/receipt', [BillController::class, 'viewReceipt'])->name('bills.receipt.view');
    Route::post('/bills/{record}/receipt', [BillController::class, 'uploadReceipt'])->name('bills.receipt.upload');
    Route::delete('/bills/{record}/receipt', [BillController::class, 'deleteReceipt'])->name('bills.receipt.delete');

    // Debts
    Route::post('/debts', [DebtController::class, 'store'])->name('debts.store');
    Route::put('/debts/{debt}', [DebtController::class, 'update'])->name('debts.update');
    Route::post('/debts/{debt}/settle', [DebtController::class, 'settle'])->name('debts.settle');
    Route::delete('/debts/{debt}', [DebtController::class, 'destroy'])->name('debts.destroy');
    Route::post('/debts/{debt}/pay', [DebtController::class, 'recordPayment'])->name('debts.pay');
    Route::get('/debts/{debt}/history', [DebtController::class, 'history'])->name('debts.history');

    // Savings Goals
    Route::post('/savings', [SavingsController::class, 'store'])->name('savings.store');
    Route::put('/savings/{savingsGoal}', [SavingsController::class, 'update'])->name('savings.update');
    Route::delete('/savings/{savingsGoal}', [SavingsController::class, 'destroy'])->name('savings.destroy');
    Route::post('/savings/{savingsGoal}/contribute', [SavingsController::class, 'contribute'])->name('savings.contribute');
    Route::get('/savings/{savingsGoal}/history', [SavingsController::class, 'history'])->name('savings.history');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
