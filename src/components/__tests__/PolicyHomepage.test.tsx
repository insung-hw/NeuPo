/**
 * @vitest-environment jsdom
 */
import '@/test/setup';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { fallbackPolicyCatalog } from '@/data/policies';
import HomePage from '@/pages/index';

const description =
  'NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.';

function renderHome() {
  const router = createMemoryRouter([
    { path: '/', element: <HomePage />, loader: () => fallbackPolicyCatalog },
  ]);
  return render(
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>,
  );
}

describe('renewable policy homepage', () => {
  it('uses the approved product description and derived real coverage', async () => {
    renderHome();

    expect(await screen.findByText(description)).toBeInTheDocument();
    expect(screen.getByText('Tax & Incentives')).toBeInTheDocument();
    expect(screen.getByText('5 Policy Areas')).toBeInTheDocument();
    expect(screen.getByText('8 Policies')).toBeInTheDocument();
  });

  it('replaces Framework and Live Data with policy-native content', async () => {
    renderHome();

    expect(await screen.findByText('Policy Coverage')).toBeInTheDocument();
    expect(screen.getByText('Status Framework')).toBeInTheDocument();
    expect(screen.getByText('Official Evidence')).toBeInTheDocument();
    expect(screen.getByText(/statutes, rules, agency documents, and court records/i)).toBeInTheDocument();
    expect(screen.queryByText(/Four Pillars/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Live Project Progress/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Social, Political, Economic/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/USASpending|BEA|DoD/i)).not.toBeInTheDocument();
  });

  it('presents legal, implementation, and litigation separately', async () => {
    renderHome();

    await screen.findByText('Status Framework');
    expect(screen.getByRole('heading', { name: 'Legal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Implementation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Litigation' })).toBeInTheDocument();
    expect(document.querySelector('#methodology')).not.toBeNull();
  });
});
