<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('total_amount', 12, 2);
            $table->decimal('current_balance', 12, 2);
            $table->enum('type', ['fixed', 'flexible'])->default('fixed');
            $table->timestamps();

            $table->index('family_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
