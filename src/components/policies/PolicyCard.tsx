import { statusLabel, type PolicyRecord } from '@/data/policy-domain';
import PolicyEvidencePanel from './PolicyEvidencePanel';
import PolicyStatusAxes from './PolicyStatusAxes';

export interface PolicyCardProps {
  policy: PolicyRecord;
}

export default function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-[#035048] bg-[#022e28] p-5 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#ffef63]">{policy.area.label}</p>
        <h2 className="mt-2 text-xl font-bold leading-snug text-[#f5f5f5]" style={{ fontFamily: 'var(--font-heading)' }}>{policy.title}</h2>
        <p className="mt-2 text-xs text-[#a8c4c0]">{policy.leadAgencies.join(' · ')}</p>
      </div>
      <p className="leading-relaxed text-[#c5d5d2]">{policy.shortSummary}</p>
      <PolicyStatusAxes policy={policy} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#a8c4c0]">
        <span>As of {policy.statusAsOf}</span>
        <span>Confidence: {statusLabel(policy.confidence)}</span>
        <span>Review: {statusLabel(policy.reviewStatus)}</span>
      </div>
      <PolicyEvidencePanel policy={policy} />
    </article>
  );
}
