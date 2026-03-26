<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dtrs', function (Blueprint $table) {
            $table->unsignedInteger('total_overtime_minutes')->default(0)->after('total_worked_minutes');
            $table->decimal('total_overtime_amount', 12, 2)->default(0)->after('total_overtime_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dtrs', function (Blueprint $table) {
            $table->dropColumn(['total_overtime_minutes', 'total_overtime_amount']);
        });
    }
};
