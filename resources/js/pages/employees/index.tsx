import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import {
    index as employeesIndex,
    store as employeesStore,
} from '@/routes/employees';
import type { BreadcrumbItem } from '@/types';

type EmployeeScheduleGroup = {
    days: number[];
    startTime: string;
    endTime: string;
};

type EmployeeRow = {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    fullName: string;
    schedule: {
        groups: EmployeeScheduleGroup[];
    };
};

type EmployeesPageProps = {
    successMessage?: string | null;
    employees: EmployeeRow[];
    summary: {
        totalEmployees: number;
        averageWorkDays: number;
        averageGraceMinutes: number;
    };
};

type ScheduleGroupForm = {
    days: number[];
    start_time: string;
    end_time: string;
};

type EmployeeFormData = {
    first_name: string;
    middle_name: string;
    last_name: string;
    schedule_groups: ScheduleGroupForm[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: employeesIndex(),
    },
];

const dayOptions = [
    { value: 1, label: 'Monday', shortLabel: 'Mon' },
    { value: 2, label: 'Tuesday', shortLabel: 'Tue' },
    { value: 3, label: 'Wednesday', shortLabel: 'Wed' },
    { value: 4, label: 'Thursday', shortLabel: 'Thu' },
    { value: 5, label: 'Friday', shortLabel: 'Fri' },
    { value: 6, label: 'Saturday', shortLabel: 'Sat' },
    { value: 0, label: 'Sunday', shortLabel: 'Sun' },
];

const createScheduleGroup = (days: number[] = []): ScheduleGroupForm => ({
    days,
    start_time: '09:00',
    end_time: '18:00',
});

const defaultEmployeeFormData = (): EmployeeFormData => ({
    first_name: '',
    middle_name: '',
    last_name: '',
    schedule_groups: [createScheduleGroup([1, 2, 3, 4, 5])],
});

const employeePath = (employeeId: number) => `/employees/${employeeId}`;

const employeeToFormData = (employee: EmployeeRow): EmployeeFormData => ({
    first_name: employee.firstName,
    middle_name: employee.middleName ?? '',
    last_name: employee.lastName,
    schedule_groups: employee.schedule.groups.map((group) => ({
        days: [...group.days],
        start_time: group.startTime.slice(0, 5),
        end_time: group.endTime.slice(0, 5),
    })),
});

function formatTime(time: string) {
    const [hour, minute] = time.split(':').map(Number);

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(1970, 0, 1, hour, minute)));
}

function labelForDay(day: number) {
    return (
        dayOptions.find((option) => option.value === day)?.shortLabel ??
        `Day ${day}`
    );
}

function formatDaySet(days: number[]) {
    if (days.length === 0) {
        return 'No days';
    }

    const sortedDays = [...days].sort((left, right) => left - right);
    const ranges: Array<[number, number]> = [];
    let rangeStart = sortedDays[0];
    let previousDay = sortedDays[0];

    for (const day of sortedDays.slice(1)) {
        if (day === previousDay + 1) {
            previousDay = day;
            continue;
        }

        ranges.push([rangeStart, previousDay]);
        rangeStart = day;
        previousDay = day;
    }

    ranges.push([rangeStart, previousDay]);

    return ranges
        .map(([start, end]) =>
            start === end
                ? labelForDay(start)
                : `${labelForDay(start)}-${labelForDay(end)}`,
        )
        .join(', ');
}

