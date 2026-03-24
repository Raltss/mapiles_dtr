<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Inertia\Inertia;
use Inertia\Response;

class CalculateController extends Controller
{
    private const WORK_DAYS_PER_MONTH = 26;

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
                    'dailyRate' => $this->resolvedDailyRate($employee),
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

    protected function resolvedDailyRate(Employee $employee): string
    {
        if ($employee->daily_rate !== null) {
            return (string) $employee->daily_rate;
        }

        if ($employee->monthly_rate !== null) {
            return number_format(
                round((float) $employee->monthly_rate / self::WORK_DAYS_PER_MONTH, 2),
                2,
                '.',
                '',
            );
        }

        return '';
    }
}
