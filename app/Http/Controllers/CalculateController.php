<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Inertia\Inertia;
use Inertia\Response;

class CalculateController extends Controller
{
    public function index(): Response
    {
        $employees = Employee::query()
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function (Employee $employee): array {
                $workDays = collect(is_array($employee->weekly_schedule) ? $employee->weekly_schedule : [])
                    ->filter(fn (mixed $scheduleDay): bool => is_array($scheduleDay) && array_key_exists('day', $scheduleDay))
                    ->pluck('day')
                    ->map(fn (mixed $day): int => (int) $day);

                if ($workDays->isEmpty()) {
                    $workDays = collect($employee->work_days ?? [])
                        ->map(fn (mixed $day): int => (int) $day);
                }

                return [
                    'id' => $employee->id,
                    'fullName' => collect([
                        $employee->first_name,
                        $employee->middle_name,
                        $employee->last_name,
                    ])->filter()->implode(' '),
                    'workDays' => $workDays
                        ->unique()
                        ->sort()
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('calculate/index', [
            'employees' => $employees,
        ]);
    }
}
