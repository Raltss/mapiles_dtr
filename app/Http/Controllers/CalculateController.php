<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Inertia\Inertia;
use Inertia\Response;

class CalculateController extends Controller
{
    public function index(): Response
    {
        $employees = Employee::query()
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (Employee $employee): array => [
                'id' => $employee->id,
                'fullName' => collect([
                    $employee->first_name,
                    $employee->middle_name,
                    $employee->last_name,
                ])->filter()->implode(' '),
            ])
            ->values()
            ->all();

        return Inertia::render('calculate/index', [
            'employees' => $employees,
        ]);
    }
}
