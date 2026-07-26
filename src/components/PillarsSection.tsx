import { motion } from 'motion/react';
import { Users, Landmark, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const pillars = [
  {
    icon: Users,
    label: 'Social',
    path: '/social',
    description: 'Tracking education, healthcare, housing, and community development programs across the nation.',
    subcategories: ['Objectives', 'Policies', 'Projects'],
    accent: '#ffef63',
    bg: '#022e28',
  },
  {
    icon: Landmark,
    label: 'Political',
    path: '/political',
    description: 'Monitoring legislative progress, governance reforms, and democratic institution strengthening.',
    subcategories: ['Objectives', 'Policies', 'Projects'],
    accent: '#ffe717',
    bg: '#022e28',
  },
  {
    icon: TrendingUp,
    label: 'Economic',
    path: '/economic',
    description: 'Measuring GDP growth, employment initiatives, trade policy, and infrastructure investment outcomes.',
    subcategories: ['Objectives', 'Policies', 'Projects'],
    accent: '#fff7b0',
    bg: '#022e28',
  },
  {
    icon: Zap,
    label: 'Energy',
    path: '/energy',
    description: 'Tracking the legal, implementation, and litigation status of federal renewable-energy policy — every statement traced to an official source.',
    subcategories: ['Policies', 'Official sources'],
    accent: '#7ee787',
    bg: '#022e28',
  },
];

export default function PillarsSection() {
  return (
    <section className="py-20 md:py-28" style={{ background: '#013e37' }}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#ffef63' }}>
            Framework
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
          >
            Four Pillars of National Strategy
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: '#a8c4c0' }}>
            Every government initiative is categorized across four strategic domains, each with measurable objectives, defined policies, and tracked projects.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={pillar.path}
                  className="group block rounded-xl border p-6 transition-all duration-300 h-full"
                  style={{
                    background: pillar.bg,
                    borderColor: '#035048',
                    borderTopColor: pillar.accent,
                    borderTopWidth: '3px',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: `${pillar.accent}20` }}
                    >
                      <Icon size={22} style={{ color: pillar.accent }} />
                    </div>
                    <span
                      className="flex items-center gap-1 text-xs font-medium transition-all opacity-0 group-hover:opacity-100"
                      style={{ color: pillar.accent }}
                    >
                      View Projects <ArrowRight size={12} />
                    </span>
                  </div>

                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
                  >
                    {pillar.label}
                  </h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: '#a8c4c0' }}>
                    {pillar.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {pillar.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="px-3 py-1 rounded-full text-xs font-medium border"
                        style={{
                          color: pillar.accent,
                          borderColor: `${pillar.accent}40`,
                          background: `${pillar.accent}10`,
                        }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
