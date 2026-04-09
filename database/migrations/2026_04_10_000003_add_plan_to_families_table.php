<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('families', function (Blueprint $table) {
            $table->enum('plan', ['free', 'paid'])->default('free')->after('name');
            $table->timestamp('plan_expires_at')->nullable()->after('plan');
            $table->timestamp('subscribed_at')->nullable()->after('plan_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('families', function (Blueprint $table) {
            $table->dropColumn(['plan', 'plan_expires_at', 'subscribed_at']);
        });
    }
};
