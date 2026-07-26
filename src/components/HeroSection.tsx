import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { submitSignup } from '@/lib/api-client';

const description = 'NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.';

export default function HeroSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await submitSignup(email, 'hero');
      setStatus('success');
      setEmail('');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-[linear-gradient(135deg,#024039_0%,#013e37_45%,#022a25_100%)]">
      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-full border border-[#ffef6350] bg-[#ffef6315] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffef63]">Official-source policy research</p>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-[#f5f5f5] md:text-6xl" style={{ fontFamily: 'var(--font-heading)' }}>U.S. Renewable Energy Policy, <span className="text-[#ffef63]">Traced to the Source.</span></h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#a8c4c0]">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/policies" className="rounded-md bg-[#ffef63] px-6 py-3 text-sm font-semibold text-[#013e37]">Explore policies</Link>
            <a href="#methodology" className="rounded-md border border-[#a8c4c060] px-6 py-3 text-sm font-semibold text-[#f5f5f5]">Review methodology</a>
          </div>
          <div className="mt-10 max-w-md">
            {status === 'success' ? (
              <p className="rounded-md border border-[#ffef6350] bg-[#ffef6315] px-4 py-3 text-sm text-[#ffef63]">You're on the list! We'll be in touch soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="hero-email">Email address</label>
                <input id="hero-email" type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" required disabled={status === 'loading'} className="flex-1 rounded-md border border-[#035048] bg-[#022e28] px-4 py-3 text-sm text-[#f5f5f5]" />
                <button type="submit" disabled={status === 'loading'} className="rounded-md bg-[#ffef63] px-6 py-3 text-sm font-semibold text-[#013e37] disabled:opacity-60">{status === 'loading' ? 'Joining…' : 'Join the waitlist'}</button>
              </form>
            )}
            {status === 'error' && <p className="mt-2 text-xs text-[#fca5a5]">{error}</p>}
            <p className="mt-2 text-xs text-[#a8c4c0]">Get updates when NeuPo publishes a new policy assessment or source review.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
