<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NetWorthSnapshot extends Model
{
    protected $fillable = ['family_id', 'month_year', 'total_assets', 'total_liabilities', 'net_worth'];

    protected $casts = [
        'total_assets'      => 'decimal:2',
        'total_liabilities' => 'decimal:2',
        'net_worth'         => 'decimal:2',
    ];

    public function family(): BelongsTo { return $this->belongsTo(Family::class); }
}
