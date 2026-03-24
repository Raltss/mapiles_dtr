import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index as calculateIndex } from '@/routes/calculate';
import type { BreadcrumbItem } from '@/types';

type EmployeeOption = {
    id: number;
    fullName: string;
};

type CalculatePageProps = {
    employees: EmployeeOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calculate',
        href: calculateIndex(),
    },
];

export default function Calculate({ employees }: CalculatePageProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(
        employees[0]?.id.toString() ?? '',
    );

    const selectedEmployee =
        employees.find(
            (employee) => employee.id.toString() === selectedEmployeeId,
        ) ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calculate" />

            <div className="flex flex-1 flex-col p-5 md:p-6">
                <Heading
                    title="Calculate"
                    description="Choose an employee to start the attendance calculation flow."
                />

                <Card className="w-1/3">
                    <CardHeader>
                        <CardTitle>Select employee</CardTitle>
                        <CardDescription>
                            Pick the employee whose attendance you want to
                            calculate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {employees.length === 0 ? (
                            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                Add employees first so the calculation page has
                                someone to select.
                            </div>
                        ) : (
                            <>
                                <Select
                                    value={selectedEmployeeId}
                                    onValueChange={setSelectedEmployeeId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select an employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((employee) => (
                                            <SelectItem
                                                key={employee.id}
                                                value={employee.id.toString()}
                                            >
                                                {employee.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                                    {selectedEmployee
                                        ? `Selected employee: ${selectedEmployee.fullName}`
                                        : 'Select an employee to continue.'}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
