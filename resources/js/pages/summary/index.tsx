import SummaryPageContent from './components/summary-page-content';
import type { SummaryPageProps } from './helpers/summary-page';

export default function Summary(props: SummaryPageProps) {
    return <SummaryPageContent {...props} />;
}