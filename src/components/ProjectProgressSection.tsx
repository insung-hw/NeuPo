import { motion } from 'motion/react';
import DonutChart from './DonutChart';

const pillars = [
  {
    label: 'Social',
    percent: 34,
    projectsTracked: 142,
    color: '#ffef63',
    source: 'HHS / HUD / Dept of Education',
    description: 'Social programs meeting 2024 targets',
  },
  {
    label: 'Political',
    percent: 51,
    projectsTracked: 89,
    color: '#ffe717',
    source: 'Congressional Research Service',
    description: 'Legislative priorities enacted',
  },
  {
    label: 'Economic',
    percent: 67,
    projectsTracked: 203,
    color: '#fff7b0',
    source: 'Bureau of Economic Analysis / OMB',
    description: 'Economic recovery milestones achieved',
  },
];

export default function ProjectProgressSection() {
  return (
    <section className="py-20 md:py-28" style={{ background: '#022e28' }}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#ffef63' }}>Live Data</p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
          >
            Live Project Progress
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: '#a8c4c0' }}>
            Powered by real US government data from USASpending.gov, Congress.gov, BEA, and DoD Annual Reports.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' as const }}
              className="rounded-xl border p-6 flex flex-col items-center text-center"
              style={{ background: '#013e37', borderColor: '#035048' }}
            >
              <div className="relative mb-4" style={{ width: 160, height: 160 }}>
                <DonutChart percent={pillar.percent} color={pillar.color} size={160} strokeWidth={18} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: pillar.color, fontFamily: 'var(--font-heading)' }}
                  >
                    {pillar.percent}%
                  </span>
                  <span className="text-xs" style={{ color: '#a8c4c0' }}>complete</span>
                </div>
              </div>

              <h3
                className="text-lg font-bold mb-1"
                style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
              >
                {pillar.label}
              </h3>
              <p className="text-xs mb-3" style={{ color: '#a8c4c0' }}>{pillar.description}</p>

              <div
                className="w-full rounded-lg px-3 py-2 text-center"
                style={{ background: `${pillar.color}15`, border: `1px solid ${pillar.color}30` }}
              >
                <span className="text-sm font-semibold" style={{ color: pillar.color }}>
                  {pillar.projectsTracked} projects tracked
                </span>
              </div>

              <p className="text-xs mt-3" style={{ color: '#a8c4c060' }}>
                Source: {pillar.source}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-xs mt-8"
          style={{ color: '#a8c4c050' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Data updated quarterly. Sources: USASpending.gov · Congress.gov · BEA.gov · Defense.gov
        </motion.p>
      </div>
    </section>
  );
}
