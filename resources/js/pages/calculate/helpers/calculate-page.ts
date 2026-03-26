import { index as calculateIndex } from '@/routes/calculate';
import type { BreadcrumbItem } from '@/types';

export type EmployeeScheduleDay = {
    day: number;
    startTime: string;
    endTime: string;
    graceMinutes: number;
};

export type EmployeeOption = {
    id: number;
    fullName: string;
    dailyRate: string;
    workDays: number[];
    schedule: EmployeeScheduleDay[];
};

export type InitialSelection = {
    employeeId?: number | null;
    month?: number | null;
    year?: number | null;
};

export type ActiveDtrEntry = {
    date: string;
    timeIn: string;
    timeOut: string;
    holidayType: HolidayType;
    baseRate: string;
    rate: string;
    isAbsent: boolean;
};

export type ActiveDtr = {
    employeeId: number;
    month: number;
    year: number;
    entries: ActiveDtrEntry[];
};

export type CalculatePageProps = {
    successMessage?: string | null;
    employees: EmployeeOption[];
    initialSelection?: InitialSelection | null;
    isEditingFromSummary?: boolean;
    activeDtr?: ActiveDtr | null;
};

export type HolidayType = 'none' | 'regularHoliday' | 'specialWorkingHoliday';

export type AttendanceField = 'timeIn' | 'timeOut' | 'holidayType' | 'isAbsent';

export type AttendanceEntry = {
    timeIn: string;
    timeOut: string;
    baseRate: string;
    rate: string;
    holidayType: HolidayType;
    isAbsent: boolean;
};

export type AttendanceDefaults = {
    timeIn?: string;
    timeOut?: string;
    dailyRate?: string;
};

export type MonthDay = {
    key: string;
    label: string;
    weekday: string;
    defaultTimeIn: string;
    defaultTimeOut: string;
    graceMinutes: number;
};

export type OvertimeSummaryBreakdown = {
    totalMinutes: number;
    totalDurationLabel: string;
    totalHours: number;
    totalHoursLabel: string;
    rateBasis: string;
    rateBasisLabel: string;
    baseAmount: number;
    baseAmountLabel: string;
    premiumRateLabel: string;
    premiumAmount: number;
    premiumAmountLabel: string;
    totalAmount: number;
    totalAmountLabel: string;
    formulaLabel: string;
};

export function createAttendanceEntry(
    defaults: AttendanceDefaults = {},
): AttendanceEntry {
    return {
        timeIn: defaults.timeIn ?? '',
        timeOut: defaults.timeOut ?? '',
        baseRate: defaults.dailyRate ?? '',
        rate: defaults.dailyRate ?? '',
        holidayType: 'none',
        isAbsent: false,
    };
}

