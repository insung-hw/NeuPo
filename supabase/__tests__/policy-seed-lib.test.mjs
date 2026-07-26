import { describe, expect, it } from 'vitest';
import { renderPolicySeed } from '../policy-seed-lib.mjs';

describe('renderPolicySeed', () => {
  it('writes canonical and source policy areas and escapes apostrophes', () => {
    const sql = renderPolicySeed({
      meta: { statusAsOf: '2026-07-26' },
      policies: [{ policy_id: 'POL-001', policy_area_slug: 'tax-incentives', source_policy_area: "Agency's label", policy_title: 'Title', short_summary: 'Summary', legal_status: 'in_force', implementation_status: 'implementing', litigation_status: 'none_identified', status_as_of: '2026-07-26', status_explanation: 'Explanation', effective_requirements: 'Requirements', lead_agencies: [], affected_entities: [], confidence: 'high', review_status: 'verified', sort_order: 0 }],
      documents: [], links: [], assessments: [],
    }, [{ slug: 'tax-incentives', label: 'Tax & Incentives', description: 'Description', sort_order: 0 }]);
    expect(sql).toContain('policy_area_slug, source_policy_area');
    expect(sql).toContain("'tax-incentives'");
    expect(sql).toContain("'Agency''s label'");
  });
});
