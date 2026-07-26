import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PolicyCatalog } from '@/data/policy-domain';

export default function PolicyCoverageSection({ catalog }: { catalog: PolicyCatalog }) {
  const rows = catalog.areas.map((area) => ({
    ...area,
    count: catalog.policies.filter((policy) => policy.area.slug === area.slug).length,
  }));

  return (
    <section className="bg-[#013e37] py-20 md:py-28" aria-labelledby="coverage-title">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#ffef63]">Policy Coverage</p>
        <h2 id="coverage-title" className="mt-3 text-center text-3xl font-bold text-[#f5f5f5] md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>Five federal renewable-energy Policy Areas</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#a8c4c0]">The catalog groups source-traced federal policy by subject without collapsing distinct legal questions into a single progress score.</p>
        <div className="mx-auto mt-8 flex max-w-md justify-center gap-4">
          <div className="rounded-xl border border-[#035048] bg-[#022e28] px-6 py-4 text-lg font-bold text-[#ffef63]">{catalog.areas.length} Policy Areas</div>
          <div className="rounded-xl border border-[#035048] bg-[#022e28] px-6 py-4 text-lg font-bold text-[#ffef63]">{catalog.policies.length} Policies</div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {rows.map((area) => (
            <Link key={area.slug} to={`/policies?area=${area.slug}`} className="group rounded-xl border border-[#035048] bg-[#022e28] p-5 transition-transform hover:-translate-y-1">
              <div className="flex items-start justify-between gap-2"><h3 className="font-bold text-[#f5f5f5]">{area.label}</h3><ArrowRight size={16} className="shrink-0 text-[#ffef63]" /></div>
              <p className="mt-3 text-sm leading-relaxed text-[#a8c4c0]">{area.description}</p>
              <p className="mt-4 text-sm font-semibold text-[#ffef63]">{area.count} {area.count === 1 ? 'policy' : 'policies'}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
