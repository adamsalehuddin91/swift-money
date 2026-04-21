<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNull('last_login_at')
            ->update(['last_login_at' => DB::raw('updated_at')]);
    }

    public function down(): void
    {
        //
    }
};
