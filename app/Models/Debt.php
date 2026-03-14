<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Debt extends Model
{
    protected $fillable = [
        'family_id', 'title', 'total_amount', 'current_balance', 'type',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'current_balance' => 'decimal:2',
    ];

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }

    public function getPaidAmountAttribute(): float
    {
        return $this->total_amount - $this->current_balance;
    }

    public function getProgressPercentAttribute(): int
    {
        if ($this->total_amount == 0) return 0;
        return (int) round(($this->paid_amount / $this->total_amount) * 100);
    }
}
