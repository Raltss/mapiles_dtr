import { router } from '@inertiajs/react';
import Papa from 'papaparse';
import { useState } from 'react';
import { index as calculateIndex } from '@/routes/calculate';
import {
    formatRateAmount,
    formatWorkedDuration,
    getHolidayLabel,
} from '../../calculate/helpers/calculate-page';
import { formatConfirmedAt, type SummaryDtr } from '../helpers/summary-page';

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function downloadCsv(filename: string, csv: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
}

export function useDtrHistory(dtrs: SummaryDtr[]) {
    const [selectedDtr, setSelectedDtr] = useState<SummaryDtr | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    const overview = {
        totalDtrs: dtrs.length,
        totalWorkedDuration: formatWorkedDuration(
            dtrs.reduce((total, dtr) => total + dtr.totalWorkedMinutes, 0),
        ),
        totalAmountLabel: formatRateAmount(
            dtrs.reduce((total, dtr) => total + Number(dtr.totalAmount), 0),
        ),
    };

    const openDtr = (dtr: SummaryDtr) => {
        setSelectedDtr(dtr);
        setIsDetailsDialogOpen(true);
    };

    const handleDetailsDialogChange = (open: boolean) => {
        setIsDetailsDialogOpen(open);

        if (!open) {
            setSelectedDtr(null);
        }
    };

    const reopenDtr = (dtr: SummaryDtr) => {
        router.visit(
            calculateIndex.url({
                query: {
                    employee: dtr.employeeId,
                    month: dtr.month,
                    year: dtr.year,
                },
            }),
        );
    };

    const exportDtrAsCsv = (dtr: SummaryDtr) => {
        const rows = dtr.entries.map((entry) => ({
            Date: entry.date,
            Weekday: entry.weekday,
            'Time In': entry.timeIn || '--',
            'Time Out': entry.timeOut || '--',
            Holiday: getHolidayLabel(entry.holidayType),
            'Hours Worked': formatWorkedDuration(entry.workedMinutes),
            'Base Rate': entry.baseRate || '--',
            Rate: entry.rate || '--',
        }));

        const csv = Papa.unparse(rows);
        const filename = `dtr-${dtr.employeeName
            .toLowerCase()
            .replaceAll(
                /[^a-z0-9]+/g,
                '-',
            )}-${dtr.year}-${String(dtr.month).padStart(2, '0')}.csv`;

        downloadCsv(filename, csv);
    };

    const printDtr = (dtr: SummaryDtr) => {
        const printWindow = window.open(
            '',
            '_blank',
            'noopener,noreferrer,width=960,height=720',
        );

        if (!printWindow) {
            return;
        }

        const rows = dtr.entries
            .map(
                (entry) => `
                    <tr>
                        <td>${escapeHtml(entry.label)}</td>
                        <td>${escapeHtml(entry.weekday)}</td>
                        <td>${escapeHtml(entry.timeIn || '--')}</td>
                        <td>${escapeHtml(entry.timeOut || '--')}</td>
                        <td>${escapeHtml(getHolidayLabel(entry.holidayType))}</td>
                        <td>${escapeHtml(formatWorkedDuration(entry.workedMinutes))}</td>
                        <td>${escapeHtml(formatRateAmount(entry.rate || '0'))}</td>
                    </tr>
                `,
            )
            .join('');

        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>DTR Summary</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
                        h1 { margin: 0 0 8px; }
                        p { margin: 4px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                        th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 14px; }
                        th { background: #f3f4f6; }
                        .meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 20px; }
                        .meta-card { border: 1px solid #d1d5db; padding: 12px; border-radius: 8px; }
                        .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
                        .value { margin-top: 6px; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <h1>DTR Summary</h1>
                    <p><strong>Employee:</strong> ${escapeHtml(dtr.employeeName)}</p>
                    <p><strong>Period:</strong> ${escapeHtml(`${dtr.monthLabel} ${dtr.year}`)}</p>
                    <p><strong>Confirmed at:</strong> ${escapeHtml(formatConfirmedAt(dtr.confirmedAt))}</p>
                    <div class="meta">
                        <div class="meta-card">
                            <div class="label">Workdays</div>
                            <div class="value">${dtr.totalDays}</div>
                        </div>
                        <div class="meta-card">
                            <div class="label">Total hours</div>
                            <div class="value">${escapeHtml(formatWorkedDuration(dtr.totalWorkedMinutes))}</div>
                        </div>
                        <div class="meta-card">
                            <div class="label">Total rate</div>
                            <div class="value">${escapeHtml(formatRateAmount(dtr.totalAmount))}</div>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Day</th>
                                <th>Time in</th>
                                <th>Time out</th>
                                <th>Holiday</th>
                                <th>Hours</th>
                                <th>Rate</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return {
        exportDtrAsCsv,
        handleDetailsDialogChange,
        isDetailsDialogOpen,
        openDtr,
        overview,
        printDtr,
        reopenDtr,
        selectedDtr,
    };
}

export type DtrHistoryController = ReturnType<typeof useDtrHistory>;
