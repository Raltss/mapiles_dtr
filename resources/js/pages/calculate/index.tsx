import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    dailyRate: string;
    workDays: number[];
};

type CalculatePageProps = {
    employees: EmployeeOption[];
};

type HolidayType = 'none' | 'regularHoliday' | 'specialWorkingHoliday';

type AttendanceField = 'timeIn' | 'timeOut' | 'rate' | 'holidayType';

type AttendanceEntry = {
    timeIn: string;
    timeOut: string;
    baseRate: string;
    rate: string;
    holidayType: HolidayType;
};

function createAttendanceEntry(dailyRate: string = ''): AttendanceEntry {
    return {
        timeIn: '',
        timeOut: '',
        baseRate: dailyRate,
        rate: dailyRate,
        holidayType: 'none',
    };
}

type MonthDay = {
    key: string;
    label: string;
    weekday: string;
};

const monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
];

const holidayOptions: Array<{ label: string; value: HolidayType }> = [
    { label: 'None', value: 'none' },
    { label: 'Regular Holiday', value: 'regularHoliday' },
    {
        label: 'Special Working Holiday',
        value: 'specialWorkingHoliday',
    },
];

const daysPerPage = 7;

function formatDatePart(value: number): string {
    return value.toString().padStart(2, '0');
}

function getDateKey(year: number, month: number, day: number): string {
    return `${year}-${formatDatePart(month)}-${formatDatePart(day)}`;
}

function getAttendanceEntryKey(employeeId: string, dateKey: string): string {
    return `${employeeId || 'unassigned'}:${dateKey}`;
}

function getMinutesFromTime(value: string): number | null {
    if (!/^\d{2}:\d{2}$/.test(value)) {
        return null;
    }

    const [hours, minutes] = value.split(':').map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
}

function getWorkedMinutes(timeIn: string, timeOut: string): number | null {
    const timeInMinutes = getMinutesFromTime(timeIn);
    const timeOutMinutes = getMinutesFromTime(timeOut);

    if (timeInMinutes === null || timeOutMinutes === null) {
        return null;
    }

    if (timeOutMinutes >= timeInMinutes) {
        return timeOutMinutes - timeInMinutes;
    }

    return 24 * 60 - timeInMinutes + timeOutMinutes;
}

function formatWorkedDuration(totalMinutes: number | null): string {
    if (totalMinutes === null) {
        return '--';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
}

function getHolidayMultiplier(holidayType: HolidayType): number {
    switch (holidayType) {
        case 'regularHoliday':
            return 2;
        case 'specialWorkingHoliday':
            return 1.3;
        case 'none':
        default:
            return 1;
    }
}

function getAdjustedDailyRate(
    dailyRate: string,
    holidayType: HolidayType,
): string {
    if (dailyRate.trim() === '') {
        return '';
    }

    const parsedDailyRate = Number(dailyRate);

    if (!Number.isFinite(parsedDailyRate)) {
        return '';
    }

    return (parsedDailyRate * getHolidayMultiplier(holidayType)).toFixed(2);
}

function getBaseDailyRate(rate: string, holidayType: HolidayType): string {
    if (rate.trim() === '') {
        return '';
    }

    const parsedRate = Number(rate);

    if (!Number.isFinite(parsedRate)) {
        return '';
    }

    return (parsedRate / getHolidayMultiplier(holidayType)).toFixed(2);
}

function buildMonthDays(
    year: number,
    month: number,
    workDays: number[],
): MonthDay[] {
    const scheduledDays = new Set(workDays);

    if (scheduledDays.size === 0) {
        return [];
    }

    const totalDays = new Date(year, month, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => {
        const day = index + 1;
        const date = new Date(year, month - 1, day);

        if (!scheduledDays.has(date.getDay())) {
            return null;
        }

        return {
            key: getDateKey(year, month, day),
            label: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            }),
            weekday: date.toLocaleDateString('en-US', {
                weekday: 'long',
            }),
        };
    }).filter((day): day is MonthDay => day !== null);
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calculate',
        href: calculateIndex(),
    },
];

