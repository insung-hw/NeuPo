import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Development-only middleware that makes `npm run dev` behave like production:
 * the Express API routes are served, and page requests are server-rendered via
 * entry-server. Production does NOT use this — it runs the built
 * `dist/server/entry.js` directly (see src/server/entry.ts PROD block).
 */
function devSsrAndApi(): Plugin {
  return {
    name: 'neupo-dev-ssr-and-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      // Return a post hook so our handler runs after Vite's internal middleware
      // (so static assets, HMR, and /@vite/* keep working).
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.originalUrl || req.url || '/';
          try {
            // API + SEO text routes → hand off to the Express app.
            if (
              url.startsWith('/api') ||
              url === '/robots.txt' ||
              url === '/sitemap.xml' ||
              url === '/llms.txt'
            ) {
              const mod = await server.ssrLoadModule('/src/server/entry.ts');
              const app = mod.default as (rq: unknown, rs: unknown, nx: unknown) => void;
              return app(req, res, next);
            }

            // Only SSR document (GET, no file extension) requests; let Vite
            // handle assets and everything else.
            if (req.method !== 'GET' || url.includes('.')) return next();

            const templateHtml = readFileSync(resolve(root, 'index.html'), 'utf-8');
            const template = await server.transformIndexHtml(url, templateHtml);
            const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
            const result = await render(url);

            if (result.redirect) {
              res.statusCode = result.status || 302;
              res.setHeader('Location', result.redirect);
              return res.end();
            }

            const html = template
              .replace('<!--app-head-->', result.head || '')
              .replace('<!--app-html-->', result.html || '');
            res.statusCode = result.status || 200;
            res.setHeader('Content-Type', 'text/html');
            return res.end(html);
          } catch (err) {
            server.ssrFixStacktrace(err as Error);
            next(err);
          }
        });
      };
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  root,
  plugins: [react(), devSsrAndApi()],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
    },
  },
  build: isSsrBuild
    ? {
        // SSR/Express server bundle. Built with `vite build --ssr src/server/entry.ts`.
        // Output next to the client dir so the server can read dist/server/client.
        outDir: 'dist/server',
        emptyOutDir: false,
      }
    : {
        // Browser bundle + processed index.html (keeps the SSR markers).
        outDir: 'dist/server/client',
        emptyOutDir: true,
      },
}));
