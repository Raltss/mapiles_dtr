import { router } from '@inertiajs/react';
import { useState } from 'react';
import { store as calculateStore } from '@/routes/calculate';
import {
    buildMonthDays,
    createAttendanceEntry,
    daysPerPage,
    formatRateAmount,
    formatWorkedDuration,
    getAdjustedDailyRate,
    getAttendanceEntryKey,
    getBaseDailyRate,
    getHolidayLabel,
    getWorkedMinutes,
    monthOptions,
    type ActiveDtr,
    type AttendanceEntry,
    type AttendanceField,
    type EmployeeOption,
    type HolidayType,
    type InitialSelection,
} from '../helpers/calculate-page';

export type DtrSummaryEntry = {
    key: string;
    label: string;
    weekday: string;
    timeIn: string;
    timeOut: string;
    holidayLabel: string;
    workedDuration: string;
    rateLabel: string;
};

export type DtrSummary = {
    employeeName: string;
    monthLabel: string;
    year: string;
    totalDays: number;
    totalWorkedDuration: string;
    totalAmountLabel: string;
    entries: DtrSummaryEntry[];
};

function buildInitialAttendanceEntries(activeDtr: ActiveDtr | null | undefined) {
    if (!activeDtr) {
        return {} as Record<string, AttendanceEntry>;
    }

    return Object.fromEntries(
        activeDtr.entries.map((entry) => [
            getAttendanceEntryKey(activeDtr.employeeId.toString(), entry.date),
            {
                timeIn: entry.timeIn,
                timeOut: entry.timeOut,
                baseRate:
                    entry.baseRate ||
                    getBaseDailyRate(entry.rate, entry.holidayType),
                rate: entry.rate,
                holidayType: entry.holidayType,
            },
        ]),
    );
}

