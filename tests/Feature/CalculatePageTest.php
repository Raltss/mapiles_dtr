<?php

use App\Models\Employee;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('calculate page requires authentication', function () {
    $this->get(route('calculate.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view employees in the calculate dropdown', function () {
    $user = User::factory()->create();

    Employee::factory()->create([
        'first_name' => 'Ana',
        'middle_name' => 'Marie',
        'last_name' => 'Lopez',
    ]);

    Employee::factory()->create([
        'first_name' => 'Ben',
        'middle_name' => null,
        'last_name' => 'Reyes',
    ]);

    $this->actingAs($user)
        ->get(route('calculate.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('calculate/index')
            ->has('employees', 2)
            ->where('employees.0.fullName', 'Ana Marie Lopez')
            ->where('employees.1.fullName', 'Ben Reyes'),
        );
});
