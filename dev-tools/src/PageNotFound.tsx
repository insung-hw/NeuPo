import { Link } from 'react-router-dom';

/**
 * Development 404 page. routes.tsx lazy-loads this only in dev; production uses
 * src/pages/_404.tsx. Kept intentionally simple.
 */
export default function PageNotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: '#013e37',
        color: '#f5f5f5',
        fontFamily: 'var(--font-heading, sans-serif)',
      }}
    >
      <h1 style={{ fontSize: '3rem', color: '#ffef63' }}>404</h1>
      <p style={{ color: '#a8c4c0' }}>Page not found.</p>
      <Link to="/" style={{ color: '#ffef63', textDecoration: 'underline' }}>
        Back to home
      </Link>
    </main>
  );
}
