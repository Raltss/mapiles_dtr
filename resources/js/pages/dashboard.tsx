import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { index as employeesIndex } from '@/routes/employees';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: employeesIndex(),
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
        </AppLayout>
    );
}
