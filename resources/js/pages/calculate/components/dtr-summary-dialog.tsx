import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { DtrSummary } from '../hooks/use-calculate-attendance';

type DtrSummaryDialogProps = {
    open: boolean;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    summary: DtrSummary;
};

export default function DtrSummaryDialog({
    open,
    isSubmitting,
    onOpenChange,
    onConfirm,
    summary,
}: DtrSummaryDialogProps) {
    const hasOvertime = summary.overtime.totalMinutes > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>DTR Summary</DialogTitle>
                    <DialogDescription>
                        Review the daily entries and overtime computation below
                        before confirming this DTR.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Employee
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {summary.employeeName}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Period</p>
                        <p className="mt-1 font-medium text-foreground">
                            {summary.periodLabel}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Workdays
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {summary.totalDays}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Total hours
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {summary.totalWorkedDuration}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Regular pay
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {summary.regularAmountLabel}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Total pay
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                            {summary.totalAmountLabel}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/10 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="font-medium text-foreground">
                                Overtime computation
                            </p>
                        </div>
                    </div>

                    {hasOvertime ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            <div className="rounded-lg border bg-background p-4">
                                <p className="text-sm text-muted-foreground">
                                    Overtime hours
                                </p>
                                <p className="mt-1 font-medium text-foreground">
                                    {summary.overtime.totalHoursLabel}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-background p-4">
                                <p className="text-sm text-muted-foreground">
                                    Hourly rate basis
                                </p>
                                <p className="mt-1 font-medium text-foreground">
                                    {summary.overtime.rateBasisLabel}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-background p-4">
                                <p className="text-sm text-muted-foreground">
                                    Base overtime
                                </p>
                                <p className="mt-1 font-medium text-foreground">
                                    {summary.overtime.baseAmountLabel}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-background p-4">
                                <p className="text-sm text-muted-foreground">
                                    {summary.overtime.premiumRateLabel} premium
                                </p>
                                <p className="mt-1 font-medium text-foreground">
                                    {summary.overtime.premiumAmountLabel}
                                </p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Overtime pay
                                </p>
                                <p className="mt-1 font-medium text-foreground">
                                    {summary.overtime.totalAmountLabel}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                            {summary.overtime.formulaLabel}
                        </div>
                    )}
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
                                {summary.entries.map((entry) => (
                                    <tr
                                        key={entry.key}
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
                                            {entry.holidayLabel}
                                        </td>
                                        <td className="px-3 py-3 font-medium">
                                            {entry.workedDuration}
                                        </td>
                                        <td className="px-3 py-3">
                                            {entry.rateLabel}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-3 md:hidden">
                    {summary.entries.map((entry) => (
                        <div key={entry.key} className="rounded-lg border p-4">
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
                                    {entry.workedDuration}
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
                                        {entry.holidayLabel}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">
                                        Rate
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {entry.rateLabel}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="gap-2 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Back to editing
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Confirm DTR'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
