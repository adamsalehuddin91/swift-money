<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A claimed expense tagged to a tax-relief category, per person (user) per YA.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('tax_relief_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->smallInteger('ya');
            $table->foreignId('tax_relief_category_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 10, 2);
            $table->date('date')->nullable();
            $table->string('receipt_path')->nullable();
            $table->string('source')->default('manual'); // manual | expense | bill
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_relief_items');
    }
};
