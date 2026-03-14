<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Family extends Model
{
    protected $fillable = ['name'];

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
