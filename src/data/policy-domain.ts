import definitionsJson from './policy-areas.content.json';

export const POLICY_AREA_SLUGS = [
  'tax-incentives',
  'grid-transmission',
  'permitting-siting',
  'trade-supply-chain',
  'offshore-wind',
] as const;

export type PolicyAreaSlug = (typeof POLICY_AREA_SLUGS)[number];

export interface PolicyArea {
  slug: PolicyAreaSlug;
  label: string;
  description: string;
  sort_order: number;
}

export interface PolicyRow {
  policy_id: string;
  policy_title: string;
  policy_area_slug: PolicyAreaSlug | string;
  source_policy_area: string;
  short_summary: string;
  legal_status: string;
  implementation_status: string;
  litigation_status: string;
  status_as_of: string;
  status_explanation: string;
  effective_requirements: string;
  inactive_or_limited_scope?: string;
  lead_agencies: string[];
  affected_entities: string[];
  next_milestone?: string;
  confidence: string;
  review_status: string;
  sort_order: number;
}

export interface PolicyDocumentRow {
  document_id: string;
  document_type: string;
  title: string;
  issuing_body: string;
  publication_date?: string;
  effective_date?: string;
  official_identifier: string;
  official_page_url?: string;
  official_text_url?: string;
  citation_locator?: string;
  proposition_supported?: string;
  source_tier: number;
  document_effect: string;
  link_checked_at?: string;
  link_status: string;
  is_legal_anchor: boolean;
  notes?: string;
}

