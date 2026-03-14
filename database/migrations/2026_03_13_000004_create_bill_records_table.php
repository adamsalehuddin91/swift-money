<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bill_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bill_template_id')->constrained()->cascadeOnDelete();
            $table->string('month_year', 7); // '03-2026'
            $table->decimal('actual_amount', 12, 2);
            $table->boolean('is_paid')->default(false);
            $table->timestamp('paid_at')->nullable();
            $table->string('receipt_path')->nullable();
            $table->timestamps();

            $table->unique(['bill_template_id', 'month_year']);
            $table->index('month_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_records');
    }
};
