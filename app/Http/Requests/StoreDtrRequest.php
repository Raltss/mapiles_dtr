<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreDtrRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>|string>
     */
    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2000,2100'],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.date' => ['required', 'date'],
            'entries.*.time_in' => ['nullable', 'date_format:H:i'],
            'entries.*.time_out' => ['nullable', 'date_format:H:i'],
            'entries.*.holiday_type' => ['required', 'in:none,regularHoliday,specialWorkingHoliday'],
            'entries.*.base_rate' => ['nullable', 'numeric', 'min:0'],
            'entries.*.rate' => ['nullable', 'numeric', 'min:0'],
            'entries.*.is_absent' => ['sometimes', 'boolean'],
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
                $month = (int) $this->input('month');
                $year = (int) $this->input('year');
                $seenDates = [];

                foreach ($this->input('entries', []) as $index => $entry) {
                    $date = $entry['date'] ?? null;
                    $timeIn = $entry['time_in'] ?? null;
                    $timeOut = $entry['time_out'] ?? null;
                    $isAbsent = filter_var(
                        $entry['is_absent'] ?? false,
                        FILTER_VALIDATE_BOOLEAN,
                    );

                    if ($isAbsent && (filled($timeIn) || filled($timeOut))) {
                        $validator->errors()->add(
                            "entries.{$index}.time_out",
                            'Absent days must not include time in or time out.',
                        );
                    }

                    if (! $isAbsent && (is_string($timeIn) xor is_string($timeOut))) {
                        $validator->errors()->add(
                            "entries.{$index}.time_out",
                            'Time in and time out must be filled together.',
                        );
                    }

                    if (! is_string($date)) {
                        continue;
                    }

                    if (in_array($date, $seenDates, true)) {
                        $validator->errors()->add(
                            "entries.{$index}.date",
                            'Each work date can only appear once.',
                        );

                        continue;
                    }

                    $seenDates[] = $date;

                    try {
                        $workDate = Carbon::parse($date);
                    } catch (\Throwable) {
                        continue;
                    }

                    if ((int) $workDate->month !== $month || (int) $workDate->year !== $year) {
                        $validator->errors()->add(
                            "entries.{$index}.date",
                            'Each work date must belong to the selected month and year.',
                        );
                    }
                }
            },
        ];
    }
}
