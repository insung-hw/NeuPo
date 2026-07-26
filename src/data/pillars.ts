import { Users, Landmark, TrendingUp, Zap, type LucideIcon } from 'lucide-react';
import contentJson from './pillars.content.json';
// Type-only: erased at compile time, so this does not create a runtime import
// cycle with energy.ts (which imports the Project/PillarContent types back).
import type { PolicyEvidence } from './energy';

/**
 * Data model
 * ----------
 * The *content* of each pillar (title, agency, status, budget, source link, …)
 * lives in `pillars.content.json` and — once configured — in Supabase.
 * That JSON is the single source of truth for the local fallback AND for the
 * database seed (`supabase/seed.sql` is generated from it). To swap in better
 * data later you only touch the JSON (then re-seed) or edit rows directly in
 * the Supabase table editor — no component code changes required.
 *
 * The *presentation* of each pillar (icon component, accent color) is NOT data;
 * it stays in code, in `pillarMeta` below, keyed by slug. This keeps the data
 * layer fully serializable so it can travel over the API and through SSR.
 */

export type ProjectStatus = 'On Track' | 'Delayed' | 'Completed' | 'At Risk';
export type ProjectCategory = 'Objectives' | 'Policies' | 'Projects';

export interface Project {
  id: string;
  title: string;
  agency: string;
  status: ProjectStatus;
  progress: number;
  budget: string;
  description: string;
  /** Human-readable label for the source, e.g. "HHS Strategic Plan 2022–2026". */
  source: string;
  /** Canonical URL for the source. Optional so weak links can be filled in later. */
  sourceUrl?: string;
  category: ProjectCategory;
  /**
   * Source-traced detail for cards backed by the relational policy dataset
   * (currently the energy pillar). Absent on the legacy mock pillars, whose
   * flat rows have nothing richer to carry. See `data/energy.ts`.
   */
  evidence?: PolicyEvidence;
}

/** A pillar's serializable content — the shape returned by the API / loaders. */
export interface PillarContent {
  slug: string;
  label: string;
  description: string;
  objectives: Project[];
  policies: Project[];
  projects: Project[];
}

/** Presentation-only metadata, keyed by pillar slug. Never stored in the DB. */
export interface PillarMeta {
  label: string;
  accent: string;
  icon: LucideIcon;
}

const statusColors: Record<ProjectStatus, string> = {
  'On Track': '#22c55e',
  'Completed': '#4ade80',
  'Delayed': '#f59e0b',
  'At Risk': '#ef4444',
};

export { statusColors };

export const pillarMeta: Record<string, PillarMeta> = {
  social: { label: 'Social', accent: '#ffef63', icon: Users },
  political: { label: 'Political', accent: '#ffe717', icon: Landmark },
  economic: { label: 'Economic', accent: '#fff7b0', icon: TrendingUp },
  energy: { label: 'Energy', accent: '#7ee787', icon: Zap },
};

/**
 * Local fallback content, loaded from the JSON single-source-of-truth.
 * Used whenever the database is not configured (no SUPABASE_URL / key) so the
 * site keeps rendering exactly as before until the DB is wired up.
 */
export const mockPillars: PillarContent[] = (contentJson as { pillars: PillarContent[] }).pillars;
