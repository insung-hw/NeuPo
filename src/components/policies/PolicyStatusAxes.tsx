import { statusLabel, type PolicyRecord } from '@/data/policy-domain';

export interface PolicyStatusAxesProps {
  policy: PolicyRecord;
}

export default function PolicyStatusAxes({ policy }: PolicyStatusAxesProps) {
  const axes = [
    ['Legal', policy.legalStatus],
    ['Implementation', policy.implementationStatus],
    ['Litigation', policy.litigationStatus],
  ] as const;

  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {axes.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-[#035048] bg-[#013e37] px-3 py-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#a8c4c0]">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-[#ffef63]">{statusLabel(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
