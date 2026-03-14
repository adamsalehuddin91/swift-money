<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Income extends Model
{
    protected $fillable = [
        'family_id', 'user_id', 'source', 'amount', 'month_year', 'is_recurring',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_recurring' => 'boolean',
    ];

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
