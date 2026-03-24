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
            $table->decimal('monthly_rate', 10, 2)->nullable()->after('last_name');
        });

        $employees = DB::table('employees')
            ->select(['id', 'daily_rate', 'hourly_rate'])
            ->get();

        foreach ($employees as $employee) {
            $monthlyRate = null;

            if ($employee->daily_rate !== null) {
                $monthlyRate = round((float) $employee->daily_rate * 26, 2);
            } elseif ($employee->hourly_rate !== null) {
                $monthlyRate = round((float) $employee->hourly_rate * 8 * 26, 2);
            }

            if ($monthlyRate === null) {
                continue;
            }

            DB::table('employees')
                ->where('id', $employee->id)
                ->update([
                    'monthly_rate' => number_format($monthlyRate, 2, '.', ''),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('monthly_rate');
        });
    }
};
