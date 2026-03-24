<?php

use App\Models\Employee;
use Illuminate\Support\Facades\Schema;

test('employees table includes profile and schedule fields', function () {
    expect(Schema::hasTable('employees'))->toBeTrue()
        ->and(Schema::hasColumns('employees', [
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
            'deleted_at',
        ]))->toBeTrue();

    expect(Schema::hasColumn('employees', 'hire_date'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'break_minutes'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'employee_number'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'job_title'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'email'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'phone'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'department'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'employment_status'))->toBeFalse()
        ->and(Schema::hasColumn('employees', 'suffix'))->toBeFalse();
});

test('employees can be stored with a fixed weekly schedule', function () {
    $employee = Employee::factory()->create();

    $this->assertDatabaseHas('employees', [
        'id' => $employee->id,
        'hourly_rate' => '100.00',
        'daily_rate' => '800.00',
        'scheduled_start_time' => '08:00:00',
        'scheduled_end_time' => '17:00:00',
        'grace_period_minutes' => 5,
    ]);

    expect($employee->fresh()->hourly_rate)->toBe('100.00')
        ->and($employee->fresh()->daily_rate)->toBe('800.00')
        ->and($employee->fresh()->work_days)->toBe([1, 2, 3, 4, 5])
        ->and($employee->fresh()->weekly_schedule)->toBe([
            ['day' => 1, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 4, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 5, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
        ]);
});
