<?php

namespace Database\Seeders;

use App\Models\BillRecord;
use App\Models\BillTemplate;
use App\Models\Debt;
use App\Models\DebtPayment;
use App\Models\Family;
use App\Models\Income;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SwiftMoneySeeder extends Seeder
{
    public function run(): void
    {
        $family = Family::create(['name' => 'Keluarga Adam']);

        $abg = User::create([
            'name' => 'Abg',
            'email' => 'abg@swiftmoney.my',
            'password' => Hash::make('password'),
            'family_id' => $family->id,
            'role' => 'admin',
        ]);

        $ayg = User::create([
            'name' => 'Ayg',
            'email' => 'ayg@swiftmoney.my',
            'password' => Hash::make('password'),
            'family_id' => $family->id,
            'role' => 'member',
        ]);

        $monthYear = now()->format('m-Y');

        // Incomes
        Income::create(['family_id' => $family->id, 'user_id' => $abg->id, 'source' => 'Gaji Hakiki', 'amount' => 8500, 'month_year' => $monthYear, 'is_recurring' => true]);
        Income::create(['family_id' => $family->id, 'user_id' => $abg->id, 'source' => 'Hasil Felda', 'amount' => 2450, 'month_year' => $monthYear, 'is_recurring' => true]);

        // Bill Templates + Records
        $bills = [
            ['category' => 'Sekolah', 'title' => 'SRITI Adam Luthfi', 'default_amount' => 370, 'assigned_to' => 'Ayg', 'paid' => true],
            ['category' => 'Sekolah', 'title' => 'SRITI Adam Luqman', 'default_amount' => 370, 'assigned_to' => 'Ayg', 'paid' => true],
            ['category' => 'Sekolah', 'title' => 'Pasti AlFatah (Lutfan)', 'default_amount' => 300, 'assigned_to' => 'Ayg', 'paid' => true],
            ['category' => 'Sekolah', 'title' => 'Taska Adam Lubaid', 'default_amount' => 435, 'assigned_to' => 'Ayg', 'paid' => true],
            ['category' => 'Sekolah', 'title' => 'Tusyen Adam Luthfi', 'default_amount' => 120, 'assigned_to' => 'Abg', 'paid' => false],
            ['category' => 'Sekolah', 'title' => 'Ngaji', 'default_amount' => 100, 'assigned_to' => 'Ayg', 'paid' => true],
            ['category' => 'Rumah', 'title' => 'Rumah Jasin', 'default_amount' => 1385, 'assigned_to' => 'Abg', 'paid' => true],
            ['category' => 'Rumah', 'title' => 'Rumah Nuri', 'default_amount' => 2610, 'assigned_to' => 'Ayg', 'paid' => true],
            ['category' => 'Rumah', 'title' => 'P. Loan Abg', 'default_amount' => 1720, 'assigned_to' => 'Abg', 'paid' => true],
            ['category' => 'Rumah', 'title' => 'P. Loan Ayg', 'default_amount' => 2100, 'assigned_to' => 'Ayg', 'paid' => true],
            ['category' => 'Rumah', 'title' => 'Bil Api Jasin', 'default_amount' => 115.40, 'assigned_to' => 'Abg', 'paid' => false],
            ['category' => 'Rumah', 'title' => 'Internet Rumah', 'default_amount' => 165, 'assigned_to' => 'Abg', 'paid' => false],
            ['category' => 'Lain2', 'title' => 'Motor JXG8767', 'default_amount' => 385, 'assigned_to' => 'Abg', 'paid' => false],
        ];

        foreach ($bills as $bill) {
            $paid = $bill['paid'];
            unset($bill['paid']);

            $template = BillTemplate::create([
                'family_id' => $family->id,
                ...$bill,
            ]);

            BillRecord::create([
                'bill_template_id' => $template->id,
                'month_year' => $monthYear,
                'actual_amount' => $template->default_amount,
                'is_paid' => $paid,
                'paid_at' => $paid ? now() : null,
            ]);
        }

        // Debts
        $debtCC = Debt::create([
            'family_id' => $family->id,
            'title' => 'Total Pintu (CC)',
            'total_amount' => 7000,
            'current_balance' => 3632.73,
            'type' => 'fixed',
        ]);

        $debtKakak = Debt::create([
            'family_id' => $family->id,
            'title' => 'Hutang Kakak',
            'total_amount' => 5140,
            'current_balance' => 1600,
            'type' => 'flexible',
        ]);

        // Sample debt payment history
        DebtPayment::create(['debt_id' => $debtCC->id, 'amount_paid' => 700, 'payment_date' => now()->subMonths(4)->toDateString()]);
        DebtPayment::create(['debt_id' => $debtCC->id, 'amount_paid' => 700, 'payment_date' => now()->subMonths(3)->toDateString()]);
        DebtPayment::create(['debt_id' => $debtCC->id, 'amount_paid' => 700, 'payment_date' => now()->subMonths(2)->toDateString()]);
        DebtPayment::create(['debt_id' => $debtCC->id, 'amount_paid' => 567.27, 'payment_date' => now()->subMonths(1)->toDateString()]);
        DebtPayment::create(['debt_id' => $debtKakak->id, 'amount_paid' => 1000, 'payment_date' => now()->subMonths(2)->toDateString()]);
        DebtPayment::create(['debt_id' => $debtKakak->id, 'amount_paid' => 1000, 'payment_date' => now()->subMonths(1)->toDateString()]);
        DebtPayment::create(['debt_id' => $debtKakak->id, 'amount_paid' => 540, 'payment_date' => now()->subWeeks(1)->toDateString()]);
    }
}
