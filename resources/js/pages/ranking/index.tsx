import RankingPageContent from './components/ranking-page-content';
import type { RankingPageProps } from './helpers/ranking-page';

export default function Ranking(props: RankingPageProps) {
    return <RankingPageContent {...props} />;
}
