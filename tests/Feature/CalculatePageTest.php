<?php

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
            ->where('employees.1.fullName', 'Ben Reyes')
            ->where('employees.1.dailyRate', '800.00')
            ->where('employees.1.workDays', [1, 2, 3, 4, 5, 6]),
        );
});
