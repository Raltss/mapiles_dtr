<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->json('weekly_schedule')->nullable();
        });

        $employees = DB::table('employees')
            ->select([
                'id',
                'work_days',
                'scheduled_start_time',
                'scheduled_end_time',
                'grace_period_minutes',
            ])
            ->get();

        foreach ($employees as $employee) {
            $workDays = json_decode($employee->work_days ?? '[]', true);

            if (! is_array($workDays)) {
                $workDays = [];
            }

            $workDays = array_values(array_unique(array_map('intval', $workDays)));
            sort($workDays);

            $weeklySchedule = array_map(function (int $day) use ($employee): array {
                return [
                    'day' => $day,
                    'start_time' => $employee->scheduled_start_time,
                    'end_time' => $employee->scheduled_end_time,
                    'grace_period_minutes' => (int) ($employee->grace_period_minutes ?? 0),
                ];
            }, $workDays);

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
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('weekly_schedule');
        });
    }
};
