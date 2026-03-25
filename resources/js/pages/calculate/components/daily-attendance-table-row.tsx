import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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

type DailyAttendanceTableRowProps = {
    day: MonthDay;
    entry: AttendanceEntry;
    onCheckComputation: () => void;
    onUpdate: (
        field: AttendanceField,
        value: AttendanceEntry[AttendanceField],
    ) => void;
};

export default function DailyAttendanceTableRow({
    day,
    entry,
    onCheckComputation,
    onUpdate,
}: DailyAttendanceTableRowProps) {
    const workedDuration = entry.isAbsent
        ? formatWorkedDuration(0)
        : formatWorkedDuration(getWorkedMinutes(entry.timeIn, entry.timeOut));

    return (
        <tr className="border-b align-middle odd:bg-muted/10 last:border-b-0">
            <td className="px-4 py-3 align-top">
                <div className="font-medium text-foreground">{day.label}</div>
                <div className="text-xs text-muted-foreground">
                    {day.weekday}
                </div>
            </td>
            <td className="px-3 py-3 align-middle">
                <Input
                    id={`desktop-time-in-${day.key}`}
                    type="time"
                    value={entry.isAbsent ? '' : entry.timeIn}
                    disabled={entry.isAbsent}
                    onChange={(event) => onUpdate('timeIn', event.target.value)}
                    className="min-w-[128px]"
                />
            </td>
            <td className="px-3 py-3 align-middle">
                <Input
                    id={`desktop-time-out-${day.key}`}
                    type="time"
                    value={entry.isAbsent ? '' : entry.timeOut}
                    disabled={entry.isAbsent}
                    onChange={(event) => onUpdate('timeOut', event.target.value)}
                    className="min-w-[128px]"
                />
            </td>
            <td className="px-3 py-3 align-middle">
                <Select
                    value={entry.isAbsent ? 'none' : entry.holidayType}
                    disabled={entry.isAbsent}
                    onValueChange={(value) =>
                        onUpdate('holidayType', value as HolidayType)
                    }
                >
                    <SelectTrigger
                        id={`desktop-holiday-type-${day.key}`}
                        className="min-w-[210px]"
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
            </td>
            <td className="px-3 py-3 align-middle">
                <label
                    htmlFor={`desktop-absent-${day.key}`}
                    className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                    <Checkbox
                        id={`desktop-absent-${day.key}`}
                        checked={entry.isAbsent}
                        onCheckedChange={(checked) =>
                            onUpdate('isAbsent', checked === true)
                        }
                    />
                    Absent
                </label>
            </td>
            <td className="px-3 py-3 align-middle">
                <div className="inline-flex h-10 min-w-[96px] items-center rounded-md border bg-muted/30 px-3 text-sm font-medium text-foreground">
                    {workedDuration}
                </div>
            </td>
            <td className="px-3 py-3 align-middle">
                <div className="flex min-w-[320px] items-center gap-2">
                    <Input
                        id={`desktop-rate-${day.key}`}
                        type="text"
                        value={entry.isAbsent ? '0.00' : entry.rate}
                        readOnly
                        className="min-w-[120px] bg-muted/40 text-right font-medium"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={onCheckComputation}
                    >
                        Check computation
                    </Button>
                </div>
            </td>
        </tr>
    );
}
