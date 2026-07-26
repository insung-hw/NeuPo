import energyJson from './energy.content.json';
import type { PillarContent, Project, ProjectStatus } from './pillars';

/**
 * Energy policy data model
 * ------------------------
 * Unlike the three legacy pillars — whose content is a flat list of
 * objective/policy/project rows — the energy pillar is backed by a small
 * relational research dataset: policies, the official documents that support
 * them, the links between the two, and dated status assessments.
 *
 * `energy.content.json` is the serializable single source of truth (generated
 * from the research workbook by `supabase/xlsx-to-energy-json.py`, and the
 * origin of `supabase/seed.energy.sql`). Field names stay snake_case here so
 * the JSON, the Supabase columns, and the workbook all read the same.
 *
 * The site currently renders this dataset through the shared `CategoryPage`
 * UI, so `toPillarContent()` below adapts each policy into the existing
 * `Project` shape. Everything the flat shape cannot express is carried along
 * in `Project.evidence`, which keeps the richer model intact for when the site
 * moves to a policy-native UI.
 */

export type LegalStatus = 'in_force' | 'partially_vacated' | string;
export type ImplementationStatus =
  | 'guidance_issued'
  | 'implementing'
  | 'phased_implementation'
  | 'delayed'
  | string;
export type LitigationStatus = 'none_identified' | 'pending' | 'decided' | string;
export type Confidence = 'high' | 'medium' | 'low' | 'needs_review' | string;

export interface EnergyPolicy {
  policy_id: string;
  policy_title: string;
  policy_area: string;
  short_summary: string;
  legal_status: LegalStatus;
  implementation_status: ImplementationStatus;
  litigation_status: LitigationStatus;
  /** ISO date the three status axes were assessed. */
  status_as_of: string;
  status_explanation: string;
  effective_requirements: string;
  inactive_or_limited_scope?: string;
  lead_agencies: string[];
  affected_entities: string[];
  next_milestone?: string;
  confidence: Confidence;
  review_status: string;
}

export interface EnergyDocument {
  document_id: string;
  document_type: string;
  title: string;
  issuing_body: string;
  publication_date?: string;
  effective_date?: string;
  /** Citation such as "T.D. 10024; 90 FR 4006". */
  official_identifier: string;
  official_page_url?: string;
  official_text_url?: string;
  citation_locator?: string;
  proposition_supported?: string;
  /** 1 = enacted law / final rule / court record … 4 = non-government commentary. */
  source_tier: number;
  document_effect: string;
  link_checked_at?: string;
  link_status: string;
  is_legal_anchor: boolean;
  notes?: string;
}

export interface EnergyPolicyDocumentLink {
  link_id: string;
  policy_id: string;
  document_id: string;
  relationship_type: string;
  relationship_summary: string;
  scope_affected?: string;
  valid_from?: string;
  valid_to?: string;
  is_controlling_source: boolean;
}

export interface EnergyStatusAssessment {
  assessment_id: string;
  policy_id: string;
  assessment_date: string;
  assessment_type: 'legal_status' | 'implementation_status' | 'litigation_status' | string;
  assessment_value: string;
  assessment_summary: string;
  primary_document_id?: string;
  supporting_document_ids?: string[];
  citation_locator?: string;
  analyst_inference: boolean;
  confidence: Confidence;
  reviewer_status: string;
}

export interface EnergyDataset {
  meta: { title: string; source: string; generatedFrom: string; statusAsOf: string | null };
  policies: EnergyPolicy[];
  documents: EnergyDocument[];
  links: EnergyPolicyDocumentLink[];
  assessments: EnergyStatusAssessment[];
}

/** Bundled dataset — the fallback used whenever the database is unavailable. */
export const energyDataset = energyJson as unknown as EnergyDataset;

export const ENERGY_PILLAR_SLUG = 'energy';

// ---------------------------------------------------------------------------
// Status vocabulary
// ---------------------------------------------------------------------------

