<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bill_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_id')->constrained()->cascadeOnDelete();
            $table->string('category'); // Sekolah, Rumah, Insurance, Coway, Lain2
            $table->string('title');
            $table->decimal('default_amount', 12, 2);
            $table->string('assigned_to'); // Abg / Ayg
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['family_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_templates');
    }
};
