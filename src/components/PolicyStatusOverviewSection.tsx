import { statusLabel, summarizePolicyStatuses, type PolicyCatalog } from '@/data/policy-domain';

export default function PolicyStatusOverviewSection({ catalog }: { catalog: PolicyCatalog }) {
  const summary = summarizePolicyStatuses(catalog.policies);
  const groups = [
    ['Legal', summary.legal],
    ['Implementation', summary.implementation],
    ['Litigation', summary.litigation],
  ] as const;

  return (
    <section className="bg-[#022e28] py-20 md:py-28" aria-labelledby="status-framework-title">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#ffef63]">Status Framework</p>
        <h2 id="status-framework-title" className="mt-3 text-center text-3xl font-bold text-[#f5f5f5] md:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>Three independent status axes</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-[#a8c4c0]">Legal validity, agency implementation, and litigation posture answer different questions. NeuPo reports them separately as dated findings.</p>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {groups.map(([heading, counts]) => (
            <div key={heading} className="rounded-xl border border-[#035048] bg-[#013e37] p-6">
              <h3 className="text-xl font-bold text-[#ffef63]">{heading}</h3>
              <dl className="mt-5 space-y-3">
                {Object.entries(counts).sort(([a], [b]) => statusLabel(a).localeCompare(statusLabel(b))).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between gap-3 border-b border-[#035048] pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-[#d6e4e1]">{statusLabel(status)}</dt><dd className="font-bold text-[#f5f5f5]">{count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