/** Human labels for the raw snake_case status values used by the research data. */
export const statusLabels: Record<string, string> = {
  in_force: 'In force',
  partially_vacated: 'Partially vacated',
  guidance_issued: 'Guidance issued',
  implementing: 'Implementing',
  phased_implementation: 'Phased implementation',
  delayed: 'Delayed',
  none_identified: 'None identified',
  pending: 'Pending',
  decided: 'Decided',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  needs_review: 'Needs review',
};

export function statusLabel(value: string): string {
  return statusLabels[value] ?? value.replace(/_/g, ' ');
}

/**
 * Maps the implementation axis onto the site-wide badge vocabulary so energy
 * cards read the same as every other card. Litigation overrides it: a policy
 * that is partially vacated or under a pending challenge is "At Risk"
 * regardless of how far its implementation has progressed.
 */
export function deriveProjectStatus(policy: EnergyPolicy): ProjectStatus {
  if (policy.legal_status === 'partially_vacated') return 'At Risk';
  if (policy.litigation_status === 'pending') return 'At Risk';
  switch (policy.implementation_status) {
    case 'delayed':
      return 'Delayed';
    case 'guidance_issued':
      return 'On Track';
    case 'implementing':
    case 'phased_implementation':
      return 'On Track';
    default:
      return 'On Track';
  }
}

/**
 * The research dataset has no percent-complete field — it tracks three
 * categorical status axes instead. These weights turn the implementation axis
 * into the progress figure the shared card UI expects, nudged down when the
 * legal footing is in doubt.
 *
 * The number is a presentation aid derived from the status axes, NOT a
 * measured completion rate; `Project.evidence` carries the real values.
 */
const implementationProgress: Record<string, number> = {
  guidance_issued: 75,
  implementing: 60,
  phased_implementation: 45,
  delayed: 20,
};

export function deriveProgress(policy: EnergyPolicy): number {
  const base = implementationProgress[policy.implementation_status] ?? 50;
  const legalPenalty = policy.legal_status === 'partially_vacated' ? 15 : 0;
  const litigationPenalty = policy.litigation_status === 'pending' ? 10 : 0;
  return Math.max(0, Math.min(100, base - legalPenalty - litigationPenalty));
}

// ---------------------------------------------------------------------------
// Adapter: relational policy records -> the flat `Project` cards the UI renders
// ---------------------------------------------------------------------------

/** A document as it is attached to a card, with its link relationship folded in. */
export interface EvidenceDocument {
  documentId: string;
  title: string;
  documentType: string;
  issuingBody: string;
  officialIdentifier: string;
  url?: string;
  relationshipType: string;
  isControlling: boolean;
  sourceTier: number;
  linkStatus: string;
  effect: string;
  /** True for a pre-window statute kept only to establish the authority. */
  isLegalAnchor: boolean;
  publicationDate?: string;
}

export interface EvidenceAssessment {
  type: string;
  value: string;
  summary: string;
  confidence: Confidence;
  analystInference: boolean;
  citationLocator?: string;
}

/** Everything the flat `Project` shape cannot express, carried per card. */
export interface PolicyEvidence {
  policyId: string;
  policyArea: string;
  legalStatus: LegalStatus;
  implementationStatus: ImplementationStatus;
  litigationStatus: LitigationStatus;
  statusAsOf: string;
  statusExplanation: string;
  effectiveRequirements: string;
  inactiveOrLimitedScope?: string;
  nextMilestone?: string;
  confidence: Confidence;
  affectedEntities: string[];
  assessments: EvidenceAssessment[];
  documents: EvidenceDocument[];
}

