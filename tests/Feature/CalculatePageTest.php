<?php

use App\Models\Dtr;
use App\Models\DtrEntry;
use App\Models\Employee;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('calculate page requires authentication', function () {
    $this->get(route('calculate.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view employees, daily rates, and scheduled work days in the calculate dropdown', function () {
    $user = User::factory()->create();

    Employee::factory()->create([
        'first_name' => 'Ana',
        'middle_name' => 'Marie',
        'last_name' => 'Lopez',
        'monthly_rate' => '23400.00',
        'daily_rate' => '900.00',
        'hourly_rate' => '112.50',
        'work_days' => [1, 2, 3, 4, 5],
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 4, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 5, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
        ],
    ]);

    Employee::factory()->create([
        'first_name' => 'Ben',
        'middle_name' => null,
        'last_name' => 'Reyes',
        'monthly_rate' => '20800.00',
        'daily_rate' => '800.00',
        'hourly_rate' => '100.00',
        'work_days' => [1, 2, 3, 4, 5, 6],
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 4, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 5, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 6, 'start_time' => '09:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
        ],
    ]);

    $this->actingAs($user)
        ->get(route('calculate.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calculate/index')
            ->has('employees', 2)
            ->where('employees.0.fullName', 'Ana Marie Lopez')
            ->where('employees.0.dailyRate', '900.00')
            ->where('employees.0.workDays', [1, 2, 3, 4, 5])
            ->has('employees.0.schedule', 5)
            ->where('employees.0.schedule.0.day', 1)
            ->where('employees.0.schedule.0.startTime', '08:00')
            ->where('employees.0.schedule.0.endTime', '17:00')
            ->where('employees.0.schedule.0.graceMinutes', 5)
            ->where('employees.1.fullName', 'Ben Reyes')
            ->where('employees.1.dailyRate', '800.00')
            ->where('employees.1.workDays', [1, 2, 3, 4, 5, 6])
            ->has('employees.1.schedule', 6)
            ->where('employees.1.schedule.5.day', 6)
            ->where('employees.1.schedule.5.startTime', '09:00')
            ->where('employees.1.schedule.5.endTime', '17:00')
            ->where('employees.1.schedule.5.graceMinutes', 5)
            ->where('initialSelection.month', now()->month)
            ->where('initialSelection.year', now()->year)
            ->where('isEditingFromSummary', false)
            ->where('activeDtr', null),
        );
});

test('calculate page can preload a confirmed dtr for reopening from summary', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'first_name' => 'Ben',
        'last_name' => 'Reyes',
        'daily_rate' => '800.00',
    ]);

    $dtr = Dtr::query()->create([
        'employee_id' => $employee->id,
        'confirmed_by' => $user->id,
        'total_days' => 1,
        'total_worked_minutes' => 420,
        'total_amount' => '1040.00',
    ]);

    $dtr->entries()->create([
        'work_date' => '2026-03-02',
        'time_in' => '09:00:00',
        'time_out' => '17:00:00',
        'holiday_type' => 'specialWorkingHoliday',
        'worked_minutes' => 420,
        'base_rate' => '800.00',
        'rate' => '1040.00',
    ]);

    $this->actingAs($user)
        ->get(route('calculate.index', [
            'employee' => $employee->id,
            'month' => 3,
            'year' => 2026,
            'source' => 'summary',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calculate/index')
            ->where('initialSelection.employeeId', $employee->id)
            ->where('initialSelection.month', 3)
            ->where('initialSelection.year', 2026)
            ->where('isEditingFromSummary', true)
            ->where('activeDtr.employeeId', $employee->id)
            ->where('activeDtr.month', 3)
            ->where('activeDtr.year', 2026)
            ->has('activeDtr.entries', 1)
            ->where('activeDtr.entries.0.date', '2026-03-02')
            ->where('activeDtr.entries.0.timeIn', '09:00')
            ->where('activeDtr.entries.0.timeOut', '17:00')
            ->where('activeDtr.entries.0.holidayType', 'specialWorkingHoliday')
            ->where('activeDtr.entries.0.baseRate', '800.00')
            ->where('activeDtr.entries.0.rate', '1040.00')
            ->where('activeDtr.entries.0.isAbsent', false),
        );
});

