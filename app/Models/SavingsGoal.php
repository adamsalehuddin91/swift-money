<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingsGoal extends Model
{
    protected $fillable = [
        'family_id', 'title', 'target_amount', 'current_amount', 'deadline', 'emoji',
    ];

    protected $casts = [
        'target_amount'  => 'decimal:2',
        'current_amount' => 'decimal:2',
        'deadline'       => 'date',
    ];

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(SavingsContribution::class);
    }

    public function getProgressPercentAttribute(): int
    {
        if ($this->target_amount == 0) return 0;
        return min(100, (int) round(((float) $this->current_amount / (float) $this->target_amount) * 100));
    }

    public function getRemainingAttribute(): float
    {
        return max(0, (float) $this->target_amount - (float) $this->current_amount);
    }
}
