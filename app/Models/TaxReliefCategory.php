<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TaxReliefCategory extends Model
{
    protected $fillable = ['ya', 'code', 'name', 'cap_amount', 'type', 'sort_order', 'active', 'description'];

    protected $casts = [
        'cap_amount' => 'decimal:2',
        'active'     => 'boolean',
    ];

    public function items(): HasMany { return $this->hasMany(TaxReliefItem::class); }
}
