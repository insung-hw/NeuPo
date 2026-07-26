import { Helmet } from '@dr.pogodin/react-helmet';
import { useLoaderData } from 'react-router-dom';
import PolicyExplorer from '@/components/policies/PolicyExplorer';
import type { PolicyCatalog } from '@/data/policy-domain';

const description = 'NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.';

export default function PoliciesPage() {
  const catalog = useLoaderData() as PolicyCatalog;

  return (
    <main className="min-h-screen bg-[#013e37] py-14 md:py-20">
      <Helmet>
        <title>U.S. Renewable Energy Policy Tracker — NeuPo</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="https://neupo.app/policies" />
      </Helmet>
      <div className="container mx-auto px-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#ffef63]">Source-traced catalog</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold text-[#f5f5f5] md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>U.S. Renewable Energy Policy Tracker</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#a8c4c0]">{description}</p>
        <div className="mt-10"><PolicyExplorer catalog={catalog} /></div>
      </div>
    </main>
  );
}
