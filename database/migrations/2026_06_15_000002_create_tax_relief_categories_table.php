<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Reference list of LHDN tax-relief / rebate categories, per Year of Assessment (YA).
// Caps are EDITABLE — rates change every Belanjawan. Seeded with placeholders.
return new class extends Migration {
    public function up(): void
    {
        Schema::create('tax_relief_categories', function (Blueprint $table) {
            $table->id();
            $table->smallInteger('ya');                       // tahun taksiran (e.g. 2026)
            $table->string('code');
            $table->string('name');
            $table->decimal('cap_amount', 10, 2)->nullable(); // null = no cap / verify
            $table->enum('type', ['relief', 'rebate'])->default('relief');
            $table->integer('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->string('description')->nullable();
            $table->timestamps();
            $table->unique(['ya', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_relief_categories');
    }
};
