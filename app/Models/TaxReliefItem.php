<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaxReliefItem extends Model
{
    protected $fillable = [
        'family_id', 'user_id', 'ya', 'tax_relief_category_id',
        'title', 'amount', 'date', 'receipt_path', 'source', 'source_id', 'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    public function family(): BelongsTo { return $this->belongsTo(Family::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function category(): BelongsTo { return $this->belongsTo(TaxReliefCategory::class, 'tax_relief_category_id'); }
}
