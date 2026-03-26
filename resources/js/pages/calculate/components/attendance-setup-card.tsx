import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { EmployeeOption } from '../helpers/calculate-page';

type AttendanceSetupCardProps = {
    employees: EmployeeOption[];
    selectedEmployeeId: string;
    isEmployeeLocked?: boolean;
    onEmployeeChange: (value: string) => void;
};

export default function AttendanceSetupCard({
    employees,
    selectedEmployeeId,
    isEmployeeLocked = false,
    onEmployeeChange,
}: AttendanceSetupCardProps) {
    const selectedEmployee =
        employees.find(
            (employee) => employee.id.toString() === selectedEmployeeId,
        ) ?? null;

    return (
        <Card className="w-full max-w-xl">
            <CardHeader className="pb-4">
                <div className="space-y-1.5">
                    <CardTitle>Attendance setup</CardTitle>
                    <CardDescription>
                        {isEmployeeLocked
                            ? 'Editing a confirmed DTR from Summary.'
                            : 'Pick the employee and month you want to encode.'}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
                {employees.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                        Add employees first so the calculation page has someone
                        to select.
                    </div>
                ) : isEmployeeLocked ? (
                    <div className="space-y-2">
                        <Label className="text-xs tracking-wide text-muted-foreground uppercase">
                            Employee
                        </Label>
                        <div className="rounded-xl border bg-muted/20 px-4 py-4">
                            <p className="text-base font-semibold text-foreground">
                                {selectedEmployee?.fullName ??
                                    'Selected employee'}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                This DTR is locked to the employee you opened
                                from Summary.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="employee-select" className="block">
                            Employee
                        </Label>
                        <Select
                            value={selectedEmployeeId}
                            onValueChange={onEmployeeChange}
                        >
                            <SelectTrigger
                                id="employee-select"
                                className="w-full"
                            >
                                <SelectValue placeholder="Select an employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem
                                        key={employee.id}
                                        value={employee.id.toString()}
                                    >
                                        {employee.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
