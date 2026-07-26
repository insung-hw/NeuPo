import { Helmet } from '@dr.pogodin/react-helmet';
import { useLoaderData } from 'react-router-dom';
import CategoryPage from '@/components/CategoryPage';
import type { PillarContent } from '@/data/pillars';

export default function SocialPage() {
  const pillar = useLoaderData() as PillarContent;
  return (
    <>
      <Helmet>
        <title>Social Strategy — NeuPo</title>
        <meta name="description" content="Tracking education, healthcare, housing, and community development programs across the nation with real US government data." />
        <link rel="canonical" href="https://neupo.app/social" />
      </Helmet>
      <h1 className="sr-only">Social Strategy — NeuPo</h1>
      <CategoryPage pillar={pillar} />
    </>
  );
}
