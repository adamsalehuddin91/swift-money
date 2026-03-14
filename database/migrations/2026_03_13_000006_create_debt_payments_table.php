<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bill_record_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount_paid', 12, 2);
            $table->date('payment_date');
            $table->timestamps();

            $table->index('debt_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debt_payments');
    }
};