export const monthOptions = [
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

export const holidayOptions: Array<{ label: string; value: HolidayType }> = [
    { label: 'None', value: 'none' },
    { label: 'Regular Holiday', value: 'regularHoliday' },
    {
        label: 'Special Non Working Day',
        value: 'specialWorkingHoliday',
    },
];

export const daysPerPage = 7;
export const breakMinutesPerShift = 60;
export const halfDayThresholdMinutes = 180;
export const overtimePremiumRate = 0.25;

function formatDatePart(value: number): string {
    return value.toString().padStart(2, '0');
}

function getDateKey(year: number, month: number, day: number): string {
    return `${year}-${formatDatePart(month)}-${formatDatePart(day)}`;
}

function normalizeTimeValue(value: string): string {
    return value.length >= 5 ? value.slice(0, 5) : value;
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

export function getAttendanceEntryKey(employeeId: string, dateKey: string) {
    return `${employeeId || 'unassigned'}:${dateKey}`;
}

export function getShiftDurationMinutes(
    timeIn: string,
    timeOut: string,
): number | null {
    const timeInMinutes = getMinutesFromTime(timeIn);
    const timeOutMinutes = getMinutesFromTime(timeOut);

    if (timeInMinutes === null || timeOutMinutes === null) {
        return null;
    }

    return timeOutMinutes >= timeInMinutes
        ? timeOutMinutes - timeInMinutes
        : 24 * 60 - timeInMinutes + timeOutMinutes;
}

export function getWorkedMinutes(
    timeIn: string,
    timeOut: string,
): number | null {
    const totalWorkedMinutes = getShiftDurationMinutes(timeIn, timeOut);

    if (totalWorkedMinutes === null) {
        return null;
    }

    return Math.max(0, totalWorkedMinutes - breakMinutesPerShift);
}

export function getOvertimeMinutes(
    workedMinutes: number | null,
    scheduledTimeIn: string,
    scheduledTimeOut: string,
): number {
    const scheduledWorkedMinutes = getWorkedMinutes(
        scheduledTimeIn,
        scheduledTimeOut,
    );

    if (workedMinutes === null || scheduledWorkedMinutes === null) {
        return 0;
    }

    return Math.max(0, workedMinutes - scheduledWorkedMinutes);
}

export function formatWorkedDuration(totalMinutes: number | null): string {
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

export function formatDecimalHours(value: number): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function getHolidayMultiplier(holidayType: HolidayType): number {
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

export function getHolidayLabel(holidayType: HolidayType): string {
    return (
        holidayOptions.find(
            (holidayOption) => holidayOption.value === holidayType,
        )?.label ?? 'None'
    );
}

export function formatRateAmount(value: number | string): string {
    const parsedValue = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(parsedValue)) {
        return '--';
    }

    return `PHP ${parsedValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function buildOvertimeSummary(
    totalMinutes: number,
    dailyRate: string,
): OvertimeSummaryBreakdown {
    const parsedRateBasis = Number(dailyRate);
    const hasRateBasis =
        dailyRate.trim() !== '' && Number.isFinite(parsedRateBasis);
    const safeRateBasis = hasRateBasis ? parsedRateBasis : 0;
    const totalHours = totalMinutes / 60;
    const baseAmount = totalHours * safeRateBasis;
    const premiumAmount = baseAmount * overtimePremiumRate;
    const totalAmount = baseAmount + premiumAmount;

    let formulaLabel = 'No overtime minutes were recorded for this DTR.';

    if (totalMinutes > 0 && !hasRateBasis) {
        formulaLabel = `${totalMinutes} overtime minutes were recorded, but the employee daily rate is unavailable so overtime pay stays ${formatRateAmount(0)}.`;
    } else if (totalMinutes > 0) {
        formulaLabel = `${totalMinutes} mins / 60 = ${formatDecimalHours(totalHours)} hours. ${formatDecimalHours(totalHours)} x ${formatRateAmount(safeRateBasis)} = ${formatRateAmount(baseAmount)}. ${formatRateAmount(baseAmount)} + 25% (${formatRateAmount(premiumAmount)}) = ${formatRateAmount(totalAmount)}.`;
    }

    return {
        totalMinutes,
        totalDurationLabel: formatWorkedDuration(totalMinutes),
        totalHours,
        totalHoursLabel: `${formatDecimalHours(totalHours)} hours`,
        rateBasis: hasRateBasis ? safeRateBasis.toFixed(2) : '',
        rateBasisLabel: hasRateBasis ? formatRateAmount(safeRateBasis) : '--',
        baseAmount,
        baseAmountLabel: formatRateAmount(baseAmount),
        premiumRateLabel: `${Math.round(overtimePremiumRate * 100)}%`,
        premiumAmount,
        premiumAmountLabel: formatRateAmount(premiumAmount),
        totalAmount,
        totalAmountLabel: formatRateAmount(totalAmount),
        formulaLabel,
    };
}

export function getAdjustedDailyRate(
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

export function getLateMinutes(
    timeIn: string,
    scheduledTimeIn: string,
    graceMinutes: number,
): number | null {
    const actualTimeInMinutes = getMinutesFromTime(timeIn);
    const scheduledTimeInMinutes = getMinutesFromTime(scheduledTimeIn);

    if (actualTimeInMinutes === null || scheduledTimeInMinutes === null) {
        return null;
    }

    return Math.max(
        0,
        actualTimeInMinutes -
            scheduledTimeInMinutes -
            Math.max(0, graceMinutes),
    );
}

export function isHalfDayTimeIn(
    timeIn: string,
    scheduledTimeIn: string,
): boolean {
    const actualTimeInMinutes = getMinutesFromTime(timeIn);
    const scheduledTimeInMinutes = getMinutesFromTime(scheduledTimeIn);

    if (actualTimeInMinutes === null || scheduledTimeInMinutes === null) {
        return false;
    }

    return (
        actualTimeInMinutes >= scheduledTimeInMinutes + halfDayThresholdMinutes
    );
}

export function getComputedDailyRate(
    baseDailyRate: string,
    holidayType: HolidayType,
    timeIn: string,
    scheduledTimeIn: string,
    graceMinutes: number,
): string {
    const adjustedDailyRate = getAdjustedDailyRate(baseDailyRate, holidayType);

    if (adjustedDailyRate === '') {
        return '';
    }

    const parsedAdjustedDailyRate = Number(adjustedDailyRate);

    if (!Number.isFinite(parsedAdjustedDailyRate)) {
        return '';
    }

    if (isHalfDayTimeIn(timeIn, scheduledTimeIn)) {
        return (parsedAdjustedDailyRate / 2).toFixed(2);
    }

    const lateMinutes = getLateMinutes(timeIn, scheduledTimeIn, graceMinutes);

    if (lateMinutes === null) {
        return adjustedDailyRate;
    }

    return Math.max(0, parsedAdjustedDailyRate - lateMinutes).toFixed(2);
}

export function getBaseDailyRate(
    rate: string,
    holidayType: HolidayType,
): string {
    if (rate.trim() === '') {
        return '';
    }

    const parsedRate = Number(rate);

    if (!Number.isFinite(parsedRate)) {
        return '';
    }

    return (parsedRate / getHolidayMultiplier(holidayType)).toFixed(2);
}

export function buildMonthDays(
    year: number,
    month: number,
    schedule: EmployeeScheduleDay[],
): MonthDay[] {
    const scheduleByDay = new Map(
        schedule.map((scheduleDay) => [
            scheduleDay.day,
            {
                defaultTimeIn: normalizeTimeValue(scheduleDay.startTime),
                defaultTimeOut: normalizeTimeValue(scheduleDay.endTime),
                graceMinutes: Number.isFinite(scheduleDay.graceMinutes)
                    ? Math.max(0, scheduleDay.graceMinutes)
                    : 0,
            },
        ]),
    );

    if (scheduleByDay.size === 0) {
        return [];
    }

    const totalDays = new Date(year, month, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => {
        const day = index + 1;
        const date = new Date(year, month - 1, day);
        const daySchedule = scheduleByDay.get(date.getDay());

        if (!daySchedule) {
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
            defaultTimeIn: daySchedule.defaultTimeIn,
            defaultTimeOut: daySchedule.defaultTimeOut,
            graceMinutes: daySchedule.graceMinutes,
        };
    }).filter((day): day is MonthDay => day !== null);
}

export const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calculate',
        href: calculateIndex(),
    },
];
