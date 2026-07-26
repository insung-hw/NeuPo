import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router-dom';
import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';

export default function RootLayout({ children }: { children: ReactElement }) {
  return (
    <Website>
      <Helmet>
        <title>NeuPo — U.S. Renewable Energy Policy Tracker</title>
        <meta name="description" content="NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources." />
        <link rel="apple-touch-icon" href="/assets/other/4dae68b9cd74608f596c446728c054f0.png" />
        <link rel="icon" href="/assets/other/4dae68b9cd74608f596c446728c054f0.png" />
      </Helmet>
      <ScrollRestoration /><Header />{children}<Footer />
    </Website>
  );
}
