<?php

use App\Models\Dtr;
use App\Models\Employee;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createRankingDtr(User $user, Employee $employee, array $entries): void
{
    $dtr = Dtr::query()->create([
        'employee_id' => $employee->id,
        'confirmed_by' => $user->id,
        'total_days' => count($entries),
        'total_worked_minutes' => count($entries) * 480,
        'total_overtime_minutes' => 0,
        'total_overtime_amount' => '0.00',
        'total_amount' => '0.00',
    ]);

    $dtr->entries()->createMany($entries);
}

test('ranking page requires authentication', function () {
    $this->get(route('ranking.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view employee punctuality rankings for the whole month', function () {
    $user = User::factory()->create();

    $employeeOverrides = [
        'scheduled_start_time' => '09:00:00',
        'scheduled_end_time' => '18:00:00',
        'grace_period_minutes' => 5,
        'work_days' => [1, 2, 3],
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
    ];

    $ana = Employee::factory()->create([
        ...$employeeOverrides,
        'first_name' => 'Ana',
        'middle_name' => null,
        'last_name' => 'Lopez',
    ]);
    $ben = Employee::factory()->create([
        ...$employeeOverrides,
        'first_name' => 'Ben',
        'middle_name' => null,
        'last_name' => 'Reyes',
    ]);
    $cara = Employee::factory()->create([
        ...$employeeOverrides,
        'first_name' => 'Cara',
        'middle_name' => null,
        'last_name' => 'Santos',
    ]);

    createRankingDtr($user, $ana, [
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
            'work_date' => '2026-03-03',
            'time_in' => '09:05:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 475,
            'base_rate' => '800.00',
            'rate' => '800.00',
        ],
        [
            'work_date' => '2026-03-18',
            'time_in' => '09:00:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 480,
            'base_rate' => '800.00',
            'rate' => '800.00',
        ],
    ]);

    createRankingDtr($user, $ben, [
        [
            'work_date' => '2026-03-02',
            'time_in' => '09:06:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 474,
            'base_rate' => '800.00',
            'rate' => '799.00',
        ],
        [
            'work_date' => '2026-03-03',
            'time_in' => '09:00:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 480,
            'base_rate' => '800.00',
            'rate' => '800.00',
        ],
        [
            'work_date' => '2026-03-18',
            'time_in' => '09:08:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 472,
            'base_rate' => '800.00',
            'rate' => '797.00',
        ],
    ]);

    createRankingDtr($user, $cara, [
        [
            'work_date' => '2026-03-18',
            'time_in' => '09:00:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 480,
            'base_rate' => '800.00',
            'rate' => '800.00',
        ],
    ]);

    $this->actingAs($user)
        ->get(route('ranking.index', [
            'month' => 3,
            'year' => 2026,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ranking/index')
            ->where('initialSelection.month', 3)
            ->where('initialSelection.year', 2026)
            ->where('initialSelection.calendarRange', 'wholeMonth')
            ->has('rankings', 3)
            ->where('rankings.0.rank', 1)
            ->where('rankings.0.employeeName', 'Ana Lopez')
            ->where('rankings.0.punctualityScore', 100)
            ->where('rankings.0.onTimeDays', 3)
            ->where('rankings.0.lateDays', 0)
            ->where('rankings.1.rank', 2)
            ->where('rankings.1.employeeName', 'Cara Santos')
            ->where('rankings.1.punctualityScore', 100)
            ->where('rankings.1.onTimeDays', 1)
            ->where('rankings.2.rank', 3)
            ->where('rankings.2.employeeName', 'Ben Reyes')
            ->where('rankings.2.punctualityScore', 33.33)
            ->where('rankings.2.onTimeDays', 1)
            ->where('rankings.2.lateDays', 2)
            ->where('rankings.2.totalLateMinutes', 4)
            ->where('rankings.2.evaluatedDays', 3),
        );
});

test('ranking page can filter punctuality rankings to the first two weeks', function () {
    $user = User::factory()->create();

    $employee = Employee::factory()->create([
        'first_name' => 'Ana',
        'middle_name' => null,
        'last_name' => 'Lopez',
        'scheduled_start_time' => '09:00:00',
        'scheduled_end_time' => '18:00:00',
        'grace_period_minutes' => 5,
        'work_days' => [1, 2],
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
    ]);

    $otherEmployee = Employee::factory()->create([
        'first_name' => 'Ben',
        'middle_name' => null,
        'last_name' => 'Reyes',
        'scheduled_start_time' => '09:00:00',
        'scheduled_end_time' => '18:00:00',
        'grace_period_minutes' => 5,
        'work_days' => [1, 2],
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
    ]);

    createRankingDtr($user, $employee, [
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
            'work_date' => '2026-03-18',
            'time_in' => '09:09:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 471,
            'base_rate' => '800.00',
            'rate' => '796.00',
        ],
    ]);

    createRankingDtr($user, $otherEmployee, [
        [
            'work_date' => '2026-03-03',
            'time_in' => '09:06:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 474,
            'base_rate' => '800.00',
            'rate' => '799.00',
        ],
        [
            'work_date' => '2026-03-19',
            'time_in' => '09:00:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 480,
            'base_rate' => '800.00',
            'rate' => '800.00',
        ],
    ]);

    $this->actingAs($user)
        ->get(route('ranking.index', [
            'month' => 3,
            'year' => 2026,
            'calendar_range' => 'firstTwoWeeks',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ranking/index')
            ->where('initialSelection.calendarRange', 'firstTwoWeeks')
            ->has('rankings', 2)
            ->where('rankings.0.employeeName', 'Ana Lopez')
            ->where('rankings.0.punctualityScore', 100)
            ->where('rankings.1.employeeName', 'Ben Reyes')
            ->where('rankings.1.punctualityScore', 0),
        );
});

test('ranking page can filter punctuality rankings to the last two weeks', function () {
    $user = User::factory()->create();

    $ana = Employee::factory()->create([
        'first_name' => 'Ana',
        'middle_name' => null,
        'last_name' => 'Lopez',
        'scheduled_start_time' => '09:00:00',
        'scheduled_end_time' => '18:00:00',
        'grace_period_minutes' => 5,
        'work_days' => [3],
        'weekly_schedule' => [
            ['day' => 3, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
    ]);
    $ben = Employee::factory()->create([
        'first_name' => 'Ben',
        'middle_name' => null,
        'last_name' => 'Reyes',
        'scheduled_start_time' => '09:00:00',
        'scheduled_end_time' => '18:00:00',
        'grace_period_minutes' => 5,
        'work_days' => [3],
        'weekly_schedule' => [
            ['day' => 3, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
    ]);

    createRankingDtr($user, $ana, [
        [
            'work_date' => '2026-03-18',
            'time_in' => '09:00:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 480,
            'base_rate' => '800.00',
            'rate' => '800.00',
        ],
    ]);

    createRankingDtr($user, $ben, [
        [
            'work_date' => '2026-03-18',
            'time_in' => '09:06:00',
            'time_out' => '18:00:00',
            'holiday_type' => 'none',
            'worked_minutes' => 474,
            'base_rate' => '800.00',
            'rate' => '799.00',
        ],
    ]);

    $this->actingAs($user)
        ->get(route('ranking.index', [
            'month' => 3,
            'year' => 2026,
            'calendar_range' => 'lastTwoWeeks',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ranking/index')
            ->where('initialSelection.calendarRange', 'lastTwoWeeks')
            ->has('rankings', 2)
            ->where('rankings.0.employeeName', 'Ana Lopez')
            ->where('rankings.1.employeeName', 'Ben Reyes')
            ->where('rankings.1.totalLateMinutes', 1),
        );
});
