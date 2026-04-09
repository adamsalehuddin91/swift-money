<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Family extends Model
{
    protected $fillable = ['name', 'plan', 'plan_expires_at', 'subscribed_at'];

    protected $casts = [
        'plan_expires_at' => 'datetime',
        'subscribed_at'   => 'datetime',
    ];

    public function isPaid(): bool
    {
        if ($this->plan !== 'paid') return false;
        if ($this->plan_expires_at && $this->plan_expires_at->isPast()) return false;
        return true;
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function incomes(): HasMany
    {
        return $this->hasMany(Income::class);
    }

    public function billTemplates(): HasMany
    {
        return $this->hasMany(BillTemplate::class);
    }

    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class);
    }
}
