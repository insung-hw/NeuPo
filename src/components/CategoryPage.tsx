import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ExternalLink, ShieldCheck } from 'lucide-react';
import DonutChart from './DonutChart';
import { type PillarContent, type Project, statusColors, pillarMeta } from '@/data/pillars';
import { statusLabel, type PolicyEvidence } from '@/data/energy';

const tabs = ['All', 'Objectives', 'Policies', 'Projects'] as const;
type Tab = (typeof tabs)[number];

// Fallback map of source labels → URLs, kept for content that predates the
// per-row `sourceUrl` column. A project's own `sourceUrl` always wins.
const sourceUrls: Record<string, string> = {
  'HHS Strategic Plan 2022–2026': 'https://www.hhs.gov/about/strategic-plan/index.html',
  'ED Strategic Plan FY2022–2026': 'https://www.ed.gov/about/reports/strat/plan2022-26/index.html',
  'VA Annual Performance Report 2024': 'https://www.va.gov/performance/',
  'CMS.gov / ARP Implementation': 'https://www.cms.gov/marketplace/about/arp',
  'ED.gov / Federal Register': 'https://www.ed.gov/loans/income-driven-repayment',
  'USDA FNS Annual Report 2024': 'https://www.fns.usda.gov/snap/program-data',
  'HRSA.gov / USASpending.gov': 'https://www.hrsa.gov/grants/find-funding',
  'HUD.gov / National Housing Trust Fund': 'https://www.hudexchange.info/programs/nhtf/',
  'NTIA.gov / BroadbandUSA': 'https://broadbandusa.ntia.doc.gov/resources/federal/bead',
  'HHS Head Start Annual Report 2024': 'https://eclkc.ohs.acf.hhs.gov/data-ongoing-monitoring',
  'OMB M-21-26 / SAM.gov': 'https://sam.gov',
  'CISA Election Security Program': 'https://www.cisa.gov/topics/election-security',
  'OPM DEIA Strategic Plan 2022–2026': 'https://www.opm.gov/policy-data-oversight/diversity-equity-inclusion-accessibility/',
  'WhiteHouse.gov / BIL Tracker': 'https://www.whitehouse.gov/build/',
  'DOJ OIP Annual FOIA Report 2024': 'https://www.justice.gov/oip/reports',
  'Senate LDA Filings / OpenSecrets': 'https://lda.senate.gov/system/public/',
  'USASpending.gov / DATA Act': 'https://www.usaspending.gov/',
  'Performance.gov / OMB Circular A-11': 'https://www.performance.gov/',
  'CISA.gov / SLCGP': 'https://www.cisa.gov/state-and-local-cybersecurity-grant-program',
  'BEA.gov / CEA Economic Report 2024': 'https://www.bea.gov/',
  'BLS.gov / Current Population Survey': 'https://www.bls.gov/cps/',
  'Commerce.gov / CHIPS Program Office': 'https://www.nist.gov/chips',
  'IRS.gov / DOE IRA Tracker': 'https://www.energy.gov/lpo/inflation-reduction-act',
  'CHIPS.gov / NIST': 'https://www.chips.gov/',
  'SBA.gov / Annual Report FY2024': 'https://www.sba.gov/about-sba/sba-performance/sba-annual-reports',
  'FHWA.dot.gov / NEVI Program': 'https://www.fhwa.dot.gov/environment/alternative_fuel_corridors/nevi/',
  'ARC.gov / POWER Initiative': 'https://www.arc.gov/power-initiative/',
  'Energy.gov / H2Hubs': 'https://www.energy.gov/oced/regional-clean-hydrogen-hubs-0',
  'ManufacturingUSA.com / NIST': 'https://www.manufacturingusa.com/',
};

