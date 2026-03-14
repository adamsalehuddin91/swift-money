<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillTemplate extends Model
{
    protected $fillable = [
        'family_id', 'category', 'title', 'default_amount', 'assigned_to', 'is_active', 'debt_id',
    ];

    protected $casts = [
        'default_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function records(): HasMany
    {
        return $this->hasMany(BillRecord::class);
    }

    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }
}