export default function Calculate({ employees }: CalculatePageProps) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const yearOptions = Array.from(
        { length: 7 },
        (_, index) => currentYear - 3 + index,
    );

    const [selectedEmployeeId, setSelectedEmployeeId] = useState(
        employees[0]?.id.toString() ?? '',
    );
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [currentPage, setCurrentPage] = useState(1);
    const [attendanceEntries, setAttendanceEntries] = useState<
        Record<string, AttendanceEntry>
    >({});

    const selectedEmployee =
        employees.find(
            (employee) => employee.id.toString() === selectedEmployeeId,
        ) ?? null;

    const monthDays = selectedEmployee
        ? buildMonthDays(
              Number(selectedYear),
              Number(selectedMonth),
              selectedEmployee.workDays,
          )
        : [];
    const totalPages = Math.max(1, Math.ceil(monthDays.length / daysPerPage));
    const visiblePage = Math.min(currentPage, totalPages);
    const startIndex = (visiblePage - 1) * daysPerPage;
    const paginatedDays = monthDays.slice(startIndex, startIndex + daysPerPage);
    const pageNumbers = Array.from(
        { length: totalPages },
        (_, index) => index + 1,
    );
    const selectedMonthLabel =
        monthOptions.find((month) => month.value.toString() === selectedMonth)
            ?.label ?? 'Selected month';

    const updateAttendanceEntry = (
        dateKey: string,
        field: AttendanceField,
        value: AttendanceEntry[AttendanceField],
    ) => {
        setAttendanceEntries((currentEntries) => {
            const entryKey = getAttendanceEntryKey(selectedEmployeeId, dateKey);
            const currentEntry =
                currentEntries[entryKey] ??
                createAttendanceEntry(selectedEmployee?.dailyRate ?? '');

            if (field === 'holidayType') {
                const holidayType = value as HolidayType;

                return {
                    ...currentEntries,
                    [entryKey]: {
                        ...currentEntry,
                        holidayType,
                        rate: getAdjustedDailyRate(
                            currentEntry.baseRate,
                            holidayType,
                        ),
                    },
                };
            }

            if (field === 'rate') {
                const rate = value as string;

                return {
                    ...currentEntries,
                    [entryKey]: {
                        ...currentEntry,
                        rate,
                        baseRate: getBaseDailyRate(
                            rate,
                            currentEntry.holidayType,
                        ),
                    },
                };
            }

            return {
                ...currentEntries,
                [entryKey]: {
                    ...currentEntry,
                    [field]: value as string,
                },
            };
        });
    };

    const handleEmployeeChange = (value: string) => {
        setSelectedEmployeeId(value);
        setCurrentPage(1);
    };

    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        setCurrentPage(1);
    };

    const handleYearChange = (value: string) => {
        setSelectedYear(value);
        setCurrentPage(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calculate" />

            <div className="flex flex-1 flex-col gap-6 p-5 md:p-6">
                <Heading
                    title="Calculate"
                    description="Choose an employee, set the month and year, then encode daily time in, time out, rate, and holiday entries."
                />

                <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle>Attendance setup</CardTitle>
                        <CardDescription>
                            Pick the employee and month you want to encode.
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
                                <div className="space-y-2">
                                    <Label htmlFor="employee-select">
                                        Employee
                                    </Label>
                                    <Select
                                        value={selectedEmployeeId}
                                        onValueChange={handleEmployeeChange}
                                    >
                                        <SelectTrigger
                                            id="employee-select"
                                            className="w-full"
                                        >
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
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {employees.length > 0 && selectedEmployee ? (
                    <Card className="w-full max-w-6xl">
                        <CardHeader>
                            <CardTitle>Daily attendance input</CardTitle>
                            <CardDescription>
                                Enter the time in, time out, editable rate, and
                                holiday type for each scheduled workday in{' '}
                                {selectedMonthLabel} {selectedYear}.
                            </CardDescription>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="attendance-month">
                                        Month
                                    </Label>
                                    <Select
                                        value={selectedMonth}
                                        onValueChange={handleMonthChange}
                                    >
                                        <SelectTrigger
                                            id="attendance-month"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select a month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthOptions.map((month) => (
                                                <SelectItem
                                                    key={month.value}
                                                    value={month.value.toString()}
                                                >
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attendance-year">
                                        Year
                                    </Label>
                                    <Select
                                        value={selectedYear}
                                        onValueChange={handleYearChange}
                                    >
                                        <SelectTrigger
                                            id="attendance-year"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select a year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map((year) => (
                                                <SelectItem
                                                    key={year}
                                                    value={year.toString()}
                                                >
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {monthDays.length === 0 ? (
                                <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                    This employee has no scheduled workdays for{' '}
                                    {selectedMonthLabel} {selectedYear}.
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-4 py-3 md:flex-row md:items-center md:justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Showing scheduled days{' '}
                                            {startIndex + 1}-
                                            {Math.min(
                                                startIndex +
                                                    paginatedDays.length,
                                                monthDays.length,
                                            )}{' '}
                                            of {monthDays.length}
                                            {paginatedDays.length > 0
                                                ? ` (${paginatedDays[0].label} to ${paginatedDays[paginatedDays.length - 1].label})`
                                                : ''}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage((page) =>
                                                        Math.max(1, page - 1),
                                                    )
                                                }
                                                disabled={visiblePage === 1}
                                            >
                                                Previous
                                            </Button>

                                            {pageNumbers.map((pageNumber) => (
                                                <Button
                                                    key={pageNumber}
                                                    type="button"
                                                    variant={
                                                        pageNumber ===
                                                        visiblePage
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            pageNumber,
                                                        )
                                                    }
                                                >
                                                    {pageNumber}
                                                </Button>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setCurrentPage((page) =>
                                                        Math.min(
                                                            totalPages,
                                                            page + 1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    visiblePage === totalPages
                                                }
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {paginatedDays.map((day) => {
                                            const entryKey =
                                                getAttendanceEntryKey(
                                                    selectedEmployeeId,
                                                    day.key,
                                                );
                                            const entry =
                                                attendanceEntries[entryKey] ??
                                                createAttendanceEntry(
                                                    selectedEmployee.dailyRate,
                                                );
                                            const workedMinutes =
                                                getWorkedMinutes(
                                                    entry.timeIn,
                                                    entry.timeOut,
                                                );
                                            const workedDuration =
                                                formatWorkedDuration(
                                                    workedMinutes,
                                                );

                                            return (
                                                <div
                                                    key={day.key}
                                                    className="grid gap-3 rounded-lg border p-4 md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)_160px_200px_120px] md:items-end"
                                                >
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {day.label}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {day.weekday}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`time-in-${day.key}`}
                                                        >
                                                            Time in
                                                        </Label>
                                                        <Input
                                                            id={`time-in-${day.key}`}
                                                            type="time"
                                                            value={entry.timeIn}
                                                            onChange={(event) =>
                                                                updateAttendanceEntry(
                                                                    day.key,
                                                                    'timeIn',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`time-out-${day.key}`}
                                                        >
                                                            Time out
                                                        </Label>
                                                        <Input
                                                            id={`time-out-${day.key}`}
                                                            type="time"
                                                            value={
                                                                entry.timeOut
                                                            }
                                                            onChange={(event) =>
                                                                updateAttendanceEntry(
                                                                    day.key,
                                                                    'timeOut',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`holiday-type-${day.key}`}
                                                        >
                                                            Holiday type
                                                        </Label>
                                                        <Select
                                                            value={
                                                                entry.holidayType
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                updateAttendanceEntry(
                                                                    day.key,
                                                                    'holidayType',
                                                                    value as HolidayType,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                id={`holiday-type-${day.key}`}
                                                                className="w-full"
                                                            >
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {holidayOptions.map(
                                                                    (
                                                                        holidayOption,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                holidayOption.value
                                                                            }
                                                                            value={
                                                                                holidayOption.value
                                                                            }
                                                                        >
                                                                            {
                                                                                holidayOption.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`hours-worked-${day.key}`}
                                                        >
                                                            Hours worked
                                                        </Label>
                                                        <Input
                                                            id={`hours-worked-${day.key}`}
                                                            type="text"
                                                            value={
                                                                workedDuration
                                                            }
                                                            readOnly
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={`rate-${day.key}`}
                                                        >
                                                            Rate
                                                        </Label>
                                                        <Input
                                                            id={`rate-${day.key}`}
                                                            type="number"
                                                            inputMode="decimal"
                                                            min="0"
                                                            step="0.01"
                                                            value={entry.rate}
                                                            onChange={(event) =>
                                                                updateAttendanceEntry(
                                                                    day.key,
                                                                    'rate',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </AppLayout>
    );
}
