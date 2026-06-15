<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->decimal('monthly_limit', 10, 2);
            $table->timestamps();
            $table->unique(['family_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
