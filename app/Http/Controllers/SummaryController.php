<?php

namespace App\Http\Controllers;

use App\Models\Dtr;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SummaryController extends Controller
{
    public function index(): Response
    {
        $dtrRecords = Dtr::query()
            ->with([
                'employee',
                'entries' => fn ($query) => $query->orderBy('work_date'),
            ])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('summary/index', [
            'successMessage' => session('success'),
            'dtrs' => $dtrRecords->map(function (Dtr $dtr): array {
                $periodDate = $this->resolvedPeriodDate($dtr);

                return [
                    'id' => $dtr->id,
                    'employeeId' => $dtr->employee_id,
                    'employeeName' => $dtr->employee?->first_name !== null
                        ? collect([
                            $dtr->employee?->first_name,
                            $dtr->employee?->middle_name,
                            $dtr->employee?->last_name,
                        ])->filter()->implode(' ')
                        : 'Unknown employee',
                    'month' => (int) $periodDate->month,
                    'monthLabel' => $periodDate->format('F'),
                    'year' => (int) $periodDate->year,
                    'totalDays' => $dtr->total_days,
                    'totalWorkedMinutes' => $dtr->total_worked_minutes,
                    'regularAmount' => $this->resolvedRegularAmount($dtr),
                    'dailyRateBasis' => $this->resolvedDailyRateBasis($dtr),
                    'totalOvertimeMinutes' => (int) $dtr->total_overtime_minutes,
                    'totalOvertimeAmount' => $dtr->total_overtime_amount !== null ? (string) $dtr->total_overtime_amount : '0.00',
                    'totalAmount' => $dtr->total_amount !== null ? (string) $dtr->total_amount : '0.00',
                    'confirmedAt' => ($dtr->updated_at ?? $dtr->created_at)?->toIso8601String(),
                    'entries' => $dtr->entries->map(function ($entry): array {
                        $workDate = Carbon::parse($entry->work_date);

                        return [
                            'date' => $workDate->toDateString(),
                            'label' => $workDate->format('M j'),
                            'weekday' => $workDate->format('l'),
                            'timeIn' => $entry->time_in !== null ? substr($entry->time_in, 0, 5) : '',
                            'timeOut' => $entry->time_out !== null ? substr($entry->time_out, 0, 5) : '',
                            'holidayType' => (string) $entry->holiday_type,
                            'workedMinutes' => (int) $entry->worked_minutes,
                            'baseRate' => $entry->base_rate !== null ? (string) $entry->base_rate : '',
                            'rate' => $entry->rate !== null ? (string) $entry->rate : '',
                        ];
                    })->values()->all(),
                ];
            })->values()->all(),
        ]);
    }

    public function destroy(Dtr $dtr): RedirectResponse
    {
        $dtr->delete();

        return to_route('summary.index')->with('success', 'DTR deleted successfully.');
    }

    protected function resolvedPeriodDate(Dtr $dtr): Carbon
    {
        $periodSource = $dtr->entries->first()?->work_date ?? $dtr->updated_at ?? $dtr->created_at ?? now();

        return $periodSource instanceof Carbon
            ? $periodSource->copy()
            : Carbon::parse($periodSource);
    }

    protected function resolvedRegularAmount(Dtr $dtr): string
    {
        return $this->formatRate(
            $dtr->entries->sum(
                fn ($entry): float => (float) ($entry->rate ?? 0),
            ),
        );
    }

    protected function resolvedDailyRateBasis(Dtr $dtr): string
    {
        $baseRateEntry = $dtr->entries->first(
            fn ($entry): bool => (float) ($entry->base_rate ?? 0) > 0,
        );

        if ($baseRateEntry?->base_rate !== null) {
            return (string) $baseRateEntry->base_rate;
        }

        return $dtr->employee?->daily_rate !== null
            ? (string) $dtr->employee->daily_rate
            : '0.00';
    }

    protected function formatRate(float $value): string
    {
        return number_format(round($value, 2), 2, '.', '');
    }
}
