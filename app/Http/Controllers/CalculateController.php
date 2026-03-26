<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDtrRequest;
use App\Models\Dtr;
use App\Models\DtrEntry;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CalculateController extends Controller
{
    private const WORK_DAYS_PER_MONTH = 26;

    private const BREAK_MINUTES_PER_SHIFT = 60;

    private const HALF_DAY_THRESHOLD_MINUTES = 180;

    private const OVERTIME_PREMIUM_RATE = 0.25;

    public function index(Request $request): Response
    {
        $selectedEmployeeId = $request->integer('employee') ?: null;
        $selectedMonth = $request->integer('month') ?: (int) now()->month;
        $selectedYear = $request->integer('year') ?: (int) now()->year;
        $isEditingFromSummary = $request->query('source') === 'summary';

        $employees = Employee::query()
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function (Employee $employee): array {
                $schedule = $this->storedSchedule($employee);

                return [
                    'id' => $employee->id,
                    'fullName' => collect([
                        $employee->first_name,
                        $employee->middle_name,
                        $employee->last_name,
                    ])->filter()->implode(' '),
                    'dailyRate' => $this->resolvedDailyRate($employee),
                    'workDays' => collect($schedule)
                        ->pluck('day')
                        ->unique()
                        ->sort()
                        ->values()
                        ->all(),
                    'schedule' => $schedule,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('calculate/index', [
            'successMessage' => session('success'),
            'initialSelection' => [
                'employeeId' => $selectedEmployeeId,
                'month' => $selectedMonth,
                'year' => $selectedYear,
            ],
            'isEditingFromSummary' => $isEditingFromSummary,
            'activeDtr' => $selectedEmployeeId !== null
                ? $this->activeDtr($selectedEmployeeId, $selectedMonth, $selectedYear)
                : null,
            'employees' => $employees,
        ]);
    }

    public function store(StoreDtrRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $employee = Employee::query()->findOrFail($validated['employee_id']);
        $month = (int) $validated['month'];
        $year = (int) $validated['year'];

        DB::transaction(function () use ($employee, $month, $request, $validated, $year): void {
            Employee::query()->whereKey($employee->id)->lockForUpdate()->firstOrFail();

            $scheduleByDay = collect($this->storedSchedule($employee))->keyBy('day');

            $preparedEntries = collect($validated['entries'])
                ->sortBy('date')
                ->values()
                ->map(function (array $entry) use ($employee, $scheduleByDay): array {
                    $isAbsent = filter_var(
                        $entry['is_absent'] ?? false,
                        FILTER_VALIDATE_BOOLEAN,
                    );
                    $workDate = Carbon::parse($entry['date']);
                    $scheduleDay = $scheduleByDay->get((int) $workDate->dayOfWeek);
                    $baseRate = $isAbsent
                        ? $this->formatRate(0)
                        : $this->resolvedEntryBaseRate($employee, $entry['base_rate'] ?? null);
                    $holidayType = $isAbsent ? 'none' : (string) $entry['holiday_type'];
                    $workedMinutes = $isAbsent
                        ? 0
                        : $this->resolveWorkedMinutes(
                            $entry['time_in'] ?? null,
                            $entry['time_out'] ?? null,
                        );
                    $scheduledWorkedMinutes = $isAbsent
                        ? 0
                        : $this->resolveWorkedMinutes(
                            $scheduleDay['startTime'] ?? null,
                            $scheduleDay['endTime'] ?? null,
                        );

                    return [
                        'work_date' => $entry['date'],
                        'time_in' => $isAbsent
                            ? null
                            : $this->normalizeEntryTime($entry['time_in'] ?? null),
                        'time_out' => $isAbsent
                            ? null
                            : $this->normalizeEntryTime($entry['time_out'] ?? null),
                        'holiday_type' => $holidayType,
                        'worked_minutes' => $workedMinutes,
                        'base_rate' => $isAbsent
                            ? $this->formatRate(0)
                            : $baseRate,
                        'rate' => $isAbsent
                            ? $this->formatRate(0)
                            : $this->computedEntryRate(
                                $baseRate,
                                $holidayType,
                                $entry['time_in'] ?? null,
                                $scheduleDay['startTime'] ?? null,
                                (int) ($scheduleDay['graceMinutes'] ?? 0),
                            ),
                        'overtime_minutes' => $isAbsent
                            ? 0
                            : max(0, $workedMinutes - $scheduledWorkedMinutes),
                    ];
                });

            $regularAmount = (float) $preparedEntries->sum(
                fn (array $entry): float => (float) ($entry['rate'] ?? 0),
            );
            $totalOvertimeMinutes = (int) $preparedEntries->sum('overtime_minutes');
            $totalOvertimeAmount = $this->computedOvertimeAmount(
                $employee,
                $totalOvertimeMinutes,
            );
            $attributes = [
                'confirmed_by' => $request->user()?->id,
                'total_days' => $preparedEntries->count(),
                'total_worked_minutes' => $preparedEntries->sum('worked_minutes'),
                'total_overtime_minutes' => $totalOvertimeMinutes,
                'total_overtime_amount' => $this->formatRate($totalOvertimeAmount),
                'total_amount' => $this->formatRate(
                    $regularAmount + $totalOvertimeAmount,
                ),
            ];

            $dtr = $this->dtrQueryForPeriod($employee->id, $month, $year)
                ->lockForUpdate()
                ->first();

            if ($dtr) {
                $dtr->fill($attributes);
                $dtr->save();
            } else {
                $dtr = Dtr::query()->create([
                    'employee_id' => $employee->id,
                    ...$attributes,
                ]);
            }

            $dtr->entries()->delete();
            $dtr->entries()->createMany(
                $preparedEntries
                    ->map(function (array $entry): array {
                        unset($entry['overtime_minutes']);

                        return $entry;
                    })
                    ->all(),
            );
        });

        $redirectQuery = [
            'employee' => $employee->id,
            'month' => $month,
            'year' => $year,
        ];

        if ($request->input('source') === 'summary') {
            $redirectQuery['source'] = 'summary';
        }

        return to_route('calculate.index', $redirectQuery)
            ->with('success', 'DTR confirmed and saved successfully.');
    }

    protected function activeDtr(int $employeeId, int $month, int $year): ?array
    {
        $dtr = $this->dtrQueryForPeriod($employeeId, $month, $year)
            ->with(['entries' => fn ($query) => $query->orderBy('work_date')])
            ->first();

        if (! $dtr) {
            return null;
        }

        $period = $this->resolvedPeriod($dtr);

        return [
            'employeeId' => $dtr->employee_id,
            'month' => $period['month'],
            'year' => $period['year'],
            'entries' => $dtr->entries
                ->map(fn ($entry) => [
                    'date' => $entry->work_date->toDateString(),
                    'timeIn' => $entry->time_in !== null ? substr($entry->time_in, 0, 5) : '',
                    'timeOut' => $entry->time_out !== null ? substr($entry->time_out, 0, 5) : '',
                    'holidayType' => (string) $entry->holiday_type,
                    'baseRate' => $entry->base_rate !== null ? (string) $entry->base_rate : '',
                    'rate' => $entry->rate !== null ? (string) $entry->rate : '',
                    'isAbsent' => $this->isAbsentEntry($entry),
                ])
                ->values()
                ->all(),
        ];
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

    /**
     * @return array<int, array{day: int, startTime: string, endTime: string, graceMinutes: int}>
     */
    protected function storedSchedule(Employee $employee): array
    {
        $storedSchedule = is_array($employee->weekly_schedule) ? $employee->weekly_schedule : [];
        $defaultGraceMinutes = max(0, (int) ($employee->grace_period_minutes ?? 0));

        if ($storedSchedule !== []) {
            return collect($storedSchedule)
                ->filter(fn (mixed $scheduleDay): bool => is_array($scheduleDay) && array_key_exists('day', $scheduleDay))
                ->map(fn (array $scheduleDay): array => [
                    'day' => (int) $scheduleDay['day'],
                    'startTime' => $this->formatScheduleTime($scheduleDay['start_time'] ?? $employee->scheduled_start_time),
                    'endTime' => $this->formatScheduleTime($scheduleDay['end_time'] ?? $employee->scheduled_end_time),
                    'graceMinutes' => max(0, (int) ($scheduleDay['grace_period_minutes'] ?? $defaultGraceMinutes)),
                ])
                ->sortBy('day')
                ->values()
                ->all();
        }

        return collect($employee->work_days ?? [])
            ->map(fn (mixed $day): array => [
                'day' => (int) $day,
                'startTime' => $this->formatScheduleTime($employee->scheduled_start_time),
                'endTime' => $this->formatScheduleTime($employee->scheduled_end_time),
                'graceMinutes' => $defaultGraceMinutes,
            ])
            ->sortBy('day')
            ->values()
            ->all();
    }

    protected function formatScheduleTime(mixed $time): string
    {
        $value = is_string($time) ? $time : '';

        if ($value === '') {
            return '';
        }

        return strlen($value) >= 5 ? substr($value, 0, 5) : $value;
    }

    protected function normalizeEntryTime(mixed $time): ?string
    {
        if (! is_string($time) || $time === '') {
            return null;
        }

        return strlen($time) === 5 ? $time.':00' : $time;
    }

    protected function resolveWorkedMinutes(mixed $timeIn, mixed $timeOut): int
    {
        $timeInMinutes = $this->minutesFromTime($timeIn);
        $timeOutMinutes = $this->minutesFromTime($timeOut);

        if ($timeInMinutes === null || $timeOutMinutes === null) {
            return 0;
        }

        $totalWorkedMinutes = $timeOutMinutes >= $timeInMinutes
            ? $timeOutMinutes - $timeInMinutes
            : 24 * 60 - $timeInMinutes + $timeOutMinutes;

        return max(0, $totalWorkedMinutes - self::BREAK_MINUTES_PER_SHIFT);
    }

    protected function minutesFromTime(mixed $time): ?int
    {
        if (! is_string($time) || ! preg_match('/^\d{2}:\d{2}$/', $time)) {
            return null;
        }

        [$hours, $minutes] = array_map('intval', explode(':', $time));

        return $hours * 60 + $minutes;
    }

    protected function resolvedEntryBaseRate(Employee $employee, mixed $value): ?string
    {
        if (is_numeric($value)) {
            return $this->formatRate((float) $value);
        }

        $dailyRate = $this->resolvedDailyRate($employee);

        if ($dailyRate === '') {
            return null;
        }

        return $this->formatRate((float) $dailyRate);
    }

    protected function computedEntryRate(
        ?string $baseRate,
        string $holidayType,
        mixed $timeIn,
        mixed $scheduledTimeIn,
        int $graceMinutes,
    ): ?string {
        $adjustedRate = $this->adjustedEntryRate($baseRate, $holidayType);

        if ($adjustedRate === null) {
            return null;
        }

        $actualTimeInMinutes = $this->minutesFromTime($timeIn);
        $scheduledTimeInMinutes = $this->minutesFromTime($scheduledTimeIn);

        if ($actualTimeInMinutes === null || $scheduledTimeInMinutes === null) {
            return $this->formatRate($adjustedRate);
        }

        if ($actualTimeInMinutes >= $scheduledTimeInMinutes + self::HALF_DAY_THRESHOLD_MINUTES) {
            return $this->formatRate($adjustedRate / 2);
        }

        $lateMinutes = max(0, $actualTimeInMinutes - $scheduledTimeInMinutes - max(0, $graceMinutes));

        return $this->formatRate(max(0, $adjustedRate - $lateMinutes));
    }

    protected function computedOvertimeAmount(Employee $employee, int $totalOvertimeMinutes): float
    {
        if ($totalOvertimeMinutes <= 0) {
            return 0;
        }

        $dailyRate = $this->resolvedDailyRate($employee);

        if ($dailyRate === '') {
            return 0;
        }

        $baseOvertimeAmount = ($totalOvertimeMinutes / 60) * (float) $dailyRate;

        return $baseOvertimeAmount * (1 + self::OVERTIME_PREMIUM_RATE);
    }

    protected function adjustedEntryRate(?string $baseRate, string $holidayType): ?float
    {
        if ($baseRate === null || $baseRate === '') {
            return null;
        }

        return (float) $baseRate * $this->holidayMultiplier($holidayType);
    }

    protected function holidayMultiplier(string $holidayType): float
    {
        return match ($holidayType) {
            'regularHoliday' => 2.0,
            'specialWorkingHoliday' => 1.3,
            default => 1.0,
        };
    }

    protected function nullableRate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return $this->formatRate((float) $value);
    }

    protected function formatRate(float $value): string
    {
        return number_format(round($value, 2), 2, '.', '');
    }

    protected function dtrQueryForPeriod(int $employeeId, int $month, int $year): Builder
    {
        [$startDate, $endDate] = $this->periodBounds($month, $year);

        return Dtr::query()
            ->where('employee_id', $employeeId)
            ->whereHas('entries', function (Builder $query) use ($endDate, $startDate): void {
                $query->whereBetween('work_date', [
                    $startDate->toDateString(),
                    $endDate->toDateString(),
                ]);
            });
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function periodBounds(int $month, int $year): array
    {
        $startDate = Carbon::create($year, $month, 1)->startOfDay();

        return [$startDate, $startDate->copy()->endOfMonth()];
    }

    /**
     * @return array{month: int, year: int}
     */
    protected function resolvedPeriod(Dtr $dtr): array
    {
        $periodSource = $dtr->entries->first()?->work_date ?? $dtr->updated_at ?? $dtr->created_at ?? now();
        $periodDate = $periodSource instanceof Carbon
            ? $periodSource->copy()
            : Carbon::parse($periodSource);

        return [
            'month' => (int) $periodDate->month,
            'year' => (int) $periodDate->year,
        ];
    }

    protected function isAbsentEntry(DtrEntry $entry): bool
    {
        return $entry->time_in === null
            && $entry->time_out === null
            && (int) $entry->worked_minutes === 0
            && (float) ($entry->rate ?? 0) === 0.0;
    }
}
