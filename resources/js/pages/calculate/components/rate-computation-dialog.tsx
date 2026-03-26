import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { RateComputationDetails } from '../hooks/use-calculate-attendance';

type RateComputationDialogProps = {
    open: boolean;
    computation: RateComputationDetails | null;
    onOpenChange: (open: boolean) => void;
};

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-right text-sm font-medium text-foreground">
                {value}
            </p>
        </div>
    );
}

export default function RateComputationDialog({
    open,
    computation,
    onOpenChange,
}: RateComputationDialogProps) {
    if (!computation) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Daily computation</DialogTitle>
                    <DialogDescription>
                        Breakdown for {computation.label}, {computation.weekday}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold text-foreground">
                            Hours worked
                        </p>
                        <div className="mt-4 space-y-3">
                            <DetailRow
                                label="Time in"
                                value={computation.timeIn}
                            />
                            <DetailRow
                                label="Time out"
                                value={computation.timeOut}
                            />
                            <DetailRow
                                label="Shift duration"
                                value={computation.shiftDurationLabel}
                            />
                            <DetailRow
                                label="Break deduction"
                                value={computation.breakDurationLabel}
                            />
                            <DetailRow
                                label="Hours worked"
                                value={computation.workedDurationLabel}
                            />
                        </div>
                        <div className="mt-4 rounded-lg bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
                            {computation.timeFormulaLabel}
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold text-foreground">
                            Rate computation
                        </p>
                        <div className="mt-4 space-y-3">
                            <DetailRow
                                label="Base rate"
                                value={computation.baseRateLabel}
                            />
                            <DetailRow
                                label="Scheduled time in"
                                value={computation.scheduledTimeInLabel}
                            />
                            <DetailRow
                                label="Grace period"
                                value={computation.gracePeriodLabel}
                            />
                            <DetailRow
                                label="Attendance status"
                                value={computation.attendanceStatusLabel}
                            />
                            <DetailRow
                                label="Late minutes"
                                value={computation.lateMinutesLabel}
                            />
                            <DetailRow
                                label="Late deduction"
                                value={computation.lateDeductionLabel}
                            />
                            <DetailRow
                                label="Holiday type"
                                value={computation.holidayLabel}
                            />
                            <DetailRow
                                label="Multiplier"
                                value={computation.multiplierLabel}
                            />
                            <DetailRow
                                label="Computed rate"
                                value={computation.rateLabel}
                            />
                        </div>
                        <div className="mt-4 rounded-lg bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
                            <p>{computation.holidayAdjustmentLabel}</p>
                            <p className="mt-2 font-medium text-foreground">
                                {computation.rateFormulaLabel}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
