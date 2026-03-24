<?php

use App\Models\Employee;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('employees page requires authentication', function () {
    $this->get(route('employees.index'))
        ->assertRedirect(route('login'));
});

test('employees cannot be created by guests', function () {
    $this->post(route('employees.store'), [])
        ->assertRedirect(route('login'));
});

test('authenticated users can visit the employees page', function () {
    $user = User::factory()->create();

    Employee::factory()->create([
        'first_name' => 'Alice',
        'middle_name' => null,
        'last_name' => 'Adams',
        'monthly_rate' => '26104.00',
        'hourly_rate' => '125.50',
        'daily_rate' => '1004.00',
        'scheduled_start_time' => '09:00:00',
        'scheduled_end_time' => '18:00:00',
        'grace_period_minutes' => 5,
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

    Employee::factory()->create([
        'first_name' => 'Brian',
        'middle_name' => null,
        'last_name' => 'Brown',
        'monthly_rate' => '20800.00',
        'hourly_rate' => '100.00',
        'daily_rate' => '800.00',
        'scheduled_start_time' => '08:00:00',
        'scheduled_end_time' => '17:00:00',
        'grace_period_minutes' => 5,
        'work_days' => [1, 2, 3, 4, 5],
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 4, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
            ['day' => 5, 'start_time' => '08:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
        ],
    ]);

    $this->actingAs($user)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
            ->where('summary.totalEmployees', 2)
            ->where('summary.averageWorkDays', 6)
            ->where('summary.averageGraceMinutes', 5)
            ->has('employees', 2)
            ->where('employees.0.firstName', 'Alice')
            ->where('employees.0.lastName', 'Adams')
            ->where('employees.0.fullName', 'Alice Adams')
            ->where('employees.0.monthlyRate', '26104.00')
            ->where('employees.0.hourlyRate', '125.50')
            ->where('employees.0.dailyRate', '1004.00')
            ->where('employees.0.schedule.groups.0.days', [1, 2, 3, 4, 5])
            ->where('employees.0.schedule.groups.1.days', [6])
            ->where('employees.1.monthlyRate', '20800.00')
            ->where('employees.1.hourlyRate', '100.00')
            ->where('employees.1.dailyRate', '800.00')
            ->where('employees.1.schedule.groups.0.endTime', '17:00:00'),
        );
});

test('authenticated users can add employees with grouped schedule blocks', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('employees.store'), [
        'first_name' => 'Carla',
        'middle_name' => '',
        'last_name' => 'Reyes',
        'monthly_rate' => '23400.00',
        'schedule_groups' => [
            ['days' => [1, 2, 3, 4, 5], 'start_time' => '09:00', 'end_time' => '18:00'],
            ['days' => [6], 'start_time' => '09:00', 'end_time' => '17:00'],
        ],
    ]);

    $response->assertRedirect(route('employees.index'));

    $employee = Employee::query()->firstOrFail();

    expect($employee->monthly_rate)->toBe('23400.00')
        ->and($employee->hourly_rate)->toBe('112.50')
        ->and($employee->daily_rate)->toBe('900.00')
        ->and($employee->scheduled_start_time)->toBe('09:00:00')
        ->and($employee->scheduled_end_time)->toBe('18:00:00')
        ->and($employee->grace_period_minutes)->toBe(5)
        ->and($employee->work_days)->toBe([1, 2, 3, 4, 5, 6])
        ->and($employee->weekly_schedule)->toBe([
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 4, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 5, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 6, 'start_time' => '09:00:00', 'end_time' => '17:00:00', 'grace_period_minutes' => 5],
        ]);

    $this->actingAs($user)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
            ->where('successMessage', 'Employee added successfully.')
            ->where('summary.totalEmployees', 1)
            ->where('summary.averageWorkDays', 6)
            ->where('summary.averageGraceMinutes', 5)
            ->has('employees', 1)
            ->where('employees.0.firstName', 'Carla')
            ->where('employees.0.fullName', 'Carla Reyes')
            ->where('employees.0.monthlyRate', '23400.00')
            ->where('employees.0.hourlyRate', '112.50')
            ->where('employees.0.dailyRate', '900.00')
            ->where('employees.0.schedule.groups.0.days', [1, 2, 3, 4, 5])
            ->where('employees.0.schedule.groups.1.days', [6])
            ->where('employees.0.schedule.groups.1.endTime', '17:00:00'),
        );
});