export function useCalculateAttendance(
    employees: EmployeeOption[],
    initialSelection: InitialSelection | null | undefined,
    activeDtr: ActiveDtr | null | undefined,
) {
    const today = new Date();
    const currentYear = initialSelection?.year ?? today.getFullYear();
    const currentMonth = initialSelection?.month ?? today.getMonth() + 1;
    const yearOptions = Array.from(
        { length: 7 },
        (_, index) => currentYear - 3 + index,
    );
    const initialEmployeeId =
        initialSelection?.employeeId?.toString() ??
        employees[0]?.id.toString() ??
        '';

    const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialEmployeeId);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [currentPage, setCurrentPage] = useState(1);
    const [attendanceEntries, setAttendanceEntries] = useState<
        Record<string, AttendanceEntry>
    >(() => buildInitialAttendanceEntries(activeDtr));
    const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
    const [isSubmittingDtr, setIsSubmittingDtr] = useState(false);

    const selectedEmployee =
        employees.find(
            (employee) => employee.id.toString() === selectedEmployeeId,
        ) ?? null;

    const monthDays = selectedEmployee
        ? buildMonthDays(
              Number(selectedYear),
              Number(selectedMonth),
              selectedEmployee.schedule,
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

    const getDefaultAttendanceEntry = (dateKey: string) => {
        const scheduledDay = monthDays.find((day) => day.key === dateKey);

        return createAttendanceEntry({
            dailyRate: selectedEmployee?.dailyRate ?? '',
            timeIn: scheduledDay?.defaultTimeIn ?? '',
            timeOut: scheduledDay?.defaultTimeOut ?? '',
        });
    };

    const getAttendanceEntry = (dateKey: string) => {
        const entryKey = getAttendanceEntryKey(selectedEmployeeId, dateKey);

        return attendanceEntries[entryKey] ?? getDefaultAttendanceEntry(dateKey);
    };

    const summaryEntryData = monthDays.map((day) => {
        const entry = getAttendanceEntry(day.key);
        const workedMinutes = getWorkedMinutes(entry.timeIn, entry.timeOut);
        const parsedRate = Number(entry.rate);

        return {
            key: day.key,
            label: day.label,
            weekday: day.weekday,
            timeIn: entry.timeIn,
            timeOut: entry.timeOut,
            holidayLabel: getHolidayLabel(entry.holidayType),
            holidayType: entry.holidayType,
            workedDuration: formatWorkedDuration(workedMinutes),
            workedMinutes: workedMinutes ?? 0,
            rateAmount: Number.isFinite(parsedRate) ? parsedRate : 0,
            rate: entry.rate,
            baseRate: entry.baseRate,
            rateLabel:
                entry.rate.trim() === '' ? '--' : formatRateAmount(entry.rate),
        };
    });

    const dtrSummary: DtrSummary = {
        employeeName: selectedEmployee?.fullName ?? '',
        monthLabel: selectedMonthLabel,
        year: selectedYear,
        totalDays: summaryEntryData.length,
        totalWorkedDuration: formatWorkedDuration(
            summaryEntryData.reduce(
                (total, entry) => total + entry.workedMinutes,
                0,
            ),
        ),
        totalAmountLabel: formatRateAmount(
            summaryEntryData.reduce(
                (total, entry) => total + entry.rateAmount,
                0,
            ),
        ),
        entries: summaryEntryData.map(
            ({
                workedMinutes,
                rateAmount,
                rate,
                baseRate,
                holidayType,
                ...entry
            }) => entry,
        ),
    };

    const updateAttendanceEntry = (
        dateKey: string,
        field: AttendanceField,
        value: AttendanceEntry[AttendanceField],
    ) => {
        setAttendanceEntries((currentEntries) => {
            const entryKey = getAttendanceEntryKey(selectedEmployeeId, dateKey);
            const currentEntry =
                currentEntries[entryKey] ?? getDefaultAttendanceEntry(dateKey);

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

    const resetReviewState = () => {
        setIsSummaryDialogOpen(false);
    };

    const handleEmployeeChange = (value: string) => {
        setSelectedEmployeeId(value);
        setCurrentPage(1);
        resetReviewState();
    };

    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        setCurrentPage(1);
        resetReviewState();
    };

    const handleYearChange = (value: string) => {
        setSelectedYear(value);
        setCurrentPage(1);
        resetReviewState();
    };

    const goToPage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const goToPreviousPage = () => {
        setCurrentPage((page) => Math.max(1, page - 1));
    };

    const goToNextPage = () => {
        setCurrentPage((page) => Math.min(totalPages, page + 1));
    };

    const openSummaryDialog = () => {
        setIsSummaryDialogOpen(true);
    };

    const handleSummaryDialogChange = (open: boolean) => {
        if (isSubmittingDtr) {
            return;
        }

        setIsSummaryDialogOpen(open);
    };

    const confirmDtr = () => {
        if (!selectedEmployee) {
            return;
        }

        router.post(
            calculateStore.url(),
            {
                employee_id: selectedEmployee.id,
                month: Number(selectedMonth),
                year: Number(selectedYear),
                entries: summaryEntryData.map((entry) => ({
                    date: entry.key,
                    time_in: entry.timeIn || null,
                    time_out: entry.timeOut || null,
                    holiday_type: entry.holidayType,
                    base_rate: entry.baseRate || null,
                    rate: entry.rate || null,
                })),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsSubmittingDtr(true),
                onSuccess: () => setIsSummaryDialogOpen(false),
                onFinish: () => setIsSubmittingDtr(false),
            },
        );
    };

    return {
        canSubmitDtr: monthDays.length > 0 && visiblePage === totalPages,
        confirmDtr,
        dtrSummary,
        getAttendanceEntry,
        goToNextPage,
        goToPage,
        goToPreviousPage,
        handleEmployeeChange,
        handleMonthChange,
        handleSummaryDialogChange,
        handleYearChange,
        isSubmittingDtr,
        isSummaryDialogOpen,
        monthDays,
        openSummaryDialog,
        pageNumbers,
        paginatedDays,
        selectedEmployee,
        selectedEmployeeId,
        selectedMonth,
        selectedMonthLabel,
        selectedYear,
        startIndex,
        totalPages,
        updateAttendanceEntry,
        visiblePage,
        yearOptions,
    };
}

export type CalculateAttendanceController = ReturnType<
    typeof useCalculateAttendance
>;