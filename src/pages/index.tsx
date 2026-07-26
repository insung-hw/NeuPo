import { Helmet } from '@dr.pogodin/react-helmet';
import { useLoaderData } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import MethodologySection from '@/components/MethodologySection';
import PolicyCoverageSection from '@/components/PolicyCoverageSection';
import PolicyStatusOverviewSection from '@/components/PolicyStatusOverviewSection';
import type { PolicyCatalog } from '@/data/policy-domain';

const site = 'https://neupo.app';
const title = 'NeuPo — U.S. Renewable Energy Policy Tracker';
const description = 'NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.';
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${site}/#website`, name: 'NeuPo', url: `${site}/`, description },
    { '@type': 'Organization', '@id': `${site}/#organization`, name: 'NeuPo', url: `${site}/`, description },
    { '@type': 'WebPage', '@id': `${site}/#webpage`, url: `${site}/`, name: title, description, isPartOf: { '@id': `${site}/#website` }, about: { '@id': `${site}/#organization` }, datePublished: '2025-01-01', dateModified: '2026-07-26' },
  ],
};

export default function HomePage() {
  const catalog = useLoaderData() as PolicyCatalog;
  return (
    <>
      <Helmet>
        <title>{title}</title><meta name="description" content={description} /><link rel="canonical" href={`${site}/`} />
        <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={`${site}/`} /><meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <main><HeroSection /><PolicyCoverageSection catalog={catalog} /><PolicyStatusOverviewSection catalog={catalog} /><MethodologySection /></main>
    </>
  );
}
