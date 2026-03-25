import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { breadcrumbs, type CalculatePageProps } from '../helpers/calculate-page';
import { useCalculateAttendance } from '../hooks/use-calculate-attendance';
import AttendanceSetupCard from './attendance-setup-card';
import DailyAttendanceCard from './daily-attendance-card';
import DtrSummaryDialog from './dtr-summary-dialog';
import RateComputationDialog from './rate-computation-dialog';

export default function CalculatePageContent({
    successMessage = null,
    employees,
    initialSelection = null,
    isEditingFromSummary = false,
    activeDtr = null,
}: CalculatePageProps) {
    const attendance = useCalculateAttendance(
        employees,
        initialSelection,
        activeDtr,
        isEditingFromSummary,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calculate" />

            <div className="flex flex-1 flex-col gap-6 p-5 md:p-6">
                <Heading
                    title="Calculate"
                    description="Choose an employee, set the month and year, then encode daily time in, time out, holiday entries, or absences. The daily rate is computed automatically from the employee schedule, grace period, late minutes, and half-day rule."
                />

                {attendance.isEditingFromSummary ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-fit gap-2"
                        onClick={attendance.goBackToSummary}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Summary
                    </Button>
                ) : null}

                <AttendanceSetupCard
                    employees={employees}
                    selectedEmployeeId={attendance.selectedEmployeeId}
                    isEmployeeLocked={attendance.isEditingFromSummary}
                    onEmployeeChange={attendance.handleEmployeeChange}
                />

                {successMessage && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {successMessage}
                    </div>
                )}

                {employees.length > 0 && attendance.selectedEmployee ? (
                    <>
                        <DailyAttendanceCard
                            selectedMonth={attendance.selectedMonth}
                            selectedYear={attendance.selectedYear}
                            selectedMonthLabel={attendance.selectedMonthLabel}
                            yearOptions={attendance.yearOptions}
                            monthDays={attendance.monthDays}
                            paginatedDays={attendance.paginatedDays}
                            startIndex={attendance.startIndex}
                            visiblePage={attendance.visiblePage}
                            totalPages={attendance.totalPages}
                            pageNumbers={attendance.pageNumbers}
                            canSubmitDtr={attendance.canSubmitDtr}
                            onMonthChange={attendance.handleMonthChange}
                            onYearChange={attendance.handleYearChange}
                            onPageChange={attendance.goToPage}
                            onPreviousPage={attendance.goToPreviousPage}
                            onNextPage={attendance.goToNextPage}
                            onSubmit={attendance.openSummaryDialog}
                            onCheckComputation={attendance.openRateComputation}
                            getAttendanceEntry={attendance.getAttendanceEntry}
                            updateAttendanceEntry={attendance.updateAttendanceEntry}
                        />

                        <RateComputationDialog
                            open={attendance.isRateComputationDialogOpen}
                            computation={attendance.selectedRateComputation}
                            onOpenChange={
                                attendance.handleRateComputationDialogChange
                            }
                        />

                        <DtrSummaryDialog
                            open={attendance.isSummaryDialogOpen}
                            isSubmitting={attendance.isSubmittingDtr}
                            onOpenChange={attendance.handleSummaryDialogChange}
                            onConfirm={attendance.confirmDtr}
                            summary={attendance.dtrSummary}
                        />
                    </>
                ) : null}
            </div>
        </AppLayout>
    );
}
