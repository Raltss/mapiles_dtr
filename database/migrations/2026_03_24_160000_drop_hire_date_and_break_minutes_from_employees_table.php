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
        $employees = DB::table('employees')
            ->select(['id', 'weekly_schedule'])
            ->get();

        foreach ($employees as $employee) {
            $weeklySchedule = json_decode($employee->weekly_schedule ?? '[]', true);

            if (! is_array($weeklySchedule)) {
                $weeklySchedule = [];
            }

            $weeklySchedule = array_map(function (array $scheduleDay): array {
                return [
                    'day' => (int) ($scheduleDay['day'] ?? 0),
                    'start_time' => $scheduleDay['start_time'] ?? null,
                    'end_time' => $scheduleDay['end_time'] ?? null,
                    'grace_period_minutes' => (int) ($scheduleDay['grace_period_minutes'] ?? 0),
                ];
            }, $weeklySchedule);

            DB::table('employees')
                ->where('id', $employee->id)
                ->update([
                    'weekly_schedule' => json_encode($weeklySchedule),
                ]);
        }

        $columns = collect(['hire_date', 'break_minutes'])
            ->filter(fn (string $column) => Schema::hasColumn('employees', $column))
            ->values()
            ->all();

        if ($columns === []) {
            return;
        }

        Schema::table('employees', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left empty so removed employee columns stay removed.
    }
};
