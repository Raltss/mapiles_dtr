import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
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
import AppLayout from '@/layouts/app-layout';
import { index as rankingIndex } from '@/routes/ranking';
import {
    attendanceCalendarRangeOptions,
    monthOptions,
    type AttendanceCalendarRange,
} from '../../calculate/helpers/calculate-page';
import {
    breadcrumbs,
    formatLateMinutes,
    formatPunctualityScore,
    getRankingPeriodLabel,
    type RankingPageProps,
} from '../helpers/ranking-page';

export default function RankingPageContent({
    rankings,
    yearOptions,
    initialSelection,
}: RankingPageProps) {
    const selectedMonth = initialSelection.month.toString();
    const selectedYear = initialSelection.year.toString();
    const selectedCalendarRange = initialSelection.calendarRange;
    const periodLabel = getRankingPeriodLabel(
        initialSelection.month,
        initialSelection.year,
        selectedCalendarRange,
    );

    const visitWithFilters = (filters: {
        month: string;
        year: string;
        calendarRange: AttendanceCalendarRange;
    }) => {
        router.get(
            rankingIndex.url({
                query: {
                    month: Number(filters.month),
                    year: Number(filters.year),
                    ...(filters.calendarRange !== 'wholeMonth'
                        ? { calendar_range: filters.calendarRange }
                        : {}),
                },
            }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const topEmployee = rankings[0] ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ranking" />

            <div className="flex flex-1 flex-col gap-6 p-5 md:p-6">
                <Heading
                    title="Ranking"
                    description="Compare employees by punctuality only. Overtime is not part of this ranking. Employees are ranked by how consistently they arrive on time within the selected period."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Punctuality Filters</CardTitle>
                        <CardDescription>
                            Filter by month, year, and calendar range to see who
                            has the strongest on-time record.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="ranking-calendar-range">
                                    Calendar range
                                </Label>
                                <Select
                                    value={selectedCalendarRange}
                                    onValueChange={(value) =>
                                        visitWithFilters({
                                            month: selectedMonth,
                                            year: selectedYear,
                                            calendarRange:
                                                value as AttendanceCalendarRange,
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="ranking-calendar-range"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a calendar range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {attendanceCalendarRangeOptions.map(
                                            (option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ranking-month">Month</Label>
                                <Select
                                    value={selectedMonth}
                                    onValueChange={(value) =>
                                        visitWithFilters({
                                            month: value,
                                            year: selectedYear,
                                            calendarRange:
                                                selectedCalendarRange,
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="ranking-month"
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
                                <Label htmlFor="ranking-year">Year</Label>
                                <Select
                                    value={selectedYear}
                                    onValueChange={(value) =>
                                        visitWithFilters({
                                            month: selectedMonth,
                                            year: value,
                                            calendarRange:
                                                selectedCalendarRange,
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id="ranking-year"
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
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Selected period</CardDescription>
                            <CardTitle>{periodLabel}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Employees ranked</CardDescription>
                            <CardTitle>{rankings.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Top punctuality</CardDescription>
                            <CardTitle>
                                {topEmployee
                                    ? formatPunctualityScore(
                                          topEmployee.punctualityScore,
                                      )
                                    : '--'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Punctuality Ranking</CardTitle>
                        <CardDescription>
                            On-time days improve the score. Late arrivals and
                            late minutes lower the ranking. Overtime hours are
                            ignored.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {rankings.length === 0 ? (
                            <div className="rounded-lg border border-dashed px-6 py-12 text-center">
                                <p className="text-sm font-medium">
                                    No punctuality records found
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Save confirmed DTRs for {periodLabel} to see
                                    employee rankings here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden md:block">
                                    <div className="overflow-x-auto rounded-lg border">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-muted/30 text-left text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">
                                                        Rank
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Employee
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Punctuality
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        On-time days
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Late days
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Late minutes
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Evaluated days
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankings.map((ranking) => (
                                                    <tr
                                                        key={ranking.employeeId}
                                                        className="border-b align-top last:border-b-0 odd:bg-muted/10"
                                                    >
                                                        <td className="px-4 py-3 font-semibold text-foreground">
                                                            #{ranking.rank}
                                                        </td>
                                                        <td className="px-3 py-3 font-medium text-foreground">
                                                            {ranking.employeeName}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {formatPunctualityScore(
                                                                ranking.punctualityScore,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {ranking.onTimeDays}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {ranking.lateDays}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {formatLateMinutes(
                                                                ranking.totalLateMinutes,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {ranking.evaluatedDays}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="space-y-3 md:hidden">
                                    {rankings.map((ranking) => (
                                        <div
                                            key={ranking.employeeId}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        #{ranking.rank}{' '}
                                                        {ranking.employeeName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Punctuality{' '}
                                                        {formatPunctualityScore(
                                                            ranking.punctualityScore,
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                >
                                                    {ranking.evaluatedDays}{' '}
                                                    days
                                                </Button>
                                            </div>

                                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        On-time days
                                                    </p>
                                                    <p className="font-medium text-foreground">
                                                        {ranking.onTimeDays}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Late days
                                                    </p>
                                                    <p className="font-medium text-foreground">
                                                        {ranking.lateDays}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Late minutes
                                                    </p>
                                                    <p className="font-medium text-foreground">
                                                        {formatLateMinutes(
                                                            ranking.totalLateMinutes,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
