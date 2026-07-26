import { useState } from 'react';
import { motion } from 'motion/react';
import DonutChart from './DonutChart';
import { submitSignup } from '@/lib/api-client';

const decorativeCharts = [
  { percent: 67, color: '#ffef63', size: 130, style: { top: 0, left: 0 } },
  { percent: 51, color: '#ffe717', size: 100, style: { top: 70, left: 90 } },
  { percent: 34, color: '#fff7b0', size: 80, style: { top: 25, left: 170 } },
];

export default function HeroSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await submitSignup(email, 'hero');
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background — clean brand gradient with a soft accent glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #024039 0%, #013e37 45%, #022a25 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(60% 60% at 78% 28%, rgba(255,239,99,0.10) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text + form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' as const }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-6"
              style={{ borderColor: '#ffef6350', background: '#ffef6315', color: '#ffef63' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ffef63' }} />
              Live US Government Data
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
            >
              National Strategy.{' '}
              <span style={{ color: '#ffef63' }}>Transparent Progress.</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: '#a8c4c0' }}>
              NeuPo tracks Social, Political, Economic, and Military objectives — with real US government data powering every metric.
            </p>

            {status === 'success' ? (
              <div
                className="mb-4 max-w-md rounded-md px-4 py-3 text-sm"
                style={{ background: '#ffef6315', border: '1px solid #ffef6350', color: '#ffef63' }}
              >
                You're on the list! We'll be in touch soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-2 max-w-md">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={status === 'loading'}
                  className="flex-1 px-4 py-3 rounded-md text-sm border focus:outline-none transition-colors disabled:opacity-60"
                  style={{ background: '#022e28', borderColor: '#035048', color: '#f5f5f5' }}
                  onFocus={(e) => (e.target.style.borderColor = '#ffef63')}
                  onBlur={(e) => (e.target.style.borderColor = '#035048')}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 rounded-md text-sm font-semibold whitespace-nowrap transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#ffef63', color: '#013e37' }}
                >
                  {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-xs mb-1" style={{ color: '#fca5a5' }}>{error}</p>
            )}
            <p className="text-xs" style={{ color: '#a8c4c060' }}>
              Get early access — enter your email to join the waitlist.
            </p>
            <p className="text-xs" style={{ color: '#a8c4c060' }}>
              By continuing, you agree to our{' '}
              <a href="/terms" className="hover:underline" style={{ color: '#a8c4c0' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="hover:underline" style={{ color: '#a8c4c0' }}>Privacy Policy</a>
            </p>
          </motion.div>

          {/* Right — decorative donut charts */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' as const }}
          >
            <div className="relative" style={{ width: 280, height: 280 }}>
              {decorativeCharts.map((chart, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ ...chart.style, width: chart.size, height: chart.size }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3 + i * 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut' as const,
                    delay: i * 0.6,
                  }}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{ boxShadow: `0 0 30px ${chart.color}50, 0 0 60px ${chart.color}25` }}
                  >
                    <DonutChart percent={chart.percent} color={chart.color} size={chart.size} strokeWidth={14} />
                  </div>
                </motion.div>
              ))}
              {/* Center glow */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(255,239,99,0.10) 0%, transparent 70%)' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
