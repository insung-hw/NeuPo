import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navigation = [{ label: 'Overview', path: '/' }, { label: 'Policies', path: '/policies' }, { label: 'Methodology', path: '/#methodology' }];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-[#035048] bg-[#022e28]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><div className="overflow-hidden rounded-lg bg-white p-[3px]"><img src="/assets/logo.jpeg" alt="NeuPo logo" className="block h-8 w-8 object-contain" /></div><span className="text-xl font-bold text-[#ffef63]" style={{ fontFamily: 'var(--font-heading)' }}>NeuPo</span></Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">{navigation.map((item) => <Link key={item.label} to={item.path} className="text-sm font-medium text-[#a8c4c0] hover:text-[#ffef63]">{item.label}</Link>)}</nav>
          <Link to="/register" className="hidden rounded-md bg-[#ffef63] px-4 py-2 text-sm font-semibold text-[#013e37] md:block">Sign up</Link>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open} className="rounded-md p-2 text-[#a8c4c0] md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {open && <nav className="flex flex-col gap-1 border-t border-[#035048] py-4 md:hidden" aria-label="Mobile navigation">{navigation.map((item) => <Link key={item.label} to={item.path} onClick={() => setOpen(false)} className="px-2 py-2.5 text-sm font-medium text-[#a8c4c0]">{item.label}</Link>)}<Link to="/register" onClick={() => setOpen(false)} className="mt-3 rounded-md bg-[#ffef63] px-4 py-2.5 text-center text-sm font-semibold text-[#013e37]">Sign up</Link></nav>}
      </div>
    </header>
  );
}
