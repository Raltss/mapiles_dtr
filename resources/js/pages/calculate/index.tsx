import CalculatePageContent from './components/calculate-page-content';
import type { CalculatePageProps } from './helpers/calculate-page';

export default function Calculate(props: CalculatePageProps) {
    return <CalculatePageContent {...props} />;
}