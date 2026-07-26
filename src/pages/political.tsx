import { Helmet } from '@dr.pogodin/react-helmet';
import { useLoaderData } from 'react-router-dom';
import CategoryPage from '@/components/CategoryPage';
import type { PillarContent } from '@/data/pillars';

export default function PoliticalPage() {
  const pillar = useLoaderData() as PillarContent;
  return (
    <>
      <Helmet>
        <title>Political Strategy — NeuPo</title>
        <meta name="description" content="Monitoring legislative progress, governance reforms, and democratic institution strengthening with real US government data." />
        <link rel="canonical" href="https://neupo.app/political" />
      </Helmet>
      <h1 className="sr-only">Political Strategy — NeuPo</h1>
      <CategoryPage pillar={pillar} />
    </>
  );
}
