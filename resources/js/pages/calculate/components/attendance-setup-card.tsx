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
    onEmployeeChange: (value: string) => void;
};

export default function AttendanceSetupCard({
    employees,
    selectedEmployeeId,
    onEmployeeChange,
}: AttendanceSetupCardProps) {
    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>Attendance setup</CardTitle>
                <CardDescription>
                    Pick the employee and month you want to encode.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {employees.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                        Add employees first so the calculation page has
                        someone to select.
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="employee-select">Employee</Label>
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