test('calculate page can preload an absent day for reopening from summary', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'daily_rate' => '800.00',
    ]);

    $dtr = Dtr::query()->create([
        'employee_id' => $employee->id,
        'confirmed_by' => $user->id,
        'total_days' => 1,
        'total_worked_minutes' => 0,
        'total_amount' => '0.00',
    ]);

    $dtr->entries()->create([
        'work_date' => '2026-03-03',
        'time_in' => null,
        'time_out' => null,
        'holiday_type' => 'none',
        'worked_minutes' => 0,
        'base_rate' => '0.00',
        'rate' => '0.00',
    ]);

    $this->actingAs($user)
        ->get(route('calculate.index', [
            'employee' => $employee->id,
            'month' => 3,
            'year' => 2026,
            'source' => 'summary',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calculate/index')
            ->where('activeDtr.entries.0.date', '2026-03-03')
            ->where('activeDtr.entries.0.timeIn', '')
            ->where('activeDtr.entries.0.timeOut', '')
            ->where('activeDtr.entries.0.baseRate', '0.00')
            ->where('activeDtr.entries.0.rate', '0.00')
            ->where('activeDtr.entries.0.isAbsent', true),
        );
});

test('authenticated users can confirm and store dtrs', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'first_name' => 'Ben',
        'last_name' => 'Reyes',
        'daily_rate' => '800.00',
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 6, 'start_time' => '09:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
        ],
        'work_days' => [1, 6],
    ]);

    $payload = [
        'employee_id' => $employee->id,
        'month' => 3,
        'year' => 2026,
        'entries' => [
            [
                'date' => '2026-03-02',
                'time_in' => '09:00',
                'time_out' => '18:00',
                'holiday_type' => 'none',
                'base_rate' => '800.00',
                'rate' => '800.00',
                'is_absent' => false,
            ],
            [
                'date' => '2026-03-07',
                'time_in' => '09:00',
                'time_out' => '17:00',
                'holiday_type' => 'regularHoliday',
                'base_rate' => '800.00',
                'rate' => '1600.00',
                'is_absent' => false,
            ],
        ],
    ];

    $this->actingAs($user)
        ->post(route('calculate.store'), $payload)
        ->assertRedirect(route('calculate.index', [
            'employee' => $employee->id,
            'month' => 3,
            'year' => 2026,
        ]))
        ->assertSessionHas('success', 'DTR confirmed and saved successfully.');

    $dtr = Dtr::query()->with('entries')->sole();
    $entries = $dtr->entries->sortBy('work_date')->values();

    expect($dtr->employee_id)->toBe($employee->id)
        ->and($dtr->confirmed_by)->toBe($user->id)
        ->and($dtr->total_days)->toBe(2)
        ->and($dtr->total_worked_minutes)->toBe(900)
        ->and((string) $dtr->total_amount)->toBe('2400.00')
        ->and($entries)->toHaveCount(2)
        ->and($entries[0]->work_date->toDateString())->toBe('2026-03-02')
        ->and($entries[0]->time_in)->toBe('09:00:00')
        ->and($entries[0]->time_out)->toBe('18:00:00')
        ->and($entries[0]->holiday_type)->toBe('none')
        ->and($entries[0]->worked_minutes)->toBe(480)
        ->and((string) $entries[0]->base_rate)->toBe('800.00')
        ->and((string) $entries[0]->rate)->toBe('800.00')
        ->and($entries[1]->work_date->toDateString())->toBe('2026-03-07')
        ->and($entries[1]->holiday_type)->toBe('regularHoliday')
        ->and($entries[1]->worked_minutes)->toBe(420)
        ->and((string) $entries[1]->rate)->toBe('1600.00');
});

