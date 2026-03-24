<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreEmployeeRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'daily_rate' => ['required', 'numeric', 'min:0'],
            'employment_end_date' => ['nullable', 'date'],
            'schedule_groups' => ['required', 'array', 'min:1'],
            'schedule_groups.*.days' => ['required', 'array', 'min:1'],
            'schedule_groups.*.days.*' => ['required', 'integer', 'between:0,6', 'distinct'],
            'schedule_groups.*.start_time' => ['required', 'date_format:H:i'],
            'schedule_groups.*.end_time' => ['required', 'date_format:H:i'],
        ];
    }

    /**
     * Get the validation "after" callbacks that should be applied to the request.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $assignedDays = [];
                $totalDays = 0;

                foreach ($this->input('schedule_groups', []) as $index => $scheduleGroup) {
                    $startTime = $scheduleGroup['start_time'] ?? null;
                    $endTime = $scheduleGroup['end_time'] ?? null;

                    if (
                        is_string($startTime)
                        && is_string($endTime)
                        && $startTime !== ''
                        && $endTime !== ''
                        && strcmp($endTime, $startTime) <= 0
                    ) {
                        $validator->errors()->add(
                            "schedule_groups.{$index}.end_time",
                            'End time must be after start time.',
                        );
                    }

                    $days = $scheduleGroup['days'] ?? [];

                    if (! is_array($days)) {
                        continue;
                    }

                    foreach ($days as $day) {
                        if (! is_numeric($day)) {
                            continue;
                        }

                        $day = (int) $day;
                        $totalDays++;

                        if (array_key_exists($day, $assignedDays)) {
                            $validator->errors()->add(
                                "schedule_groups.{$index}.days",
                                'Each day can only belong to one schedule block.',
                            );

                            continue;
                        }

                        $assignedDays[$day] = $index;
                    }
                }

                if ($totalDays === 0) {
                    $validator->errors()->add('schedule_groups', 'At least one working day is required.');
                }
            },
        ];
    }
}
