import { describe, expect, it } from 'vitest';
import content from '../policies.content.json';
import { buildPolicyCatalog, validatePolicyDataset, type PolicyDataset } from '../policy-domain';

describe('generated policy content', () => {
  it('contains the complete verified workbook dataset', () => {
    const dataset = content as PolicyDataset;
    expect(() => validatePolicyDataset(dataset)).not.toThrow();
    const catalog = buildPolicyCatalog(dataset);
    expect(catalog.areas).toHaveLength(5);
    expect(catalog.policies).toHaveLength(8);
    expect(dataset.documents).toHaveLength(38);
    expect(dataset.links).toHaveLength(41);
    expect(dataset.assessments).toHaveLength(24);
  });
});