export interface PolicyDocumentLinkRow {
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

export interface PolicyAssessmentRow {
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
  confidence: string;
  reviewer_status: string;
}

export interface PolicyDataset {
  meta: { title: string; source: string; generatedFrom: string; statusAsOf: string | null };
  policies: PolicyRow[];
  documents: PolicyDocumentRow[];
  links: PolicyDocumentLinkRow[];
  assessments: PolicyAssessmentRow[];
}

export interface EvidenceDocument {
  documentId: string;
  title: string;
  documentType: string;
  issuingBody: string;
  officialIdentifier: string;
  url?: string;
  relationshipType: string;
  relationshipSummary: string;
  scopeAffected?: string;
  validFrom?: string;
  validTo?: string;
  isControlling: boolean;
  sourceTier: number;
  linkStatus: string;
  effect: string;
  isLegalAnchor: boolean;
  publicationDate?: string;
  effectiveDate?: string;
  citationLocator?: string;
  propositionSupported?: string;
  linkCheckedAt?: string;
  notes?: string;
}

export interface EvidenceAssessment {
  id: string;
  type: string;
  value: string;
  summary: string;
  assessmentDate: string;
  primaryDocumentId?: string;
  supportingDocumentIds: string[];
  confidence: string;
  analystInference: boolean;
  citationLocator?: string;
  reviewerStatus: string;
}

export interface PolicyRecord {
  id: string;
  title: string;
  area: PolicyArea;
  sourcePolicyArea: string;
  shortSummary: string;
  legalStatus: string;
  implementationStatus: string;
  litigationStatus: string;
  statusAsOf: string;
  statusExplanation: string;
  effectiveRequirements: string;
  inactiveOrLimitedScope?: string;
  leadAgencies: string[];
  affectedEntities: string[];
  nextMilestone?: string;
  confidence: string;
  reviewStatus: string;
  assessments: EvidenceAssessment[];
  documents: EvidenceDocument[];
}

export interface PolicyCatalog {
  meta: PolicyDataset['meta'];
  areas: PolicyArea[];
  policies: PolicyRecord[];
}

export interface PolicyFilters {
  areaSlug: PolicyAreaSlug | 'all';
  legalStatus: string | 'all';
  implementationStatus: string | 'all';
  litigationStatus: string | 'all';
}

interface PolicyAreaDefinition extends PolicyArea {
  source_values: string[];
}

const definitions = definitionsJson.areas as PolicyAreaDefinition[];
export const policyAreas: PolicyArea[] = definitions
  .map(({ source_values: _sourceValues, ...area }) => area)
  .sort((a, b) => a.sort_order - b.sort_order);

const policyAreaBySlug = new Map(policyAreas.map((area) => [area.slug, area]));
const sourceValueToSlug = new Map<string, PolicyAreaSlug>();
for (const definition of definitions) {
  for (const sourceValue of definition.source_values) {
    if (sourceValueToSlug.has(sourceValue)) {
      throw new Error(`Duplicate source policy area mapping: ${sourceValue}`);
    }
    sourceValueToSlug.set(sourceValue, definition.slug);
  }
}

function uniqueIds<T extends Record<K, string>, K extends keyof T>(rows: T[], key: K): Set<string> {
  const ids = new Set<string>();
  for (const row of rows) {
    const id = row[key];
    if (ids.has(id)) throw new Error(`Duplicate ${String(key)}: ${id}`);
    ids.add(id);
  }
  return ids;
}

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

export function splitStatements(text: string | undefined): string[] {
  return text?.split('|').map((statement) => statement.trim()).filter(Boolean) ?? [];
}

export function policyAreaForSourceValue(value: string): PolicyAreaSlug {
  const slug = sourceValueToSlug.get(value);
  if (!slug) throw new Error(`Unknown policy area: ${value}`);
  return slug;
}

export function validatePolicyDataset(dataset: PolicyDataset): void {
  const policyIds = uniqueIds(dataset.policies, 'policy_id');
  const documentIds = uniqueIds(dataset.documents, 'document_id');
  uniqueIds(dataset.links, 'link_id');
  uniqueIds(dataset.assessments, 'assessment_id');

  for (const policy of dataset.policies) {
    if (!policyAreaBySlug.has(policy.policy_area_slug as PolicyAreaSlug)) {
      throw new Error(`Unknown policy area slug for ${policy.policy_id}: ${policy.policy_area_slug}`);
    }
    const types = new Set(dataset.assessments.filter((row) => row.policy_id === policy.policy_id).map((row) => row.assessment_type));
    for (const required of ['legal_status', 'implementation_status', 'litigation_status']) {
      if (!types.has(required)) throw new Error(`${policy.policy_id} is missing ${required}`);
    }
  }

  for (const link of dataset.links) {
    if (!policyIds.has(link.policy_id)) throw new Error(`${link.link_id} references unknown policy ${link.policy_id}`);
    if (!documentIds.has(link.document_id)) throw new Error(`${link.link_id} references unknown document ${link.document_id}`);
  }

  for (const assessment of dataset.assessments) {
    if (!policyIds.has(assessment.policy_id)) throw new Error(`${assessment.assessment_id} references unknown policy ${assessment.policy_id}`);
    const referenced = [assessment.primary_document_id, ...(assessment.supporting_document_ids ?? [])].filter(Boolean) as string[];
    for (const id of referenced) {
      if (!documentIds.has(id)) throw new Error(`${assessment.assessment_id} references unknown document ${id}`);
    }
  }
}

function evidenceDocumentsForPolicy(
  policyId: string,
  documentsById: Map<string, PolicyDocumentRow>,
  links: PolicyDocumentLinkRow[],
): EvidenceDocument[] {
  return links
    .filter((link) => link.policy_id === policyId)
    .flatMap((link): EvidenceDocument[] => {
      const document = documentsById.get(link.document_id);
      if (!document) return [];
      return [{
        documentId: document.document_id,
        title: document.title,
        documentType: document.document_type,
        issuingBody: document.issuing_body,
        officialIdentifier: document.official_identifier,
        url: document.official_page_url ?? document.official_text_url,
        relationshipType: link.relationship_type,
        relationshipSummary: link.relationship_summary,
        scopeAffected: link.scope_affected,
        validFrom: link.valid_from,
        validTo: link.valid_to,
        isControlling: link.is_controlling_source,
        sourceTier: document.source_tier,
        linkStatus: document.link_status,
        effect: document.document_effect,
        isLegalAnchor: document.is_legal_anchor,
        publicationDate: document.publication_date,
        effectiveDate: document.effective_date,
        citationLocator: document.citation_locator,
        propositionSupported: document.proposition_supported,
        linkCheckedAt: document.link_checked_at,
        notes: document.notes,
      }];
    })
    .sort(
      (a, b) =>
        Number(b.isControlling) - Number(a.isControlling) ||
        Number(a.isLegalAnchor) - Number(b.isLegalAnchor) ||
        a.sourceTier - b.sourceTier ||
        (b.publicationDate ?? '').localeCompare(a.publicationDate ?? ''),
    );
}

function evidenceAssessmentsForPolicy(policyId: string, assessments: PolicyAssessmentRow[]): EvidenceAssessment[] {
  return assessments
    .filter((assessment) => assessment.policy_id === policyId)
    .map((assessment) => ({
      id: assessment.assessment_id,
      type: assessment.assessment_type,
      value: assessment.assessment_value,
      summary: assessment.assessment_summary,
      assessmentDate: assessment.assessment_date,
      primaryDocumentId: assessment.primary_document_id,
      supportingDocumentIds: assessment.supporting_document_ids ?? [],
      confidence: assessment.confidence,
      analystInference: assessment.analyst_inference,
      citationLocator: assessment.citation_locator,
      reviewerStatus: assessment.reviewer_status,
    }));
}

export function buildPolicyCatalog(dataset: PolicyDataset): PolicyCatalog {
  validatePolicyDataset(dataset);

  const documentsById = new Map(dataset.documents.map((document) => [document.document_id, document]));
  const policies = [...dataset.policies]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((policy): PolicyRecord => ({
      id: policy.policy_id,
      title: policy.policy_title,
      area: policyAreaBySlug.get(policy.policy_area_slug as PolicyAreaSlug)!,
      sourcePolicyArea: policy.source_policy_area,
      shortSummary: policy.short_summary,
      legalStatus: policy.legal_status,
      implementationStatus: policy.implementation_status,
      litigationStatus: policy.litigation_status,
      statusAsOf: policy.status_as_of,
      statusExplanation: policy.status_explanation,
      effectiveRequirements: policy.effective_requirements,
      inactiveOrLimitedScope: policy.inactive_or_limited_scope,
      leadAgencies: policy.lead_agencies,
      affectedEntities: policy.affected_entities,
      nextMilestone: policy.next_milestone,
      confidence: policy.confidence,
      reviewStatus: policy.review_status,
      assessments: evidenceAssessmentsForPolicy(policy.policy_id, dataset.assessments),
      documents: evidenceDocumentsForPolicy(policy.policy_id, documentsById, dataset.links),
    }));

  return { meta: dataset.meta, areas: policyAreas, policies };
}

export function filterPolicies(records: PolicyRecord[], filters: PolicyFilters): PolicyRecord[] {
  return records.filter((record) =>
    (filters.areaSlug === 'all' || record.area.slug === filters.areaSlug) &&
    (filters.legalStatus === 'all' || record.legalStatus === filters.legalStatus) &&
    (filters.implementationStatus === 'all' || record.implementationStatus === filters.implementationStatus) &&
    (filters.litigationStatus === 'all' || record.litigationStatus === filters.litigationStatus),
  );
}

export interface PolicyStatusSummary {
  legal: Record<string, number>;
  implementation: Record<string, number>;
  litigation: Record<string, number>;
}

function summarize(records: PolicyRecord[], key: keyof Pick<PolicyRecord, 'legalStatus' | 'implementationStatus' | 'litigationStatus'>): Record<string, number> {
  return records.reduce<Record<string, number>>((counts, record) => {
    const value = record[key];
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export function summarizePolicyStatuses(records: PolicyRecord[]): PolicyStatusSummary {
  return {
    legal: summarize(records, 'legalStatus'),
    implementation: summarize(records, 'implementationStatus'),
    litigation: summarize(records, 'litigationStatus'),
  };
}
