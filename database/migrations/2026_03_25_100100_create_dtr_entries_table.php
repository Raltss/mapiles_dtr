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
        Schema::create('dtr_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dtr_id')->constrained()->cascadeOnDelete();
            $table->date('work_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->string('holiday_type')->default('none');
            $table->unsignedInteger('worked_minutes')->default(0);
            $table->decimal('base_rate', 12, 2)->nullable();
            $table->decimal('rate', 12, 2)->nullable();
            $table->timestamps();

            $table->unique(['dtr_id', 'work_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dtr_entries');
    }
};