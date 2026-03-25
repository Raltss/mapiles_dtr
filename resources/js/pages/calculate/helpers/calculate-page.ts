import { index as calculateIndex } from '@/routes/calculate';
import type { BreadcrumbItem } from '@/types';

export type EmployeeScheduleDay = {
    day: number;
    startTime: string;
    endTime: string;
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
    activeDtr?: ActiveDtr | null;
};

export type HolidayType = 'none' | 'regularHoliday' | 'specialWorkingHoliday';

export type AttendanceField = 'timeIn' | 'timeOut' | 'rate' | 'holidayType';

export type AttendanceEntry = {
    timeIn: string;
    timeOut: string;
    baseRate: string;
    rate: string;
    holidayType: HolidayType;
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
const breakMinutesPerShift = 60;

function formatDatePart(value: number): string {
    return value.toString().padStart(2, '0');
}

function getDateKey(year: number, month: number, day: number): string {
    return `${year}-${formatDatePart(month)}-${formatDatePart(day)}`;
}

function normalizeTimeValue(value: string): string {
    return value.length >= 5 ? value.slice(0, 5) : value;
}

export function getAttendanceEntryKey(employeeId: string, dateKey: string) {
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

export function getWorkedMinutes(
    timeIn: string,
    timeOut: string,
): number | null {
    const timeInMinutes = getMinutesFromTime(timeIn);
    const timeOutMinutes = getMinutesFromTime(timeOut);

    if (timeInMinutes === null || timeOutMinutes === null) {
        return null;
    }

    const totalWorkedMinutes =
        timeOutMinutes >= timeInMinutes
            ? timeOutMinutes - timeInMinutes
            : 24 * 60 - timeInMinutes + timeOutMinutes;

    return Math.max(0, totalWorkedMinutes - breakMinutesPerShift);
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

export function getHolidayLabel(holidayType: HolidayType): string {
    return (
        holidayOptions.find((holidayOption) => holidayOption.value === holidayType)
            ?.label ?? 'None'
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
        };
    }).filter((day): day is MonthDay => day !== null);
}

export const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Calculate',
        href: calculateIndex(),
    },
];