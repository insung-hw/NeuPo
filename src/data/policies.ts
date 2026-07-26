import content from './policies.content.json';
import { buildPolicyCatalog, type PolicyDataset } from './policy-domain';

export * from './policy-domain';
export const policyDataset = content as PolicyDataset;
export const fallbackPolicyCatalog = buildPolicyCatalog(policyDataset);
