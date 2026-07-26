import type { Request, Response } from 'express';
import { getPolicyCatalog } from '../../data/policy-repo';

export default async function handler(_req: Request, res: Response): Promise<void> {
  const catalog = await getPolicyCatalog();
  res
    .set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
    .json(catalog);
}
