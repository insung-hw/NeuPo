import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration } from 'react-router-dom';

import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';

interface RootLayoutProps {
  children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Website>
      <Helmet>
        <title>NeuPo — National Strategy. Transparent Progress.</title>
        <meta
          name="description"
          content="NeuPo tracks Social, Political, Economic, and Military objectives with real US government data. Transparent civic intelligence for every citizen."
        />
        <link rel="apple-touch-icon" href="/assets/other/4dae68b9cd74608f596c446728c054f0.png" />
        <link rel="icon" href="/assets/other/4dae68b9cd74608f596c446728c054f0.png" />
      </Helmet>
      <ScrollRestoration />
      <Header />
      {children}
      <Footer />
    </Website>
  );
}
