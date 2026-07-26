import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { submitSignup } from '@/lib/api-client';

const description = 'NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.';
const quickLinks = [{ label: 'Overview', path: '/' }, { label: 'Policies', path: '/policies' }, { label: 'Methodology', path: '/#methodology' }, { label: 'Sign Up', path: '/register' }];

export default function Footer() {
  const [email, setEmail] = useState(''); const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  async function handleSubmit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(''); try { await submitSignup(email, 'footer'); setSubmitted(true); setEmail(''); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.'); } finally { setLoading(false); } }
  return (
    <footer className="border-t border-[#035048] bg-[#022e28]">
      <div className="container mx-auto grid grid-cols-1 gap-10 px-4 py-12 md:grid-cols-3">
        <div><div className="flex items-center gap-2"><div className="overflow-hidden rounded-lg bg-white p-[3px]"><img src="/assets/logo.jpeg" alt="NeuPo logo" className="block h-7 w-7 object-contain" /></div><span className="text-xl font-bold text-[#ffef63]">NeuPo</span></div><p className="mt-4 text-sm leading-relaxed text-[#a8c4c0]">{description}</p></div>
        <div><h2 className="text-sm font-semibold uppercase tracking-wider text-[#f5f5f5]">Quick Links</h2><nav className="mt-4 flex flex-col gap-2" aria-label="Footer links">{quickLinks.map((item) => <Link key={item.label} to={item.path} className="text-sm text-[#a8c4c0] hover:text-[#ffef63]">{item.label}</Link>)}</nav></div>
        <div><h2 className="text-sm font-semibold uppercase tracking-wider text-[#f5f5f5]">Stay Updated</h2><p className="mt-4 text-sm text-[#a8c4c0]">Get updates when NeuPo publishes a new policy assessment or source review.</p>{submitted ? <p className="mt-4 text-sm text-[#ffef63]">Thanks! You're on the list.</p> : <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2"><label htmlFor="footer-email" className="sr-only">Email address</label><input id="footer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" required disabled={loading} className="rounded-md border border-[#035048] bg-[#013e37] px-3 py-2 text-sm text-[#f5f5f5]" /><button type="submit" disabled={loading} className="rounded-md bg-[#ffef63] px-4 py-2 text-sm font-semibold text-[#013e37] disabled:opacity-60">{loading ? 'Subscribing…' : 'Subscribe'}</button>{error && <span className="text-xs text-[#fca5a5]">{error}</span>}</form>}</div>
      </div>
      <div className="border-t border-[#035048] py-6 text-center text-xs text-[#a8c4c0]">© 2026 NeuPo. Research information, not legal advice.</div>
    </footer>
  );
}
