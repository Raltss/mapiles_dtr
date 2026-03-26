<?php

use App\Models\User;

test('guests are redirected to the login page when visiting employees', function () {
    $response = $this->get(route('employees.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit employees as the landing page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('employees.index'));
    $response->assertOk();
});
