import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { submitSignup } from '@/lib/api-client';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await submitSignup(email, 'register');
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <Helmet>
        <title>Join the Waitlist — NeuPo</title>
        <meta name="description" content="Join the NeuPo waitlist for early access to transparent, data-driven tracking of national strategy." />
        <link rel="canonical" href="https://neupo.app/register" />
      </Helmet>

      <main
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ background: '#013e37' }}
      >
        <div
          className="w-full max-w-md rounded-2xl border p-8"
          style={{ background: '#022e28', borderColor: '#035048' }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm mb-6"
            style={{ color: '#a8c4c0' }}
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>

          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: '#f5f5f5' }}
          >
            Join the waitlist
          </h1>
          <p className="text-sm mb-6" style={{ color: '#a8c4c0' }}>
            Be the first to know when NeuPo opens up. Enter your email and we'll
            reach out with early access.
          </p>

          {status === 'success' ? (
            <div
              className="rounded-md px-4 py-3 text-sm"
              style={{ background: '#ffef6315', border: '1px solid #ffef6350', color: '#ffef63' }}
            >
              You're on the list! We'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={status === 'loading'}
                className="w-full px-4 py-3 rounded-md text-sm border focus:outline-none transition-colors disabled:opacity-60"
                style={{ background: '#013e37', borderColor: '#035048', color: '#f5f5f5' }}
                onFocus={(e) => (e.target.style.borderColor = '#ffef63')}
                onBlur={(e) => (e.target.style.borderColor = '#035048')}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-3 rounded-md text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#ffef63', color: '#013e37' }}
              >
                {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
              </button>
              {status === 'error' && (
                <span className="text-xs" style={{ color: '#fca5a5' }}>{error}</span>
              )}
            </form>
          )}
        </div>
      </main>
    </>
  );
}
