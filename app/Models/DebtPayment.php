<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebtPayment extends Model
{
    protected $fillable = [
        'debt_id', 'bill_record_id', 'amount_paid', 'payment_date',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }

    public function billRecord(): BelongsTo
    {
        return $this->belongsTo(BillRecord::class);
    }
}
