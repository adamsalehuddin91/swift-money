<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BillRecord extends Model
{
    protected $fillable = [
        'bill_template_id', 'month_year', 'actual_amount', 'is_paid', 'paid_at', 'receipt_path',
    ];

    protected $casts = [
        'actual_amount' => 'decimal:2',
        'is_paid' => 'boolean',
        'paid_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(BillTemplate::class, 'bill_template_id');
    }

    public function debtPayment(): HasOne
    {
        return $this->hasOne(DebtPayment::class);
    }
}
