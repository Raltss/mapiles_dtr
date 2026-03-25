import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    monthOptions,
    type AttendanceEntry,
    type AttendanceField,
    type MonthDay,
} from '../helpers/calculate-page';
import DailyAttendanceRow from './daily-attendance-row';
import DailyAttendanceTableRow from './daily-attendance-table-row';

type DailyAttendanceCardProps = {
    selectedMonth: string;
    selectedYear: string;
    selectedMonthLabel: string;
    yearOptions: number[];
    monthDays: MonthDay[];
    paginatedDays: MonthDay[];
    startIndex: number;
    visiblePage: number;
    totalPages: number;
    pageNumbers: number[];
    canSubmitDtr: boolean;
    onMonthChange: (value: string) => void;
    onYearChange: (value: string) => void;
    onPageChange: (pageNumber: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
    onSubmit: () => void;
    onCheckComputation: (dateKey: string) => void;
    getAttendanceEntry: (dateKey: string) => AttendanceEntry;
    updateAttendanceEntry: (
        dateKey: string,
        field: AttendanceField,
        value: AttendanceEntry[AttendanceField],
    ) => void;
};

export default function DailyAttendanceCard({
    selectedMonth,
    selectedYear,
    selectedMonthLabel,
    yearOptions,
    monthDays,
    paginatedDays,
    startIndex,
    visiblePage,
    totalPages,
    pageNumbers,
    canSubmitDtr,
    onMonthChange,
    onYearChange,
    onPageChange,
    onPreviousPage,
    onNextPage,
    onSubmit,
    onCheckComputation,
    getAttendanceEntry,
    updateAttendanceEntry,
}: DailyAttendanceCardProps) {
    return (
        <Card className="w-full max-w-6xl">
            <CardHeader>
                <CardTitle>Daily attendance input</CardTitle>
                <CardDescription>
                    Times and rate are prefilled from the employee's schedule.
                    Edit only the days with exceptions for {selectedMonthLabel}{' '}
                    {selectedYear}, or mark a scheduled day as absent to force
                    0 hours and PHP 0.00.
                </CardDescription>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="attendance-month">Month</Label>
                        <Select
                            value={selectedMonth}
                            onValueChange={onMonthChange}
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
                        <Label htmlFor="attendance-year">Year</Label>
                        <Select
                            value={selectedYear}
                            onValueChange={onYearChange}
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
                                Showing scheduled days {startIndex + 1}-
                                {Math.min(
                                    startIndex + paginatedDays.length,
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
                                    onClick={onPreviousPage}
                                    disabled={visiblePage === 1}
                                >
                                    Previous
                                </Button>

                                {pageNumbers.map((pageNumber) => (
                                    <Button
                                        key={pageNumber}
                                        type="button"
                                        variant={
                                            pageNumber === visiblePage
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => onPageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </Button>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onNextPage}
                                    disabled={visiblePage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/30 text-left text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                Date
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Time in
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Time out
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Holiday
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Absent
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Hours
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Rate
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDays.map((day) => (
                                            <DailyAttendanceTableRow
                                                key={day.key}
                                                day={day}
                                                entry={getAttendanceEntry(
                                                    day.key,
                                                )}
                                                onCheckComputation={() =>
                                                    onCheckComputation(day.key)
                                                }
                                                onUpdate={(field, value) =>
                                                    updateAttendanceEntry(
                                                        day.key,
                                                        field,
                                                        value,
                                                    )
                                                }
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {paginatedDays.map((day) => (
                                <DailyAttendanceRow
                                    key={day.key}
                                    day={day}
                                    entry={getAttendanceEntry(day.key)}
                                    onCheckComputation={() =>
                                        onCheckComputation(day.key)
                                    }
                                    onUpdate={(field, value) =>
                                        updateAttendanceEntry(
                                            day.key,
                                            field,
                                            value,
                                        )
                                    }
                                />
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/10 px-4 py-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-muted-foreground">
                                {canSubmitDtr
                                    ? 'You are on the last page. Review the entries, then submit to open the DTR summary.'
                                    : 'Reach the last page to review and submit the full DTR summary.'}
                            </p>

                            {canSubmitDtr ? (
                                <Button type="button" onClick={onSubmit}>
                                    Submit DTR
                                </Button>
                            ) : null}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
