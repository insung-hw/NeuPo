import { Helmet } from '@dr.pogodin/react-helmet';
import { useLoaderData } from 'react-router-dom';
import CategoryPage from '@/components/CategoryPage';
import type { PillarContent } from '@/data/pillars';

export default function EnergyPage() {
  const pillar = useLoaderData() as PillarContent;
  return (
    <>
      <Helmet>
        <title>Energy Policy Status — NeuPo</title>
        <meta name="description" content="The current legal, implementation, and litigation status of U.S. federal renewable-energy policy — clean-electricity tax credits, solar trade remedies, FERC interconnection and transmission reform, NEPA permitting, and offshore wind — with every statement traced to an official source." />
        <link rel="canonical" href="https://neupo.app/energy" />
      </Helmet>
      <h1 className="sr-only">Energy Policy Status — NeuPo</h1>
      <CategoryPage pillar={pillar} />
    </>
  );
}
