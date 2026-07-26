import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPolicySeed } from './policy-seed-lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'src', 'data');
const dataset = JSON.parse(readFileSync(join(dataDir, 'policies.content.json'), 'utf-8'));
const areaConfig = JSON.parse(readFileSync(join(dataDir, 'policy-areas.content.json'), 'utf-8'));
const outPath = join(here, 'seed.sql');

writeFileSync(outPath, renderPolicySeed(dataset, areaConfig.areas), 'utf-8');
console.log(
  `Wrote ${outPath} (${dataset.policies.length} policies, ` +
    `${dataset.documents.length} documents, ${dataset.links.length} links, ` +
    `${dataset.assessments.length} assessments)`,
);
