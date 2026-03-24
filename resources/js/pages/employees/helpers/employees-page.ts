import { index as employeesIndex } from '@/routes/employees';
import type { BreadcrumbItem } from '@/types';

export type EmployeeScheduleGroup = {
    days: number[];
    startTime: string;
    endTime: string;
};

export type EmployeeRow = {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    fullName: string;
    monthlyRate: string;
    dailyRate: string;
    hourlyRate: string;
    schedule: {
        groups: EmployeeScheduleGroup[];
    };
};

export type EmployeesPageProps = {
    successMessage?: string | null;
    employees: EmployeeRow[];
    summary: {
        totalEmployees: number;
        averageWorkDays: number;
        averageGraceMinutes: number;
    };
};

export type ScheduleGroupForm = {
    days: number[];
    start_time: string;
    end_time: string;
};

export type EmployeeFormData = {
    first_name: string;
    middle_name: string;
    last_name: string;
    monthly_rate: string;
    schedule_groups: ScheduleGroupForm[];
};

export const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: employeesIndex(),
    },
];

export const dayOptions = [
    { value: 1, label: 'Monday', shortLabel: 'Mon' },
    { value: 2, label: 'Tuesday', shortLabel: 'Tue' },
    { value: 3, label: 'Wednesday', shortLabel: 'Wed' },
    { value: 4, label: 'Thursday', shortLabel: 'Thu' },
    { value: 5, label: 'Friday', shortLabel: 'Fri' },
    { value: 6, label: 'Saturday', shortLabel: 'Sat' },
    { value: 0, label: 'Sunday', shortLabel: 'Sun' },
];

const workDaysPerMonth = 26;
const workHoursPerDay = 8;

export function getDerivedRates(monthlyRate: string) {
    if (monthlyRate.trim() === '') {
        return {
            dailyRate: '',
            hourlyRate: '',
        };
    }

    const parsedMonthlyRate = Number(monthlyRate);

    if (!Number.isFinite(parsedMonthlyRate)) {
        return {
            dailyRate: '',
            hourlyRate: '',
        };
    }

    const dailyRate = (parsedMonthlyRate / workDaysPerMonth).toFixed(2);
    const hourlyRate = (Number(dailyRate) / workHoursPerDay).toFixed(2);

    return {
        dailyRate,
        hourlyRate,
    };
}

export const createScheduleGroup = (days: number[] = []): ScheduleGroupForm => ({
    days,
    start_time: '09:00',
    end_time: '18:00',
});

export const defaultEmployeeFormData = (): EmployeeFormData => ({
    first_name: '',
    middle_name: '',
    last_name: '',
    monthly_rate: '',
    schedule_groups: [createScheduleGroup([1, 2, 3, 4, 5])],
});

export const employeePath = (employeeId: number) => `/employees/${employeeId}`;

export const employeeToFormData = (employee: EmployeeRow): EmployeeFormData => ({
    first_name: employee.firstName,
    middle_name: employee.middleName ?? '',
    last_name: employee.lastName,
    monthly_rate: employee.monthlyRate,
    schedule_groups: employee.schedule.groups.map((group) => ({
        days: [...group.days],
        start_time: group.startTime.slice(0, 5),
        end_time: group.endTime.slice(0, 5),
    })),
});

export function formatTime(time: string) {
    const [hour, minute] = time.split(':').map(Number);

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(1970, 0, 1, hour, minute)));
}

export function labelForDay(day: number) {
    return (
        dayOptions.find((option) => option.value === day)?.shortLabel ??
        `Day ${day}`
    );
}

export function formatDaySet(days: number[]) {
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