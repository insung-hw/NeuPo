import { useState } from 'react';
import { ChevronDown, ExternalLink, ShieldCheck } from 'lucide-react';
import { splitStatements, statusLabel, type PolicyRecord } from '@/data/policy-domain';

export interface PolicyEvidencePanelProps {
  policy: PolicyRecord;
}

function DocumentTitle({ document }: { document: PolicyRecord['documents'][number] }) {
  const content = (
    <>
      {document.url && <ExternalLink aria-hidden="true" size={12} className="mt-0.5 shrink-0" />}
      <span>{document.officialIdentifier || document.title}</span>
    </>
  );

  return document.url ? (
    <a href={document.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 text-[#ffef63] hover:underline">
      {content}
    </a>
  ) : (
    <span className="inline-flex items-start gap-1 font-semibold text-[#f5f5f5]">{content}</span>
  );
}

export default function PolicyEvidencePanel({ policy }: PolicyEvidencePanelProps) {
  const [open, setOpen] = useState(false);
  const controllingCount = policy.documents.filter((document) => document.isControlling).length;

  return (
    <div className="border-t border-[#035048] pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-[#ffef63]"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} />
          {policy.documents.length} official sources
          {controllingCount > 0 && <span className="font-normal text-[#a8c4c0]">· {controllingCount} controlling</span>}
        </span>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-5 space-y-5 text-sm text-[#a8c4c0]">
          <section>
            <h4 className="font-semibold text-[#f5f5f5]">Why this status</h4>
            <p className="mt-1 leading-relaxed">{policy.statusExplanation}</p>
          </section>

          <section>
            <h4 className="font-semibold text-[#f5f5f5]">What applies now</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {splitStatements(policy.effectiveRequirements).map((statement) => <li key={statement}>{statement}</li>)}
            </ul>
          </section>

          {policy.inactiveOrLimitedScope && (
            <section>
              <h4 className="font-semibold text-[#f5f5f5]">Limits and exclusions</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {splitStatements(policy.inactiveOrLimitedScope).map((statement) => <li key={statement}>{statement}</li>)}
              </ul>
            </section>
          )}

          <section>
            <h4 className="font-semibold text-[#f5f5f5]">Assessments</h4>
            <div className="mt-2 space-y-3">
              {policy.assessments.map((assessment) => (
                <div key={assessment.id} className="rounded-lg bg-[#013e37] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-[#ffef63]">{statusLabel(assessment.type)}: {statusLabel(assessment.value)}</strong>
                    {assessment.analystInference && <span className="rounded bg-[#035048] px-2 py-0.5 text-xs">analyst inference</span>}
                  </div>
                  <p className="mt-1 leading-relaxed">{assessment.summary}</p>
                  <p className="mt-2 text-xs">Assessment date: {assessment.assessmentDate} · Confidence: {statusLabel(assessment.confidence)} · Review: {statusLabel(assessment.reviewerStatus)}</p>
                  {assessment.citationLocator && <p className="mt-1 text-xs">Citation: {assessment.citationLocator}</p>}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-[#f5f5f5]">Official sources</h4>
            <ul className="mt-2 space-y-3">
              {policy.documents.map((document) => (
                <li key={document.documentId} className="rounded-lg border border-[#035048] p-3">
                  <DocumentTitle document={document} />
                  <p className="mt-1 text-[#d6e4e1]">{document.title}</p>
                  <p className="mt-1 text-xs">{document.issuingBody} · {statusLabel(document.relationshipType)}{document.isControlling ? ' · controlling source' : ''}</p>
                  <p className="mt-1 text-xs">Source tier {document.sourceTier} · Link status: {statusLabel(document.linkStatus)}</p>
                  {document.citationLocator && <p className="mt-1 text-xs">Citation: {document.citationLocator}</p>}
                  {document.propositionSupported && <p className="mt-1 text-xs">Supports: {document.propositionSupported}</p>}
                  {document.linkCheckedAt && <p className="mt-1 text-xs">Link checked: {document.linkCheckedAt}</p>}
                </li>
              ))}
            </ul>
          </section>

          {policy.nextMilestone && (
            <section>
              <h4 className="font-semibold text-[#f5f5f5]">Next milestone</h4>
              <p className="mt-1">{policy.nextMilestone}</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
