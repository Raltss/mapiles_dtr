import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dayOptions } from '../helpers/employees-page';
import type { EmployeeDialogController } from '../hooks/use-employee-dialog';

type EmployeeDialogProps = {
    dialog: EmployeeDialogController;
};

export default function EmployeeDialog({ dialog }: EmployeeDialogProps) {
    const {
        addScheduleGroup,
        computedRates,
        dayIsUsedElsewhere,
        errors,
        form,
        groupDayError,
        groupFieldError,
        handleEmployeeDialogChange,
        isEditingEmployee,
        isEmployeeDialogOpen,
        removeScheduleGroup,
        submit,
        toggleGroupDay,
        updateScheduleGroup,
    } = dialog;

    return (
        <Dialog
            open={isEmployeeDialogOpen}
            onOpenChange={handleEmployeeDialogChange}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditingEmployee ? 'Edit employee' : 'Add employee'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First name *</Label>
                            <Input
                                id="first_name"
                                value={form.data.first_name}
                                onChange={(event) =>
                                    form.setData(
                                        'first_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Juan"
                                aria-invalid={!!form.errors.first_name}
                            />
                            <InputError message={form.errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middle_name">
                                Middle name (Optional)
                            </Label>
                            <Input
                                id="middle_name"
                                value={form.data.middle_name}
                                onChange={(event) =>
                                    form.setData(
                                        'middle_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Santos"
                                aria-invalid={!!form.errors.middle_name}
                            />
                            <InputError message={form.errors.middle_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last name *</Label>
                            <Input
                                id="last_name"
                                value={form.data.last_name}
                                onChange={(event) =>
                                    form.setData(
                                        'last_name',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="Dela Cruz"
                                aria-invalid={!!form.errors.last_name}
                            />
                            <InputError message={form.errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="monthly_rate">Monthly rate *</Label>
                            <Input
                                id="monthly_rate"
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                value={form.data.monthly_rate}
                                onChange={(event) =>
                                    form.setData(
                                        'monthly_rate',
                                        event.currentTarget.value,
                                    )
                                }
                                placeholder="20800.00"
                                aria-invalid={!!form.errors.monthly_rate}
                            />
                            <InputError message={form.errors.monthly_rate} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="daily_rate_preview">Daily rate</Label>
                            <Input
                                id="daily_rate_preview"
                                type="text"
                                value={computedRates.dailyRate}
                                placeholder="Auto-calculated"
                                readOnly
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hourly_rate_preview">
                                Hourly rate
                            </Label>
                            <Input
                                id="hourly_rate_preview"
                                type="text"
                                value={computedRates.hourlyRate}
                                placeholder="Auto-calculated"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        Daily rate is monthly rate divided by 26. Hourly rate
                        is daily rate divided by 8.
                    </div>

                    <div className="space-y-4 rounded-xl border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                                <Label>Schedule blocks</Label>
                                <p className="text-sm text-muted-foreground">
                                    Select multiple days inside each block, then
                                    assign one shared schedule to those days.
                                </p>
                                <InputError message={errors.schedule_groups} />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addScheduleGroup}
                            >
                                Add schedule block
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {form.data.schedule_groups.map((group, index) => (
                                <div
                                    key={index}
                                    className="space-y-4 rounded-lg border p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-medium">
                                                Schedule block {index + 1}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Pick the days that share the same
                                                shift.
                                            </p>
                                        </div>
                                        {form.data.schedule_groups.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    removeScheduleGroup(index)
                                                }
                                            >
                                                Remove block
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid gap-3">
                                        <Label>Days</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {dayOptions.map((dayOption) => {
                                                const checked = group.days.includes(
                                                    dayOption.value,
                                                );
                                                const disabled =
                                                    !checked &&
                                                    dayIsUsedElsewhere(
                                                        index,
                                                        dayOption.value,
                                                    );

                                                return (
                                                    <label
                                                        key={dayOption.value}
                                                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${disabled ? 'opacity-50' : ''}`}
                                                    >
                                                        <Checkbox
                                                            checked={checked}
                                                            disabled={disabled}
                                                            onCheckedChange={(
                                                                isChecked,
                                                            ) =>
                                                                toggleGroupDay(
                                                                    index,
                                                                    dayOption.value,
                                                                    isChecked ===
                                                                        true,
                                                                )
                                                            }
                                                        />
                                                        <span>
                                                            {dayOption.label}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        <InputError
                                            message={groupDayError(index)}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor={`start_time_${index}`}>
                                                Start
                                            </Label>
                                            <Input
                                                id={`start_time_${index}`}
                                                type="time"
                                                value={group.start_time}
                                                onChange={(event) =>
                                                    updateScheduleGroup(
                                                        index,
                                                        'start_time',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                aria-invalid={
                                                    !!groupFieldError(
                                                        index,
                                                        'start_time',
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={groupFieldError(
                                                    index,
                                                    'start_time',
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor={`end_time_${index}`}>
                                                End
                                            </Label>
                                            <Input
                                                id={`end_time_${index}`}
                                                type="time"
                                                value={group.end_time}
                                                onChange={(event) =>
                                                    updateScheduleGroup(
                                                        index,
                                                        'end_time',
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                                aria-invalid={
                                                    !!groupFieldError(
                                                        index,
                                                        'end_time',
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={groupFieldError(
                                                    index,
                                                    'end_time',
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 border-t pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            {isEditingEmployee
                                ? 'Save changes'
                                : 'Add employee'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}