<?php

namespace App\Models;

use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'first_name',
    'middle_name',
    'last_name',
    'hourly_rate',
    'daily_rate',
    'employment_end_date',
    'scheduled_start_time',
    'scheduled_end_time',
    'grace_period_minutes',
    'work_days',
    'weekly_schedule',
])]
class Employee extends Model
{
    /** @use HasFactory<EmployeeFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hourly_rate' => 'decimal:2',
            'daily_rate' => 'decimal:2',
            'employment_end_date' => 'date',
            'work_days' => 'array',
            'weekly_schedule' => 'array',
        ];
    }
}
