import { index as rankingIndex } from '@/routes/ranking';
import type { BreadcrumbItem } from '@/types';
import {
    getAttendanceCalendarPeriodLabel,
    type AttendanceCalendarRange,
} from '../../calculate/helpers/calculate-page';

export type RankingEntry = {
    rank: number;
    employeeId: number;
    employeeName: string;
    punctualityScore: number;
    onTimeDays: number;
    lateDays: number;
    totalLateMinutes: number;
    evaluatedDays: number;
};

export type RankingPageProps = {
    rankings: RankingEntry[];
    yearOptions: number[];
    initialSelection: {
        month: number;
        year: number;
        calendarRange: AttendanceCalendarRange;
    };
};

export const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ranking',
        href: rankingIndex(),
    },
];

export function getRankingPeriodLabel(
    month: number,
    year: number,
    calendarRange: AttendanceCalendarRange,
): string {
    return getAttendanceCalendarPeriodLabel(year, month, calendarRange);
}

export function formatPunctualityScore(value: number): string {
    return `${value.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`;
}

export function formatLateMinutes(value: number): string {
    return `${value} minute${value === 1 ? '' : 's'}`;
}
