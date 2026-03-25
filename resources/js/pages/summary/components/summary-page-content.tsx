import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import {
    formatRateAmount,
    formatWorkedDuration,
} from '../../calculate/helpers/calculate-page';
import {
    breadcrumbs,
    formatConfirmedAt,
    type SummaryPageProps,
} from '../helpers/summary-page';
import { useDtrHistory } from '../hooks/use-dtr-history';
import DtrDetailsDialog from './dtr-details-dialog';

export default function SummaryPageContent({ dtrs }: SummaryPageProps) {
    const history = useDtrHistory(dtrs);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Summary" />

            <div className="flex flex-1 flex-col gap-6 p-5 md:p-6">
                <Heading
                    title="Summary"
                    description="Review previously confirmed DTRs, reopen them for editing, print them, or export them as CSV."
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Confirmed DTR History</CardTitle>
                        <CardDescription>
                            Open any saved DTR to review the full details and
                            export or print it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dtrs.length === 0 ? (
                            <div className="rounded-lg border border-dashed px-6 py-12 text-center">
                                <p className="text-sm font-medium">
                                    No confirmed DTRs yet
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Confirm a DTR from the Calculate page and it
                                    will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden md:block">
                                    <div className="overflow-x-auto rounded-lg border">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-muted/30 text-left text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">
                                                        Employee
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Period
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Confirmed
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Days
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Hours
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Rate
                                                    </th>
                                                    <th className="px-3 py-3 font-medium">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dtrs.map((dtr) => (
                                                    <tr
                                                        key={dtr.id}
                                                        className="border-b align-top last:border-b-0 odd:bg-muted/10"
                                                    >
                                                        <td className="px-4 py-3 font-medium text-foreground">
                                                            {dtr.employeeName}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {dtr.monthLabel}{' '}
                                                            {dtr.year}
                                                        </td>
                                                        <td className="px-3 py-3 text-muted-foreground">
                                                            {formatConfirmedAt(
                                                                dtr.confirmedAt,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {dtr.totalDays}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {formatWorkedDuration(
                                                                dtr.totalWorkedMinutes,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {formatRateAmount(
                                                                dtr.totalAmount,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        history.openDtr(
                                                                            dtr,
                                                                        )
                                                                    }
                                                                >
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        history.exportDtrAsCsv(
                                                                            dtr,
                                                                        )
                                                                    }
                                                                >
                                                                    Export CSV
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        history.reopenDtr(
                                                                            dtr,
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="space-y-3 md:hidden">
                                    {dtrs.map((dtr) => (
                                        <div
                                            key={dtr.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">
                                                    {dtr.employeeName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {dtr.monthLabel} {dtr.year}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Confirmed{' '}
                                                    {formatConfirmedAt(
                                                        dtr.confirmedAt,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Days
                                                    </p>
                                                    <p className="font-medium text-foreground">
                                                        {dtr.totalDays}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Hours
                                                    </p>
                                                    <p className="font-medium text-foreground">
                                                        {formatWorkedDuration(
                                                            dtr.totalWorkedMinutes,
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Rate
                                                    </p>
                                                    <p className="font-medium text-foreground">
                                                        {formatRateAmount(
                                                            dtr.totalAmount,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        history.openDtr(dtr)
                                                    }
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        history.exportDtrAsCsv(
                                                            dtr,
                                                        )
                                                    }
                                                >
                                                    Export CSV
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() =>
                                                        history.reopenDtr(dtr)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <DtrDetailsDialog
                    dtr={history.selectedDtr}
                    open={history.isDetailsDialogOpen}
                    onOpenChange={history.handleDetailsDialogChange}
                    onExport={history.exportDtrAsCsv}
                    onPrint={history.printDtr}
                    onReopen={history.reopenDtr}
                />
            </div>
        </AppLayout>
    );
}
