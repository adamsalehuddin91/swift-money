<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    protected $fillable = ['family_id', 'category', 'monthly_limit'];

    protected $casts = ['monthly_limit' => 'decimal:2'];

    public function family(): BelongsTo { return $this->belongsTo(Family::class); }
}
