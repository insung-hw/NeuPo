import { Helmet } from '@dr.pogodin/react-helmet';
import { useLoaderData } from 'react-router-dom';
import CategoryPage from '@/components/CategoryPage';
import type { PillarContent } from '@/data/pillars';

export default function EconomicPage() {
  const pillar = useLoaderData() as PillarContent;
  return (
    <>
      <Helmet>
        <title>Economic Strategy — NeuPo</title>
        <meta name="description" content="Measuring GDP growth, employment initiatives, trade policy, and infrastructure investment outcomes with real US government data." />
        <link rel="canonical" href="https://neupo.app/economic" />
      </Helmet>
      <h1 className="sr-only">Economic Strategy — NeuPo</h1>
      <CategoryPage pillar={pillar} />
    </>
  );
}