function buildEvidence(
  policy: EnergyPolicy,
  documents: EnergyDocument[],
  links: EnergyPolicyDocumentLink[],
  assessments: EnergyStatusAssessment[],
): PolicyEvidence {
  const byId = new Map(documents.map((d) => [d.document_id, d]));
  const policyLinks = links.filter((l) => l.policy_id === policy.policy_id);

  const evidenceDocuments: EvidenceDocument[] = policyLinks
    .flatMap((link): EvidenceDocument[] => {
      const doc = byId.get(link.document_id);
      // A link with no matching document row is skipped rather than rendered
      // as a dead entry; the workbook's validation forbids dangling refs, but
      // the database rows are editable by hand.
      if (!doc) return [];
      return [
        {
          documentId: doc.document_id,
          title: doc.title,
          documentType: doc.document_type,
          issuingBody: doc.issuing_body,
          officialIdentifier: doc.official_identifier,
          url: doc.official_page_url ?? doc.official_text_url,
          relationshipType: link.relationship_type,
          isControlling: link.is_controlling_source,
          sourceTier: doc.source_tier,
          linkStatus: doc.link_status,
          effect: doc.document_effect,
          isLegalAnchor: doc.is_legal_anchor,
          publicationDate: doc.publication_date,
        },
      ];
    })
    // Strongest evidence first, so documents[0] is the citation worth putting
    // on the card: controlling sources, then the operative documents ahead of
    // the older statute kept only as a legal anchor, then by source tier, then
    // most recent first.
    .sort(
      (a, b) =>
        Number(b.isControlling) - Number(a.isControlling) ||
        Number(a.isLegalAnchor) - Number(b.isLegalAnchor) ||
        a.sourceTier - b.sourceTier ||
        (b.publicationDate ?? '').localeCompare(a.publicationDate ?? ''),
    );

  const evidenceAssessments: EvidenceAssessment[] = assessments
    .filter((a) => a.policy_id === policy.policy_id)
    .map((a) => ({
      type: a.assessment_type,
      value: a.assessment_value,
      summary: a.assessment_summary,
      confidence: a.confidence,
      analystInference: a.analyst_inference,
      citationLocator: a.citation_locator,
    }));

  return {
    policyId: policy.policy_id,
    policyArea: policy.policy_area,
    legalStatus: policy.legal_status,
    implementationStatus: policy.implementation_status,
    litigationStatus: policy.litigation_status,
    statusAsOf: policy.status_as_of,
    statusExplanation: policy.status_explanation,
    effectiveRequirements: policy.effective_requirements,
    inactiveOrLimitedScope: policy.inactive_or_limited_scope,
    nextMilestone: policy.next_milestone,
    confidence: policy.confidence,
    affectedEntities: policy.affected_entities,
    assessments: evidenceAssessments,
    documents: evidenceDocuments,
  };
}

/** Adapts one policy (plus its documents and assessments) into a card. */
export function policyToProject(
  policy: EnergyPolicy,
  documents: EnergyDocument[],
  links: EnergyPolicyDocumentLink[],
  assessments: EnergyStatusAssessment[],
): Project {
  const evidence = buildEvidence(policy, documents, links, assessments);
  // The card's single "source" line points at the strongest controlling
  // document; the full list stays available under `evidence.documents`.
  const primary = evidence.documents[0];

  return {
    id: policy.policy_id,
    title: policy.policy_title,
    agency: policy.lead_agencies.join(' · '),
    status: deriveProjectStatus(policy),
    progress: deriveProgress(policy),
    // Budget is a legacy column with no counterpart in the research data.
    // "N/A" is honest; inventing a dollar figure would not be.
    budget: 'N/A',
    description: policy.short_summary,
    source: primary ? primary.officialIdentifier : 'Official sources',
    sourceUrl: primary?.url,
    category: 'Policies',
    evidence,
  };
}

export const ENERGY_PILLAR_LABEL = 'Energy';
export const ENERGY_PILLAR_DESCRIPTION =
  'Tracking the current legal, implementation, and litigation status of U.S. federal renewable-energy policy — each statement traced to an official source.';

/** Builds the energy pillar in the shape the pillar pages and API already use. */
export function toPillarContent(dataset: EnergyDataset = energyDataset): PillarContent {
  const { policies, documents, links, assessments } = dataset;
  return {
    slug: ENERGY_PILLAR_SLUG,
    label: ENERGY_PILLAR_LABEL,
    description: ENERGY_PILLAR_DESCRIPTION,
    // The research dataset is policy-only: it records no agency objectives and
    // no funded projects, so those two buckets stay empty rather than being
    // padded with invented rows. The tabs adapt to whatever is present.
    objectives: [],
    policies: policies.map((p) => policyToProject(p, documents, links, assessments)),
    projects: [],
  };
}
