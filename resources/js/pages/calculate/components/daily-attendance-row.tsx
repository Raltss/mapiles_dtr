import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    formatWorkedDuration,
    getWorkedMinutes,
    holidayOptions,
    type AttendanceEntry,
    type AttendanceField,
    type HolidayType,
    type MonthDay,
} from '../helpers/calculate-page';

type DailyAttendanceRowProps = {
    day: MonthDay;
    entry: AttendanceEntry;
    onCheckComputation: () => void;
    onUpdate: (
        field: AttendanceField,
        value: AttendanceEntry[AttendanceField],
    ) => void;
};

export default function DailyAttendanceRow({
    day,
    entry,
    onCheckComputation,
    onUpdate,
}: DailyAttendanceRowProps) {
    const workedDuration = entry.isAbsent
        ? formatWorkedDuration(0)
        : formatWorkedDuration(getWorkedMinutes(entry.timeIn, entry.timeOut));

    return (
        <div className="space-y-4 rounded-lg border p-4 md:hidden">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-medium text-foreground">{day.label}</p>
                    <p className="text-sm text-muted-foreground">
                        {day.weekday}
                    </p>
                </div>
                <div className="rounded-full border bg-muted/40 px-3 py-1 text-sm font-medium text-foreground">
                    {workedDuration}
                </div>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border bg-muted/20 px-3 py-3">
                <Checkbox
                    id={`absent-${day.key}`}
                    checked={entry.isAbsent}
                    onCheckedChange={(checked) =>
                        onUpdate('isAbsent', checked === true)
                    }
                />
                <div className="space-y-1">
                    <Label htmlFor={`absent-${day.key}`}>Mark as absent</Label>
                    <p className="text-sm text-muted-foreground">
                        Absent days automatically use 0 hours and PHP 0.00.
                    </p>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`time-in-${day.key}`}>Time in</Label>
                    <Input
                        id={`time-in-${day.key}`}
                        type="time"
                        value={entry.isAbsent ? '' : entry.timeIn}
                        disabled={entry.isAbsent}
                        onChange={(event) =>
                            onUpdate('timeIn', event.target.value)
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`time-out-${day.key}`}>Time out</Label>
                    <Input
                        id={`time-out-${day.key}`}
                        type="time"
                        value={entry.isAbsent ? '' : entry.timeOut}
                        disabled={entry.isAbsent}
                        onChange={(event) =>
                            onUpdate('timeOut', event.target.value)
                        }
                    />
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`holiday-type-${day.key}`}>
                        Holiday type
                    </Label>
                    <Select
                        value={entry.isAbsent ? 'none' : entry.holidayType}
                        disabled={entry.isAbsent}
                        onValueChange={(value) =>
                            onUpdate('holidayType', value as HolidayType)
                        }
                    >
                        <SelectTrigger
                            id={`holiday-type-${day.key}`}
                            className="w-full"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {holidayOptions.map((holidayOption) => (
                                <SelectItem
                                    key={holidayOption.value}
                                    value={holidayOption.value}
                                >
                                    {holidayOption.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`rate-${day.key}`}>Rate</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            id={`rate-${day.key}`}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={entry.isAbsent ? '0.00' : entry.rate}
                            disabled={entry.isAbsent}
                            onChange={(event) =>
                                onUpdate('rate', event.target.value)
                            }
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="sm:w-auto"
                            onClick={onCheckComputation}
                        >
                            Check computation
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
