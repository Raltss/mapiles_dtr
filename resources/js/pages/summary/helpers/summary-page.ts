import { index as summaryIndex } from '@/routes/summary';
import type { BreadcrumbItem } from '@/types';
import type { HolidayType } from '../../calculate/helpers/calculate-page';

export type SummaryDtrEntry = {
    date: string;
    label: string;
    weekday: string;
    timeIn: string;
    timeOut: string;
    holidayType: HolidayType;
    workedMinutes: number;
    baseRate: string;
    rate: string;
};

export type SummaryDtr = {
    id: number;
    employeeId: number;
    employeeName: string;
    month: number;
    monthLabel: string;
    year: number;
    totalDays: number;
    totalWorkedMinutes: number;
    regularAmount: string;
    dailyRateBasis: string;
    totalOvertimeMinutes: number;
    totalOvertimeAmount: string;
    totalAmount: string;
    confirmedAt: string | null;
    entries: SummaryDtrEntry[];
};

export type SummaryPageProps = {
    successMessage?: string | null;
    dtrs: SummaryDtr[];
};

export const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Summary',
        href: summaryIndex(),
    },
];

export const dtrPath = (dtrId: number) => `/summary/${dtrId}`;

export function formatConfirmedAt(value: string | null): string {
    if (!value) {
        return '--';
    }

    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