function getSourceUrl(project: Project): string {
  return project.sourceUrl ?? sourceUrls[project.source] ?? 'https://www.usaspending.gov/';
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const color = statusColors[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

/**
 * A few research fields hold several statements joined with " | ". Rendering
 * them as one run-on paragraph buries the individual requirements, so split
 * them back into list items.
 */
function splitStatements(text: string): string[] {
  return text
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

const axisLabels: Record<string, string> = {
  legal_status: 'Legal',
  implementation_status: 'Implementation',
  litigation_status: 'Litigation',
};

/** The three status axes, shown instead of a single verdict. */
function StatusAxes({ evidence, accent }: { evidence: PolicyEvidence; accent: string }) {
  const axes = [
    ['legal_status', evidence.legalStatus],
    ['implementation_status', evidence.implementationStatus],
    ['litigation_status', evidence.litigationStatus],
  ] as const;
  return (
    <div className="grid grid-cols-3 gap-2">
      {axes.map(([axis, value]) => (
        <div
          key={axis}
          className="rounded-lg px-2.5 py-2"
          style={{ background: '#013e37', border: '1px solid #035048' }}
        >
          <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#a8c4c0' }}>
            {axisLabels[axis]}
          </div>
          <div className="text-xs font-semibold leading-tight" style={{ color: accent }}>
            {statusLabel(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Collapsed evidence panel: why the status reads the way it does, and the
 * official documents it rests on. Collapsed by default so the grid stays
 * scannable — the card is a summary, this is the audit trail.
 */
function EvidencePanel({ evidence, accent }: { evidence: PolicyEvidence; accent: string }) {
  const [open, setOpen] = useState(false);
  const controlling = evidence.documents.filter((d) => d.isControlling).length;

  return (
    <div className="border-t pt-3" style={{ borderColor: '#035048' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-xs font-medium"
        style={{ color: accent }}
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={12} />
          {evidence.documents.length} official {evidence.documents.length === 1 ? 'source' : 'sources'}
          {controlling > 0 && (
            <span style={{ color: '#a8c4c0' }}>· {controlling} controlling</span>
          )}
        </span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-semibold mb-1.5" style={{ color: '#f5f5f5' }}>
              Why this status
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: '#a8c4c0' }}>
              {evidence.statusExplanation}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-1.5" style={{ color: '#f5f5f5' }}>
              What applies now
            </h4>
            <ul className="flex flex-col gap-1">
              {splitStatements(evidence.effectiveRequirements).map((item) => (
                <li key={item} className="text-xs leading-relaxed pl-3 relative" style={{ color: '#a8c4c0' }}>
                  <span className="absolute left-0" style={{ color: accent }}>·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {evidence.inactiveOrLimitedScope && (
            <div>
              <h4 className="text-xs font-semibold mb-1.5" style={{ color: '#f5f5f5' }}>
                Limits and exclusions
              </h4>
              <ul className="flex flex-col gap-1">
                {splitStatements(evidence.inactiveOrLimitedScope).map((item) => (
                  <li key={item} className="text-xs leading-relaxed pl-3 relative" style={{ color: '#a8c4c0' }}>
                    <span className="absolute left-0" style={{ color: accent }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evidence.assessments.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-1.5" style={{ color: '#f5f5f5' }}>
                Assessments
              </h4>
              <div className="flex flex-col gap-2">
                {evidence.assessments.map((a) => (
                  <div key={`${a.type}-${a.value}`} className="text-xs leading-relaxed" style={{ color: '#a8c4c0' }}>
                    <span className="font-semibold" style={{ color: accent }}>
                      {axisLabels[a.type] ?? a.type}: {statusLabel(a.value)}
                    </span>
                    {/* Flagged explicitly: an inferred value is the analyst's
                        reading, not a direct statement in the cited document. */}
                    {a.analystInference && (
                      <span
                        className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] align-middle"
                        style={{ background: '#03504840', color: '#a8c4c0' }}
                      >
                        analyst inference
                      </span>
                    )}
                    <p className="mt-0.5">{a.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold mb-1.5" style={{ color: '#f5f5f5' }}>
              Official sources
            </h4>
            <ul className="flex flex-col gap-2">
              {evidence.documents.map((doc) => (
                <li key={doc.documentId} className="text-xs leading-relaxed">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 hover:underline"
                    style={{ color: accent }}
                  >
                    <ExternalLink size={10} className="mt-0.5 shrink-0" />
                    <span>{doc.officialIdentifier}</span>
                  </a>
                  <div style={{ color: '#a8c4c0' }}>
                    {doc.title}
                  </div>
                  <div style={{ color: '#7c9c98' }}>
                    {doc.issuingBody} · {doc.relationshipType}
                    {doc.isControlling && ' · controlling'}
                    {doc.effect !== 'effective' && ` · ${statusLabel(doc.effect)}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {evidence.nextMilestone && (
            <div>
              <h4 className="text-xs font-semibold mb-1.5" style={{ color: '#f5f5f5' }}>
                Next milestone
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: '#a8c4c0' }}>
                {evidence.nextMilestone}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, accent }: { project: Project; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      className="rounded-xl border p-6 flex flex-col gap-4"
      style={{ background: '#022e28', borderColor: '#035048' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span
            className="text-xs font-semibold uppercase tracking-wider mb-1 block"
            style={{ color: accent }}
          >
            {project.category}
          </span>
          <h3
            className="text-base font-bold leading-snug"
            style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
          >
            {project.title}
          </h3>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Agency */}
      <p className="text-xs" style={{ color: '#a8c4c0' }}>{project.agency}</p>

      {/* Description */}
      <p className="text-sm leading-relaxed" style={{ color: '#a8c4c0' }}>{project.description}</p>

      {/* Source-traced cards carry three independent status axes; the single
          badge above is only a summary of them. */}
      {project.evidence && <StatusAxes evidence={project.evidence} accent={accent} />}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span
            className="text-xs"
            style={{ color: '#a8c4c0' }}
            // The research dataset has no percent-complete field; for those
            // cards this bar is derived from the status axes, and the label
            // says so rather than implying a measured figure.
            title={project.evidence ? 'Derived from the legal, implementation, and litigation status' : undefined}
          >
            {project.evidence ? 'Status index' : 'Progress'}
          </span>
          <span className="text-xs font-semibold" style={{ color: accent }}>
            {project.progress}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#035048' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent }}
            initial={{ width: 0 }}
            whileInView={{ width: `${project.progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: 'easeOut' as const, delay: 0.1 }}
          />
        </div>
      </div>

      {/* Footer: budget + source for the flat rows, currency + confidence for
          the source-traced ones (which have no budget figure to show). */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#035048]">
        {project.evidence ? (
          <div className="text-xs" style={{ color: '#a8c4c0' }}>
            As of {project.evidence.statusAsOf} · {statusLabel(project.evidence.confidence)} confidence
          </div>
        ) : (
          <div>
            <span className="text-xs" style={{ color: '#a8c4c0' }}>Budget: </span>
            <span className="text-xs font-semibold" style={{ color: '#f5f5f5' }}>{project.budget}</span>
          </div>
        )}
        <a
          href={getSourceUrl(project)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs transition-colors hover:underline shrink-0"
          style={{ color: accent }}
        >
          <ExternalLink size={11} />
          {project.source}
        </a>
      </div>

      {project.evidence && <EvidencePanel evidence={project.evidence} accent={accent} />}
    </motion.div>
  );
}

interface CategoryPageProps {
  pillar: PillarContent;
}

export default function CategoryPage({ pillar }: CategoryPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  // Presentation (icon + accent color) is looked up from code by slug, not
  // stored in the data. Fall back to the social palette for unknown slugs.
  const meta = pillarMeta[pillar.slug] ?? pillarMeta.social;
  const Icon = meta.icon;
  const accent = meta.accent;

  const allItems: Project[] = [
    ...pillar.objectives,
    ...pillar.policies,
    ...pillar.projects,
  ];

  const filtered =
    activeTab === 'All'
      ? allItems
      : allItems.filter((p) => p.category === activeTab);

  const totalProgress = allItems.length
    ? Math.round(allItems.reduce((sum, p) => sum + p.progress, 0) / allItems.length)
    : 0;

  // A pillar backed by the research dataset states a status, not a percentage
  // of work completed — the headline and the donut label say so.
  const isSourceTraced = allItems.some((p) => p.evidence);
  const heading = isSourceTraced ? `${pillar.label} Policy Status` : `${pillar.label} Strategy`;
  const progressLabel = isSourceTraced ? 'avg status index' : 'avg progress';
  // Buckets the dataset does not populate are hidden rather than shown as
  // empty tabs and zero counters.
  const visibleTabs = tabs.filter(
    (tab) => tab === 'All' || allItems.some((p) => p.category === tab),
  );
  const visibleStats = [
    { label: 'Objectives', count: pillar.objectives.length },
    { label: 'Policies', count: pillar.policies.length },
    { label: 'Projects', count: pillar.projects.length },
  ].filter((stat) => stat.count > 0);

  return (
    <>
      <main style={{ background: '#013e37', minHeight: '100vh' }}>
        {/* Hero banner */}
        <section
          className="py-14 md:py-20 border-b border-[#035048]"
          style={{ background: '#022e28' }}
        >
          <div className="container mx-auto px-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm transition-colors mb-8"
              style={{ color: '#a8c4c0' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffef63')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a8c4c0')}
            >
              <ArrowLeft size={14} />
              Back to home
            </Link>

            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Left */}
              <div className="flex-1">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-4"
                  style={{ borderColor: `${accent}50`, background: `${accent}15`, color: accent }}
                >
                  <Icon size={12} />
                  {pillar.label} Pillar
                </div>
                <h1
                  className="text-3xl md:text-5xl font-bold mb-4"
                  style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
                >
                  {heading}
                </h1>
                <p className="text-lg max-w-xl" style={{ color: '#a8c4c0' }}>{pillar.description}</p>
              </div>

              {/* Right — summary donut */}
              <div className="flex items-center gap-6">
                <div className="relative" style={{ width: 140, height: 140 }}>
                  <DonutChart percent={totalProgress} color={accent} size={140} strokeWidth={16} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: accent, fontFamily: 'var(--font-heading)' }}
                    >
                      {totalProgress}%
                    </span>
                    <span className="text-xs" style={{ color: '#a8c4c0' }}>{progressLabel}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {visibleStats.map((stat) => (
                    <div key={stat.label}>
                      <div
                        className="text-xl font-bold"
                        style={{ color: accent, fontFamily: 'var(--font-heading)' }}
                      >
                        {stat.count}
                      </div>
                      <div className="text-xs" style={{ color: '#a8c4c0' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab filter + cards */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-10">
              {visibleTabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={
                      isActive
                        ? { background: accent, color: '#0f1a0f' }
                        : { background: '#022e28', color: '#a8c4c0', border: '1px solid #035048' }
                    }
                  >
                    {tab}
                    <span
                      className="ml-2 text-xs opacity-70"
                    >
                      {tab === 'All'
                        ? allItems.length
                        : allItems.filter((p) => p.category === tab).length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} accent={accent} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
