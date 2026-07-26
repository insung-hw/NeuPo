import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Social', path: '/social' },
    { label: 'Political', path: '/political' },
    { label: 'Economic', path: '/economic' },
    { label: 'Sign Up', path: '/register' },
  ];

  return (
    <footer style={{ background: '#022e28' }} className="border-t" >
      <div className="container mx-auto px-4 py-12" style={{ borderColor: '#035048' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Col 1 — Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg overflow-hidden" style={{ background: '#fff', padding: '3px' }}>
                <img
                  src="/assets/screenshot-2026-07-25T14-29-40.jpg"
                  alt="NeuPo logo"
                  className="h-7 w-7 object-contain block"
                />
              </div>
              <span
                className="text-xl font-bold"
                style={{ color: '#ffef63', fontFamily: 'var(--font-heading)' }}
              >
                NeuPo
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#a8c4c0' }}>
              National Strategy. Transparent Progress.
            </p>
            <p className="text-xs mt-4 leading-relaxed" style={{ color: '#a8c4c0' }}>
              A civic intelligence platform tracking Social, Political, Economic, and Military objectives with real US government data.
            </p>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#f5f5f5' }}>Quick Links</h3>
            <nav className="flex flex-col gap-2" aria-label="Footer links">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm transition-colors"
                  style={{ color: '#a8c4c0' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffef63')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a8c4c0')}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Newsletter */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#f5f5f5' }}>Stay Updated</h3>
            <p className="text-sm mb-4" style={{ color: '#a8c4c0' }}>
              Get the latest updates on national strategy progress and new data releases.
            </p>
            {submitted ? (
              <p className="text-sm" style={{ color: '#ffef63' }}>Thanks! You're on the list.</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-3 py-2 rounded-md text-sm border focus:outline-none transition-colors"
                  style={{ background: '#013e37', borderColor: '#035048', color: '#f5f5f5' }}
                  onFocus={(e) => (e.target.style.borderColor = '#ffef63')}
                  onBlur={(e) => (e.target.style.borderColor = '#035048')}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-md text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#ffef63', color: '#013e37' }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t text-center" style={{ borderColor: '#035048' }}>
          <p className="text-xs" style={{ color: '#a8c4c0' }}>
            © 2025 NeuPo. All rights reserved. Data sourced from US government public records.
          </p>
        </div>
      </div>
    </footer>
  );
}
