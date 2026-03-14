<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('source');
            $table->decimal('amount', 12, 2);
            $table->string('month_year', 7); // '03-2026'
            $table->boolean('is_recurring')->default(false);
            $table->timestamps();

            $table->index(['family_id', 'month_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
