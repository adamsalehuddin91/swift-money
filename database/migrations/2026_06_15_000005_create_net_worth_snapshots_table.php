<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Monthly net-worth snapshot for the trend graph. One row per family per month.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('net_worth_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();
            $table->string('month_year', 7); // 'm-Y'
            $table->decimal('total_assets', 12, 2)->default(0);
            $table->decimal('total_liabilities', 12, 2)->default(0);
            $table->decimal('net_worth', 12, 2)->default(0);
            $table->timestamps();
            $table->unique(['family_id', 'month_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('net_worth_snapshots');
    }
};
