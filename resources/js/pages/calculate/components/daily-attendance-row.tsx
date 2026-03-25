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
    onUpdate: (
        field: AttendanceField,
        value: AttendanceEntry[AttendanceField],
    ) => void;
};

export default function DailyAttendanceRow({
    day,
    entry,
    onUpdate,
}: DailyAttendanceRowProps) {
    const workedDuration = formatWorkedDuration(
        getWorkedMinutes(entry.timeIn, entry.timeOut),
    );

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

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`time-in-${day.key}`}>Time in</Label>
                    <Input
                        id={`time-in-${day.key}`}
                        type="time"
                        value={entry.timeIn}
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
                        value={entry.timeOut}
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
                        value={entry.holidayType}
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
                    <Input
                        id={`rate-${day.key}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={entry.rate}
                        onChange={(event) =>
                            onUpdate('rate', event.target.value)
                        }
                    />
                </div>
            </div>
        </div>
    );
}