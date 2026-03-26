<?php

use App\Http\Controllers\CalculateController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\SummaryController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::put('employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::get('calculate', [CalculateController::class, 'index'])->name('calculate.index');
    Route::post('calculate', [CalculateController::class, 'store'])->name('calculate.store');
    Route::get('summary', [SummaryController::class, 'index'])->name('summary.index');
    Route::get('ranking', [RankingController::class, 'index'])->name('ranking.index');
    Route::delete('summary/{dtr}', [SummaryController::class, 'destroy'])->name('summary.destroy');
});

require __DIR__.'/settings.php';

