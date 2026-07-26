/**
 * @vitest-environment jsdom
 */
import '@/test/setup';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { fallbackPolicyCatalog } from '@/data/policies';
import PolicyExplorer from '../PolicyExplorer';

function renderExplorer(initialEntry = '/policies') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PolicyExplorer catalog={fallbackPolicyCatalog} />
    </MemoryRouter>,
  );
}

describe('PolicyExplorer', () => {
  it('filters by Policy Area and retains the three status axes', async () => {
    const user = userEvent.setup();
    renderExplorer();

    expect(screen.getAllByRole('article')).toHaveLength(8);
    await user.selectOptions(screen.getByLabelText('Policy Area'), 'grid-transmission');

    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText(/FERC Order No. 2023/)).toBeInTheDocument();
    expect(screen.getAllByText('Legal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Implementation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Litigation').length).toBeGreaterThan(0);
  });

  it('initializes a valid Policy Area from the query string', () => {
    renderExplorer('/policies?area=offshore-wind');

    expect(screen.getByLabelText('Policy Area')).toHaveValue('offshore-wind');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/Federal offshore-wind policy/)).toBeInTheDocument();
  });

  it('shows four accessible filters and a clear empty result', async () => {
    const user = userEvent.setup();
    renderExplorer();

    expect(screen.getAllByRole('combobox')).toHaveLength(4);
    await user.selectOptions(screen.getByLabelText('Policy Area'), 'offshore-wind');
    await user.selectOptions(screen.getByLabelText('Legal status'), 'in_force');

    expect(screen.getByText('No policies match these filters.')).toBeInTheDocument();
  });

  it('expands official evidence without synthesizing completion', async () => {
    const user = userEvent.setup();
    renderExplorer('/policies?area=offshore-wind');

    await user.click(screen.getByRole('button', { name: /official sources/i }));
    expect(screen.getByText('Official sources')).toBeInTheDocument();
    expect(screen.getAllByText(/analyst inference/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Confidence:/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/status index/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/% complete/i)).not.toBeInTheDocument();
  });
});
