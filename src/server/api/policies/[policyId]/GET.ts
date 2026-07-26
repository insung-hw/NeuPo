import type { Request, Response } from 'express';
import { getPolicyById } from '../../../data/policy-repo';

export default async function handler(req: Request<{ policyId: string }>, res: Response): Promise<void> {
  const policy = await getPolicyById(req.params.policyId);
  if (!policy) {
    res.status(404).json({ error: 'Policy not found' });
    return;
  }
  res
    .set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
    .json(policy);
}
