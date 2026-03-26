<?php

use App\Models\Dtr;
use App\Models\DtrEntry;
use App\Models\Employee;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('summary page requires authentication', function () {
    $this->get(route('summary.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view confirmed dtrs in summary', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'first_name' => 'Ana',
        'middle_name' => 'Marie',
        'last_name' => 'Lopez',
    ]);

    $dtr = Dtr::query()->create([
        'employee_id' => $employee->id,
        'confirmed_by' => $user->id,
        'total_days' => 2,
        'total_worked_minutes' => 900,
        'total_overtime_minutes' => 120,
        'total_overtime_amount' => '2000.00',
        'total_amount' => '4400.00',
    ]);

    $dtr->entries()->createMany([
        [
            'work_date' => '2026-03-02',
            'time_in' => '09:00:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 480,
            'base_rate' => '800.00',
            'rate' => '800.00',
        ],
        [
            'work_date' => '2026-03-07',
            'time_in' => '09:00:00',
            'time_out' => '17:00:00',
            'holiday_type' => 'regularHoliday',
            'worked_minutes' => 420,
            'base_rate' => '800.00',
            'rate' => '1600.00',
        ],
    ]);

    $this->actingAs($user)
        ->get(route('summary.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('summary/index')
            ->has('dtrs', 1)
            ->where('dtrs.0.employeeId', $employee->id)
            ->where('dtrs.0.employeeName', 'Ana Marie Lopez')
            ->where('dtrs.0.month', 3)
            ->where('dtrs.0.monthLabel', 'March')
            ->where('dtrs.0.year', 2026)
            ->where('dtrs.0.totalDays', 2)
            ->where('dtrs.0.totalWorkedMinutes', 900)
            ->where('dtrs.0.regularAmount', '2400.00')
            ->where('dtrs.0.dailyRateBasis', '800.00')
            ->where('dtrs.0.totalOvertimeMinutes', 120)
            ->where('dtrs.0.totalOvertimeAmount', '2000.00')
            ->where('dtrs.0.totalAmount', '4400.00')
            ->has('dtrs.0.entries', 2)
            ->where('dtrs.0.entries.0.date', '2026-03-02')
            ->where('dtrs.0.entries.0.timeIn', '09:00')
            ->where('dtrs.0.entries.0.timeOut', '18:00')
            ->where('dtrs.0.entries.1.holidayType', 'regularHoliday')
            ->where('dtrs.0.entries.1.workedMinutes', 420),
        );
});

test('authenticated users can delete confirmed dtrs from summary', function () {
    $user = User::factory()->create();
    $employee = Employee::factory()->create();

    $dtr = Dtr::query()->create([
        'employee_id' => $employee->id,
        'confirmed_by' => $user->id,
        'total_days' => 1,
        'total_worked_minutes' => 480,
        'total_amount' => '800.00',
    ]);

    $dtr->entries()->create([
        'work_date' => '2026-03-03',
        'time_in' => '09:00:00',
        'time_out' => '18:00:00',
        'holiday_type' => 'none',
        'worked_minutes' => 480,
        'base_rate' => '800.00',
        'rate' => '800.00',
    ]);

    $this->actingAs($user)
        ->delete(route('summary.destroy', $dtr))
        ->assertRedirect(route('summary.index'))
        ->assertSessionHas('success', 'DTR deleted successfully.');

    expect(Dtr::query()->count())->toBe(0)
        ->and(DtrEntry::query()->count())->toBe(0);
});