test('authenticated users can update employees', function () {
    $user = User::factory()->create();

    $employee = Employee::factory()->create([
        'first_name' => 'Dino',
        'middle_name' => '',
        'last_name' => 'Santos',
        'monthly_rate' => '19760.00',
        'hourly_rate' => '95.00',
        'daily_rate' => '760.00',
        'scheduled_start_time' => '09:00:00',
        'scheduled_end_time' => '18:00:00',
        'grace_period_minutes' => 5,
        'work_days' => [1, 2, 3, 4, 5],
        'weekly_schedule' => [
            ['day' => 1, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 4, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
            ['day' => 5, 'start_time' => '09:00:00', 'end_time' => '18:00:00', 'grace_period_minutes' => 5],
        ],
    ]);

    $response = $this->actingAs($user)->put(route('employees.update', $employee), [
        'first_name' => 'Dina',
        'middle_name' => 'Lopez',
        'last_name' => 'Reyes',
        'monthly_rate' => '27092.00',
        'schedule_groups' => [
            ['days' => [1, 2, 3, 4, 5], 'start_time' => '10:00', 'end_time' => '19:00'],
            ['days' => [6], 'start_time' => '09:00', 'end_time' => '15:00'],
        ],
    ]);

    $response->assertRedirect(route('employees.index'));

    $employee->refresh();

    expect($employee->first_name)->toBe('Dina')
        ->and($employee->middle_name)->toBe('Lopez')
        ->and($employee->last_name)->toBe('Reyes')
        ->and($employee->monthly_rate)->toBe('27092.00')
        ->and($employee->hourly_rate)->toBe('130.25')
        ->and($employee->daily_rate)->toBe('1042.00')
        ->and($employee->scheduled_start_time)->toBe('10:00:00')
        ->and($employee->scheduled_end_time)->toBe('19:00:00')
        ->and($employee->work_days)->toBe([1, 2, 3, 4, 5, 6])
        ->and($employee->weekly_schedule)->toBe([
            ['day' => 1, 'start_time' => '10:00:00', 'end_time' => '19:00:00', 'grace_period_minutes' => 5],
            ['day' => 2, 'start_time' => '10:00:00', 'end_time' => '19:00:00', 'grace_period_minutes' => 5],
            ['day' => 3, 'start_time' => '10:00:00', 'end_time' => '19:00:00', 'grace_period_minutes' => 5],
            ['day' => 4, 'start_time' => '10:00:00', 'end_time' => '19:00:00', 'grace_period_minutes' => 5],
            ['day' => 5, 'start_time' => '10:00:00', 'end_time' => '19:00:00', 'grace_period_minutes' => 5],
            ['day' => 6, 'start_time' => '09:00:00', 'end_time' => '15:00:00', 'grace_period_minutes' => 5],
        ]);

    $this->actingAs($user)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
            ->where('successMessage', 'Employee updated successfully.')
            ->where('summary.totalEmployees', 1)
            ->where('summary.averageWorkDays', 6)
            ->where('employees.0.firstName', 'Dina')
            ->where('employees.0.middleName', 'Lopez')
            ->where('employees.0.lastName', 'Reyes')
            ->where('employees.0.fullName', 'Dina Lopez Reyes')
            ->where('employees.0.monthlyRate', '27092.00')
            ->where('employees.0.hourlyRate', '130.25')
            ->where('employees.0.dailyRate', '1042.00')
            ->where('employees.0.schedule.groups.1.endTime', '15:00:00'),
        );
});

test('authenticated users can delete employees', function () {
    $user = User::factory()->create();

    $employee = Employee::factory()->create();

    $response = $this->actingAs($user)->delete(route('employees.destroy', $employee));

    $response->assertRedirect(route('employees.index'));

    $this->assertSoftDeleted('employees', [
        'id' => $employee->id,
    ]);

    $this->actingAs($user)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
            ->where('successMessage', 'Employee deleted successfully.')
            ->where('summary.totalEmployees', 0)
            ->has('employees', 0),
        );
});
