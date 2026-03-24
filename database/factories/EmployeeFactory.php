<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $weeklySchedule = [
            [
                'day' => 1,
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period_minutes' => 5,
            ],
            [
                'day' => 2,
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period_minutes' => 5,
            ],
            [
                'day' => 3,
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period_minutes' => 5,
            ],
            [
                'day' => 4,
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period_minutes' => 5,
            ],
            [
                'day' => 5,
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'grace_period_minutes' => 5,
            ],
        ];

        return [
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->optional()->firstName(),
            'last_name' => fake()->lastName(),
            'monthly_rate' => '20800.00',
            'hourly_rate' => '100.00',
            'daily_rate' => '800.00',
            'employment_end_date' => null,
            'scheduled_start_time' => '08:00:00',
            'scheduled_end_time' => '17:00:00',
            'grace_period_minutes' => 5,
            'work_days' => [1, 2, 3, 4, 5],
            'weekly_schedule' => $weeklySchedule,
        ];
    }
}
