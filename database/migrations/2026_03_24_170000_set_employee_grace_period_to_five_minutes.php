<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('employees')->update([
            'grace_period_minutes' => 5,
        ]);

        $employees = DB::table('employees')
            ->select(['id', 'weekly_schedule'])
            ->get();

        foreach ($employees as $employee) {
            $weeklySchedule = json_decode($employee->weekly_schedule ?? '[]', true);

            if (! is_array($weeklySchedule)) {
                continue;
            }

            $weeklySchedule = array_map(fn (array $scheduleDay): array => [
                'day' => (int) ($scheduleDay['day'] ?? 0),
                'start_time' => $scheduleDay['start_time'] ?? null,
                'end_time' => $scheduleDay['end_time'] ?? null,
                'grace_period_minutes' => 5,
            ], $weeklySchedule);

            DB::table('employees')
                ->where('id', $employee->id)
                ->update([
                    'weekly_schedule' => json_encode($weeklySchedule),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left empty because the grace period is now fixed at five minutes.
    }
};
