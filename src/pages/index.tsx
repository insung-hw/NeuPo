import { Helmet } from '@dr.pogodin/react-helmet';
import HeroSection from '@/components/HeroSection';
import PillarsSection from '@/components/PillarsSection';
import ProjectProgressSection from '@/components/ProjectProgressSection';
import MissionSection from '@/components/MissionSection';
import PolicySection from '@/components/PolicySection';

const site = 'https://neupo.app';
const title = 'NeuPo — National Strategy. Transparent Progress.';
const description =
  'NeuPo tracks Social, Political, Economic, and Military objectives with real US government data. Transparent civic intelligence for every citizen.';
const ogImage = `${site}/og-image.png`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      name: 'NeuPo',
      url: `${site}/`,
    },
    {
      '@type': 'Organization',
      '@id': `${site}/#organization`,
      name: 'NeuPo',
      url: `${site}/`,
      description,
    },
    {
      '@type': 'WebPage',
      '@id': `${site}/#webpage`,
      url: `${site}/`,
      name: title,
      isPartOf: { '@id': `${site}/#website` },
      about: { '@id': `${site}/#organization` },
      datePublished: '2025-01-01',
      dateModified: '2026-07-25',
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={site} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={site} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main>
        {/* Visually hidden h1 for SEO — visible h1 is rendered inside HeroSection */}
        <h1 className="sr-only">National Strategy. Transparent Progress. — NeuPo</h1>
        <HeroSection />
        <PillarsSection />
        <ProjectProgressSection />
        <MissionSection />
        <PolicySection />
      </main>
    </>
  );
}
