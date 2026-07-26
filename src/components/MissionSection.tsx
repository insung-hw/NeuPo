import { motion } from 'motion/react';
import { Eye, Target, Heart } from 'lucide-react';

const coreValues = [
  { label: 'Transparency', desc: 'Every data point is sourced, cited, and open to public scrutiny.' },
  { label: 'Accountability', desc: 'Government commitments are tracked against measurable outcomes.' },
  { label: 'Civic Empowerment', desc: 'Every citizen deserves access to the tools of national oversight.' },
  { label: 'Data Integrity', desc: 'We use only verified, authoritative government data sources.' },
  { label: 'Nonpartisanship', desc: 'Facts and progress metrics, never political opinion or bias.' },
];

export default function MissionSection() {
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
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#ffef63' }}>Who We Are</p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
          >
            Mission, Vision &amp; Core Values
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission */}
          <motion.div
            className="lg:col-span-1 rounded-xl border p-8"
            style={{ background: '#022e28', borderColor: '#035048', borderTopColor: '#ffef63', borderTopWidth: '3px' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ background: '#ffef6320' }}>
              <Target size={22} style={{ color: '#ffef63' }} />
            </div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}>
              Our Mission
            </h3>
            <p className="leading-relaxed text-base" style={{ color: '#a8c4c0' }}>
              To make national strategy transparent, measurable, and accessible to every citizen — transforming complex government data into clear, actionable insights that empower informed civic participation.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            className="rounded-xl border p-8"
            style={{ background: '#022e28', borderColor: '#035048', borderTopColor: '#ffe717', borderTopWidth: '3px' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ background: '#ffe71720' }}>
              <Eye size={22} style={{ color: '#ffe717' }} />
            </div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}>
              Our Vision
            </h3>
            <p className="leading-relaxed" style={{ color: '#a8c4c0' }}>
              A fully informed public that can track, evaluate, and engage with government progress in real time — where every citizen is equipped to hold institutions accountable and participate meaningfully in democracy.
            </p>
          </motion.div>

          {/* Core Values */}
          <motion.div
            className="rounded-xl border p-8"
            style={{ background: '#022e28', borderColor: '#035048', borderTopColor: '#fff7b0', borderTopWidth: '3px' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' as const }}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ background: '#fff7b020' }}>
              <Heart size={22} style={{ color: '#fff7b0' }} />
            </div>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}>
              Core Values
            </h3>
            <ul className="flex flex-col gap-3">
              {coreValues.map((val) => (
                <li key={val.label} className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold" style={{ color: '#ffef63' }}>{val.label}</span>
                  <span className="text-xs" style={{ color: '#a8c4c0' }}>{val.desc}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
