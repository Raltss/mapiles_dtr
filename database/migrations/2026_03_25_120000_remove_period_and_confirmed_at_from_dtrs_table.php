<?php

use Carbon\Carbon;
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
        Schema::table('dtrs', function (Blueprint $table) {
            $table->dropUnique('dtrs_employee_id_month_year_unique');
            $table->dropColumn(['month', 'year', 'confirmed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dtrs', function (Blueprint $table) {
            $table->unsignedTinyInteger('month')->nullable()->after('confirmed_by');
            $table->unsignedSmallInteger('year')->nullable()->after('month');
            $table->timestamp('confirmed_at')->nullable()->after('total_amount');
        });

        $dtrs = DB::table('dtrs')
            ->select(['id', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->get();

        foreach ($dtrs as $dtr) {
            $firstWorkDate = DB::table('dtr_entries')
                ->where('dtr_id', $dtr->id)
                ->orderBy('work_date')
                ->value('work_date');

            $periodDate = Carbon::parse($firstWorkDate ?? $dtr->created_at ?? $dtr->updated_at ?? now());

            DB::table('dtrs')
                ->where('id', $dtr->id)
                ->update([
                    'month' => $periodDate->month,
                    'year' => $periodDate->year,
                    'confirmed_at' => $dtr->updated_at ?? $dtr->created_at ?? now(),
                ]);
        }

        Schema::table('dtrs', function (Blueprint $table) {
            $table->unique(['employee_id', 'month', 'year'], 'dtrs_employee_id_month_year_unique');
        });
    }
};
