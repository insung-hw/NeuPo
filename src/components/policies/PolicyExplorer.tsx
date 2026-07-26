import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterPolicies, type PolicyCatalog, type PolicyFilters } from '@/data/policy-domain';
import PolicyCard from './PolicyCard';
import PolicyFilterControls from './PolicyFilters';

export interface PolicyExplorerProps {
  catalog: PolicyCatalog;
}

export default function PolicyExplorer({ catalog }: PolicyExplorerProps) {
  const [searchParams] = useSearchParams();
  const requestedArea = searchParams.get('area');
  const initialArea = catalog.areas.some((area) => area.slug === requestedArea) ? requestedArea as PolicyFilters['areaSlug'] : 'all';
  const [filters, setFilters] = useState<PolicyFilters>({
    areaSlug: initialArea,
    legalStatus: 'all',
    implementationStatus: 'all',
    litigationStatus: 'all',
  });
  const policies = useMemo(() => filterPolicies(catalog.policies, filters), [catalog.policies, filters]);

  return (
    <div className="space-y-8">
      <PolicyFilterControls catalog={catalog} filters={filters} onChange={setFilters} />
      <p aria-live="polite" className="text-sm text-[#a8c4c0]">{policies.length} {policies.length === 1 ? 'policy' : 'policies'} shown</p>
      {policies.length === 0 ? (
        <p className="rounded-xl border border-[#035048] bg-[#022e28] p-8 text-center text-[#d6e4e1]">No policies match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {policies.map((policy) => <PolicyCard key={policy.id} policy={policy} />)}
        </div>
      )}
    </div>
  );
}
