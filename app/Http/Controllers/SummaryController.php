<?php

namespace App\Http\Controllers;

use App\Models\Dtr;
use Carbon\Carbon;
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

    protected function resolvedPeriodDate(Dtr $dtr): Carbon
    {
        $periodSource = $dtr->entries->first()?->work_date ?? $dtr->updated_at ?? $dtr->created_at ?? now();

        return $periodSource instanceof Carbon
            ? $periodSource->copy()
            : Carbon::parse($periodSource);
    }
}
