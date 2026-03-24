import EmployeesPageContent from './components/employees-page-content';
import type { EmployeesPageProps } from './helpers/employees-page';

export default function Employees(props: EmployeesPageProps) {
    return <EmployeesPageContent {...props} />;
}