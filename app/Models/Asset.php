<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asset extends Model
{
    protected $fillable = ['family_id', 'name', 'type', 'value', 'note'];

    protected $casts = ['value' => 'decimal:2'];

    public function family(): BelongsTo { return $this->belongsTo(Family::class); }
}
