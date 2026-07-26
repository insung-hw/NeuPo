import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Users, Landmark, TrendingUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const pillars = [
  {
    label: 'Social',
    icon: Users,
    path: '/social',
    color: '#ffef63',
    subcategories: [
      { label: 'Objectives', path: '/social' },
      { label: 'Policies', path: '/social' },
      { label: 'Projects', path: '/social' },
    ],
  },
  {
    label: 'Political',
    icon: Landmark,
    path: '/political',
    color: '#ffef63',
    subcategories: [
      { label: 'Objectives', path: '/political' },
      { label: 'Policies', path: '/political' },
      { label: 'Projects', path: '/political' },
    ],
  },
  {
    label: 'Economic',
    icon: TrendingUp,
    path: '/economic',
    color: '#ffef63',
    subcategories: [
      { label: 'Objectives', path: '/economic' },
      { label: 'Policies', path: '/economic' },
      { label: 'Projects', path: '/economic' },
    ],
  },
];

function PillarDropdown({ pillar }: { pillar: (typeof pillars)[0] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = pillar.icon;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium transition-colors py-2 px-1"
        style={{ color: '#a8c4c0' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffef63')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#a8c4c0')}
        aria-expanded={open}
      >
        <Icon size={14} />
        {pillar.label}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-44 rounded-lg border shadow-xl z-50 overflow-hidden"
          style={{ background: '#022e28', borderColor: '#035048' }}
        >
          {pillar.subcategories.map((sub) => (
            <Link
              key={sub.label}
              to={sub.path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
              style={{ color: '#a8c4c0' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffef63'; e.currentTarget.style.background = '#013e37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#a8c4c0'; e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="w-1.5 h-1.5 rounded-full opacity-60" style={{ background: '#ffef63' }} />
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: '#022e28', borderColor: '#035048' }}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="rounded-lg overflow-hidden" style={{ background: '#fff', padding: '3px' }}>
              <img
                src="/assets/logo.jpeg"
                alt="NeuPo logo"
                className="h-8 w-8 object-contain block"
              />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: '#ffef63', fontFamily: 'var(--font-heading)' }}
            >
              NeuPo
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {pillars.map((pillar) => (
              <PillarDropdown key={pillar.label} pillar={pillar} />
            ))}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2 rounded-md text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#ffef63', color: '#013e37' }}
            >
              Sign up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md transition-colors"
            style={{ color: '#a8c4c0' }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4" style={{ borderColor: '#035048' }}>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                const isExpanded = mobileExpanded === pillar.label;
                return (
                  <div key={pillar.label}>
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : pillar.label)}
                      className="flex items-center justify-between w-full px-2 py-2.5 text-sm font-medium transition-colors"
                      style={{ color: '#a8c4c0' }}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={14} />
                        {pillar.label}
                      </span>
                      <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="pl-6 flex flex-col gap-1 mb-1">
                        {pillar.subcategories.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="py-2 text-sm transition-colors"
                            style={{ color: '#a8c4c0' }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-3 mx-2 px-4 py-2.5 rounded-md text-sm font-semibold text-center transition-all"
                style={{ background: '#ffef63', color: '#013e37' }}
              >
                Sign up
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
