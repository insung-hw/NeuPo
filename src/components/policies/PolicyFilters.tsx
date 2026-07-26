import { statusLabel, type PolicyCatalog, type PolicyFilters as PolicyFilterState } from '@/data/policy-domain';

export interface PolicyFiltersProps {
  catalog: PolicyCatalog;
  filters: PolicyFilterState;
  onChange: (filters: PolicyFilterState) => void;
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => statusLabel(a).localeCompare(statusLabel(b)));
}

export default function PolicyFilters({ catalog, filters, onChange }: PolicyFiltersProps) {
  const fields = [
    { key: 'legalStatus', label: 'Legal status', values: uniqueSorted(catalog.policies.map((policy) => policy.legalStatus)) },
    { key: 'implementationStatus', label: 'Implementation status', values: uniqueSorted(catalog.policies.map((policy) => policy.implementationStatus)) },
    { key: 'litigationStatus', label: 'Litigation status', values: uniqueSorted(catalog.policies.map((policy) => policy.litigationStatus)) },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#035048] bg-[#022e28] p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#f5f5f5]">
        Policy Area
        <select value={filters.areaSlug} onChange={(event) => onChange({ ...filters, areaSlug: event.target.value as PolicyFilterState['areaSlug'] })} className="rounded-md border border-[#035048] bg-[#013e37] px-3 py-2 text-[#f5f5f5]">
          <option value="all">All Policy Areas</option>
          {catalog.areas.map((area) => <option key={area.slug} value={area.slug}>{area.label}</option>)}
        </select>
      </label>
      {fields.map((field) => (
        <label key={field.key} className="flex flex-col gap-2 text-sm font-semibold text-[#f5f5f5]">
          {field.label}
          <select value={filters[field.key]} onChange={(event) => onChange({ ...filters, [field.key]: event.target.value })} className="rounded-md border border-[#035048] bg-[#013e37] px-3 py-2 text-[#f5f5f5]">
            <option value="all">All statuses</option>
            {field.values.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
          </select>
        </label>
      ))}
    </div>
  );
}
