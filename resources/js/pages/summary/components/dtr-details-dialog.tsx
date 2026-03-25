import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    formatRateAmount,
    formatWorkedDuration,
    getHolidayLabel,
} from '../../calculate/helpers/calculate-page';
import { formatConfirmedAt, type SummaryDtr } from '../helpers/summary-page';

type DtrDetailsDialogProps = {
    dtr: SummaryDtr | null;
    deletingId: number | null;
    open: boolean;
    onDelete: (dtr: SummaryDtr) => void;
    onOpenChange: (open: boolean) => void;
    onExport: (dtr: SummaryDtr) => void;
    onPrint: (dtr: SummaryDtr) => void;
    onReopen: (dtr: SummaryDtr) => void;
};

export default function DtrDetailsDialog({
    dtr,
    deletingId,
    open,
    onDelete,
    onOpenChange,
    onExport,
    onPrint,
    onReopen,
}: DtrDetailsDialogProps) {
    if (!dtr) {
        return null;
    }

    const isDeleting = deletingId === dtr.id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>DTR Details</DialogTitle>
                    <DialogDescription>
                        Review, print, export, reopen, or delete this
                        confirmed DTR.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Employee
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {dtr.employeeName}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Period</p>
                        <p className="mt-1 font-medium text-foreground">
                            {dtr.monthLabel} {dtr.year}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Confirmed
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {formatConfirmedAt(dtr.confirmedAt)}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Total hours
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {formatWorkedDuration(dtr.totalWorkedMinutes)}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Total rate
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {formatRateAmount(dtr.totalAmount)}
                        </p>
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
                                        Hours
                                    </th>
                                    <th className="px-3 py-3 font-medium">
                                        Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {dtr.entries.map((entry) => (
                                    <tr
                                        key={entry.date}
                                        className="border-b align-top last:border-b-0 odd:bg-muted/10"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">
                                                {entry.label}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {entry.weekday}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            {entry.timeIn || '--'}
                                        </td>
                                        <td className="px-3 py-3">
                                            {entry.timeOut || '--'}
                                        </td>
                                        <td className="px-3 py-3">
                                            {getHolidayLabel(entry.holidayType)}
                                        </td>
                                        <td className="px-3 py-3 font-medium">
                                            {formatWorkedDuration(
                                                entry.workedMinutes,
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            {formatRateAmount(
                                                entry.rate || '0',
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-3 md:hidden">
                    {dtr.entries.map((entry) => (
                        <div key={entry.date} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium text-foreground">
                                        {entry.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {entry.weekday}
                                    </p>
                                </div>
                                <div className="rounded-full border bg-muted/30 px-3 py-1 text-sm font-medium text-foreground">
                                    {formatWorkedDuration(entry.workedMinutes)}
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-muted-foreground">
                                        Time in
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {entry.timeIn || '--'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Time out
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {entry.timeOut || '--'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Holiday
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {getHolidayLabel(entry.holidayType)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Rate
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {formatRateAmount(entry.rate || '0')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => onDelete(dtr)}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => onExport(dtr)}
                        >
                            Export CSV
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => onPrint(dtr)}
                        >
                            Print
                        </Button>
                        <Button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => onReopen(dtr)}
                        >
                            Edit
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
