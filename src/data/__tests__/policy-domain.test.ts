import { describe, expect, it } from 'vitest';
import {
  buildPolicyCatalog,
  filterPolicies,
  policyAreaForSourceValue,
  summarizePolicyStatuses,
  validatePolicyDataset,
  type PolicyDataset,
} from '../policy-domain';

const dataset: PolicyDataset = {
  meta: { title: 'Test', source: 'test.xlsx', generatedFrom: 'test', statusAsOf: '2026-07-26' },
  policies: [{
    policy_id: 'POL-001',
    policy_title: 'Clean-electricity credits',
    policy_area_slug: 'tax-incentives',
    source_policy_area: 'Federal clean-energy tax credits',
    short_summary: 'Summary',
    legal_status: 'in_force',
    implementation_status: 'guidance_issued',
    litigation_status: 'none_identified',
    status_as_of: '2026-07-26',
    status_explanation: 'Explanation',
    effective_requirements: 'Requirements',
    lead_agencies: ['IRS'],
    affected_entities: ['Developers'],
    confidence: 'medium',
    review_status: 'verified',
    sort_order: 0,
  }],
  documents: [{
    document_id: 'DOC-001',
    document_type: 'statute',
    title: 'Law',
    issuing_body: 'Congress',
    official_identifier: 'Public Law 1',
    source_tier: 1,
    document_effect: 'effective',
    link_status: 'working',
    is_legal_anchor: true,
  }],
  links: [{
    link_id: 'LNK-001',
    policy_id: 'POL-001',
    document_id: 'DOC-001',
    relationship_type: 'authority',
    relationship_summary: 'Establishes authority',
    is_controlling_source: true,
  }],
  assessments: [
    { assessment_id: 'ASM-001-L', policy_id: 'POL-001', assessment_date: '2026-07-26', assessment_type: 'legal_status', assessment_value: 'in_force', assessment_summary: 'In force', primary_document_id: 'DOC-001', supporting_document_ids: [], analyst_inference: false, confidence: 'medium', reviewer_status: 'verified' },
    { assessment_id: 'ASM-001-I', policy_id: 'POL-001', assessment_date: '2026-07-26', assessment_type: 'implementation_status', assessment_value: 'guidance_issued', assessment_summary: 'Guidance issued', primary_document_id: 'DOC-001', supporting_document_ids: [], analyst_inference: false, confidence: 'medium', reviewer_status: 'verified' },
    { assessment_id: 'ASM-001-T', policy_id: 'POL-001', assessment_date: '2026-07-26', assessment_type: 'litigation_status', assessment_value: 'none_identified', assessment_summary: 'None identified', primary_document_id: 'DOC-001', supporting_document_ids: [], analyst_inference: true, confidence: 'medium', reviewer_status: 'verified' },
  ],
};

describe('policy domain', () => {
  it('maps workbook labels to canonical areas', () => {
    expect(policyAreaForSourceValue('Federal clean-energy tax credits')).toBe('tax-incentives');
    expect(() => policyAreaForSourceValue('unmapped value')).toThrow(/Unknown policy area/);
  });

  it('validates and assembles a policy-native catalog', () => {
    expect(() => validatePolicyDataset(dataset)).not.toThrow();
    const catalog = buildPolicyCatalog(dataset);
    expect(catalog.policies[0].area.slug).toBe('tax-incentives');
    expect(catalog.policies[0].documents[0].officialIdentifier).toBe('Public Law 1');
  });

  it('rejects a missing status axis', () => {
    const invalid = { ...dataset, assessments: dataset.assessments.slice(0, 2) };
    expect(() => validatePolicyDataset(invalid)).toThrow(/litigation_status/);
  });

  it('rejects an unknown workbook policy-area classification', () => {
    const invalid = {
      ...dataset,
      policies: [{ ...dataset.policies[0], source_policy_area: 'unmapped value' }],
    };
    expect(() => validatePolicyDataset(invalid)).toThrow(/Unknown policy area/);
  });

  it('rejects a workbook classification paired with the wrong canonical area', () => {
    const invalid = {
      ...dataset,
      policies: [{ ...dataset.policies[0], source_policy_area: 'permitting' }],
    };
    expect(() => validatePolicyDataset(invalid)).toThrow(/does not match source policy area/);
  });

  it('filters and summarizes raw status values', () => {
    const records = buildPolicyCatalog(dataset).policies;
    expect(filterPolicies(records, { areaSlug: 'tax-incentives', legalStatus: 'all', implementationStatus: 'all', litigationStatus: 'all' })).toHaveLength(1);
    expect(summarizePolicyStatuses(records).legal.in_force).toBe(1);
  });
});
