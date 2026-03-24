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
        $columns = collect(['email', 'phone', 'department', 'employment_status'])
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
        // Intentionally left empty so removed employee contact/status columns stay removed.
    }
};