test('late arrivals and half days are computed from the employee schedule', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'first_name' => 'Ben',
        'last_name' => 'Reyes',
        'daily_rate' => '800.00',
        'grace_period_minutes' => 5,
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
        'work_days' => [1, 2],
    ]);

    $payload = [
        'employee_id' => $employee->id,
        'month' => 3,
        'year' => 2026,
        'entries' => [
            [
                'date' => '2026-03-02',
                'time_in' => '09:06',
                'time_out' => '18:00',
                'holiday_type' => 'none',
                'base_rate' => '800.00',
                'rate' => '9999.00',
                'is_absent' => false,
            ],
            [
                'date' => '2026-03-03',
                'time_in' => '12:00',
                'time_out' => '18:00',
                'holiday_type' => 'none',
                'base_rate' => '800.00',
                'rate' => '9999.00',
                'is_absent' => false,
            ],
        ],
    ];

    $this->actingAs($user)
        ->post(route('calculate.store'), $payload)
        ->assertRedirect(route('calculate.index', [
            'employee' => $employee->id,
            'month' => 3,
            'year' => 2026,
        ]));

    $dtr = Dtr::query()->with('entries')->sole();
    $entries = $dtr->entries->sortBy('work_date')->values();

    expect($dtr->total_days)->toBe(2)
        ->and($dtr->total_worked_minutes)->toBe(774)
        ->and((string) $dtr->total_amount)->toBe('1199.00')
        ->and((string) $entries[0]->base_rate)->toBe('800.00')
        ->and((string) $entries[0]->rate)->toBe('799.00')
        ->and($entries[0]->worked_minutes)->toBe(474)
        ->and((string) $entries[1]->base_rate)->toBe('800.00')
        ->and((string) $entries[1]->rate)->toBe('400.00')
        ->and($entries[1]->worked_minutes)->toBe(300);
});

test('authenticated users can confirm and store absent days', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'daily_rate' => '800.00',
    ]);

    $payload = [
        'employee_id' => $employee->id,
        'month' => 3,
        'year' => 2026,
        'entries' => [
            [
                'date' => '2026-03-03',
                'time_in' => null,
                'time_out' => null,
                'holiday_type' => 'none',
                'base_rate' => '0.00',
                'rate' => '0.00',
                'is_absent' => true,
            ],
        ],
    ];

    $this->actingAs($user)
        ->post(route('calculate.store'), $payload)
        ->assertRedirect(route('calculate.index', [
            'employee' => $employee->id,
            'month' => 3,
            'year' => 2026,
        ]));

    $dtr = Dtr::query()->with('entries')->sole();
    $entry = DtrEntry::query()->sole();

    expect($dtr->total_days)->toBe(1)
        ->and($dtr->total_worked_minutes)->toBe(0)
        ->and((string) $dtr->total_amount)->toBe('0.00')
        ->and($entry->work_date->toDateString())->toBe('2026-03-03')
        ->and($entry->time_in)->toBeNull()
        ->and($entry->time_out)->toBeNull()
        ->and($entry->holiday_type)->toBe('none')
        ->and($entry->worked_minutes)->toBe(0)
        ->and((string) $entry->base_rate)->toBe('0.00')
        ->and((string) $entry->rate)->toBe('0.00');
});

test('confirming the same employee and period updates the stored dtr', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'daily_rate' => '800.00',
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
        'work_days' => [1, 2],
    ]);

    $firstPayload = [
        'employee_id' => $employee->id,
        'month' => 3,
        'year' => 2026,
        'entries' => [
            [
                'date' => '2026-03-02',
                'time_in' => '09:00',
                'time_out' => '18:00',
                'holiday_type' => 'none',
                'base_rate' => '800.00',
                'rate' => '800.00',
                'is_absent' => false,
            ],
            [
                'date' => '2026-03-03',
                'time_in' => '09:00',
                'time_out' => '18:00',
                'holiday_type' => 'none',
                'base_rate' => '800.00',
                'rate' => '800.00',
                'is_absent' => false,
            ],
        ],
    ];

    $updatedPayload = [
        'employee_id' => $employee->id,
        'month' => 3,
        'year' => 2026,
        'entries' => [
            [
                'date' => '2026-03-02',
                'time_in' => '09:00',
                'time_out' => '17:00',
                'holiday_type' => 'specialWorkingHoliday',
                'base_rate' => '800.00',
                'rate' => '1040.00',
                'is_absent' => false,
            ],
        ],
    ];

    $this->actingAs($user)->post(route('calculate.store'), $firstPayload);
    $this->actingAs($user)->post(route('calculate.store'), $updatedPayload);

    $dtr = Dtr::query()->with('entries')->sole();
    $entry = DtrEntry::query()->sole();

    expect(Dtr::query()->count())->toBe(1)
        ->and(DtrEntry::query()->count())->toBe(1)
        ->and($dtr->total_days)->toBe(1)
        ->and($dtr->total_worked_minutes)->toBe(420)
        ->and((string) $dtr->total_amount)->toBe('1040.00')
        ->and($entry->work_date->toDateString())->toBe('2026-03-02')
        ->and($entry->holiday_type)->toBe('specialWorkingHoliday')
        ->and((string) $entry->rate)->toBe('1040.00');
});