export default function Employees({
    successMessage = null,
    employees,
    summary,
}: EmployeesPageProps) {
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(
        null,
    );
    const form = useForm<EmployeeFormData>(defaultEmployeeFormData());
    const errors = form.errors as Record<string, string | undefined>;
    const isEditingEmployee = editingEmployee !== null;

    const resetEmployeeForm = () => {
        setEditingEmployee(null);
        form.setData(defaultEmployeeFormData());
        form.clearErrors();
    };

    const openCreateEmployeeDialog = () => {
        resetEmployeeForm();
        setIsEmployeeDialogOpen(true);
    };

    const openEditEmployeeDialog = (employee: EmployeeRow) => {
        setEditingEmployee(employee);
        form.setData(employeeToFormData(employee));
        form.clearErrors();
        setIsEmployeeDialogOpen(true);
    };

    const handleEmployeeDialogChange = (open: boolean) => {
        setIsEmployeeDialogOpen(open);

        if (!open) {
            resetEmployeeForm();
        }
    };

    const updateScheduleGroup = <K extends keyof ScheduleGroupForm>(
        index: number,
        field: K,
        value: ScheduleGroupForm[K],
    ) => {
        form.setData(
            'schedule_groups',
            form.data.schedule_groups.map((group, currentIndex) =>
                currentIndex === index ? { ...group, [field]: value } : group,
            ),
        );
    };

    const toggleGroupDay = (index: number, day: number, checked: boolean) => {
        const group = form.data.schedule_groups[index];
        const nextDays = checked
            ? [...group.days, day]
            : group.days.filter((selectedDay) => selectedDay !== day);

        updateScheduleGroup(
            index,
            'days',
            [...new Set(nextDays)].sort((left, right) => left - right),
        );
    };

    const addScheduleGroup = () => {
        form.setData('schedule_groups', [
            ...form.data.schedule_groups,
            createScheduleGroup(),
        ]);
    };

    const removeScheduleGroup = (index: number) => {
        if (form.data.schedule_groups.length === 1) {
            return;
        }

        form.setData(
            'schedule_groups',
            form.data.schedule_groups.filter(
                (_, currentIndex) => currentIndex !== index,
            ),
        );
    };

    const dayIsUsedElsewhere = (groupIndex: number, day: number) =>
        form.data.schedule_groups.some(
            (group, currentIndex) =>
                currentIndex !== groupIndex && group.days.includes(day),
        );

    const groupDayError = (index: number) =>
        errors[`schedule_groups.${index}.days`] ??
        errors[`schedule_groups.${index}.days.0`];

    const groupFieldError = (index: number, field: 'start_time' | 'end_time') =>
        errors[`schedule_groups.${index}.${field}`];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const onSuccess = () => {
            setIsEmployeeDialogOpen(false);
            resetEmployeeForm();
        };

        if (editingEmployee) {
            form.put(employeePath(editingEmployee.id), {
                preserveScroll: true,
                onSuccess,
            });

            return;
        }

        form.post(employeesStore.url(), {
            preserveScroll: true,
            onSuccess,
        });
    };

    const deleteEmployee = (employee: EmployeeRow) => {
        if (!window.confirm(`Delete ${employee.fullName}?`)) {
            return;
        }

        router.delete(employeePath(employee.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <Heading
                        title="Employees"
                        description="Add employee records and define fixed schedule blocks for attendance tracking."
                    />

                    <Button type="button" onClick={openCreateEmployeeDialog}>
                        Add employee
                    </Button>
                </div>

                <Dialog
                    open={isEmployeeDialogOpen}
                    onOpenChange={handleEmployeeDialogChange}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>
                                {isEditingEmployee
                                    ? 'Edit employee'
                                    : 'Add employee'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">
                                        First name *
                                    </Label>
                                    <Input
                                        id="first_name"
                                        value={form.data.first_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'first_name',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Juan"
                                        aria-invalid={!!form.errors.first_name}
                                    />
                                    <InputError
                                        message={form.errors.first_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="middle_name">
                                        Middle name (Optional)
                                    </Label>
                                    <Input
                                        id="middle_name"
                                        value={form.data.middle_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'middle_name',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Santos"
                                        aria-invalid={!!form.errors.middle_name}
                                    />
                                    <InputError
                                        message={form.errors.middle_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">
                                        Last name *
                                    </Label>
                                    <Input
                                        id="last_name"
                                        value={form.data.last_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'last_name',
                                                event.currentTarget.value,
                                            )
                                        }
                                        placeholder="Dela Cruz"
                                        aria-invalid={!!form.errors.last_name}
                                    />
                                    <InputError
                                        message={form.errors.last_name}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 rounded-xl border p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <Label>Schedule blocks</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Select multiple days inside each
                                            block, then assign one shared
                                            schedule to those days.
                                        </p>
                                        <InputError
                                            message={errors.schedule_groups}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addScheduleGroup}
                                    >
                                        Add schedule block
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {form.data.schedule_groups.map(
                                        (group, index) => (
                                            <div
                                                key={index}
                                                className="space-y-4 rounded-lg border p-4"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-medium">
                                                            Schedule block{' '}
                                                            {index + 1}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Pick the days that
                                                            share the same
                                                            shift.
                                                        </p>
                                                    </div>
                                                    {form.data.schedule_groups
                                                        .length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                removeScheduleGroup(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            Remove block
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label>Days</Label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {dayOptions.map(
                                                            (dayOption) => {
                                                                const checked =
                                                                    group.days.includes(
                                                                        dayOption.value,
                                                                    );
                                                                const disabled =
                                                                    !checked &&
                                                                    dayIsUsedElsewhere(
                                                                        index,
                                                                        dayOption.value,
                                                                    );

                                                                return (
                                                                    <label
                                                                        key={
                                                                            dayOption.value
                                                                        }
                                                                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${disabled ? 'opacity-50' : ''}`}
                                                                    >
                                                                        <Checkbox
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            disabled={
                                                                                disabled
                                                                            }
                                                                            onCheckedChange={(
                                                                                isChecked,
                                                                            ) =>
                                                                                toggleGroupDay(
                                                                                    index,
                                                                                    dayOption.value,
                                                                                    isChecked ===
                                                                                        true,
                                                                                )
                                                                            }
                                                                        />
                                                                        <span>
                                                                            {
                                                                                dayOption.label
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                    <InputError
                                                        message={groupDayError(
                                                            index,
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label
                                                            htmlFor={`start_time_${index}`}
                                                        >
                                                            Start
                                                        </Label>
                                                        <Input
                                                            id={`start_time_${index}`}
                                                            type="time"
                                                            value={
                                                                group.start_time
                                                            }
                                                            onChange={(event) =>
                                                                updateScheduleGroup(
                                                                    index,
                                                                    'start_time',
                                                                    event
                                                                        .currentTarget
                                                                        .value,
                                                                )
                                                            }
                                                            aria-invalid={
                                                                !!groupFieldError(
                                                                    index,
                                                                    'start_time',
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={groupFieldError(
                                                                index,
                                                                'start_time',
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label
                                                            htmlFor={`end_time_${index}`}
                                                        >
                                                            End
                                                        </Label>
                                                        <Input
                                                            id={`end_time_${index}`}
                                                            type="time"
                                                            value={
                                                                group.end_time
                                                            }
                                                            onChange={(event) =>
                                                                updateScheduleGroup(
                                                                    index,
                                                                    'end_time',
                                                                    event
                                                                        .currentTarget
                                                                        .value,
                                                                )
                                                            }
                                                            aria-invalid={
                                                                !!groupFieldError(
                                                                    index,
                                                                    'end_time',
                                                                )
                                                            }
                                                        />
                                                        <InputError
                                                            message={groupFieldError(
                                                                index,
                                                                'end_time',
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="gap-2 border-t pt-4">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    {isEditingEmployee
                                        ? 'Save changes'
                                        : 'Add employee'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {successMessage && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {successMessage}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total employees</CardDescription>
                            <CardTitle className="text-3xl">
                                {summary.totalEmployees}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {employees.length === 0 ? (
                            <div className="rounded-lg border border-dashed px-6 py-12 text-center">
                                <p className="text-sm font-medium">
                                    No employees yet
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Click Add employee to create the first
                                    record.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border text-sm">
                                    <thead>
                                        <tr className="text-left text-muted-foreground">
                                            <th className="py-3 pr-4 font-medium">
                                                Employee
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Weekly schedule
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {employees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td className="py-4 pr-4 align-top font-medium">
                                                    {employee.fullName}
                                                </td>
                                                <td className="px-4 py-4 align-top text-muted-foreground">
                                                    <div className="space-y-1">
                                                        {employee.schedule.groups.map(
                                                            (group, index) => (
                                                                <div
                                                                    key={`${employee.id}-${index}`}
                                                                >
                                                                    {formatDaySet(
                                                                        group.days,
                                                                    )}
                                                                    :{' '}
                                                                    {formatTime(
                                                                        group.startTime,
                                                                    )}{' '}
                                                                    -{' '}
                                                                    {formatTime(
                                                                        group.endTime,
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                openEditEmployeeDialog(
                                                                    employee,
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                deleteEmployee(
                                                                    employee,
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
