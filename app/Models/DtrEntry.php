<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'dtr_id',
    'work_date',
    'time_in',
    'time_out',
    'holiday_type',
    'worked_minutes',
    'base_rate',
    'rate',
])]
class DtrEntry extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'work_date' => 'date',
            'base_rate' => 'decimal:2',
            'rate' => 'decimal:2',
        ];
    }

    public function dtr(): BelongsTo
    {
        return $this->belongsTo(Dtr::class);
    }
}