import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import SocialPage from './pages/social';
import PoliticalPage from './pages/political';
import EconomicPage from './pages/economic';
import { loadPillarOrThrow } from '@/lib/pillars-loader';
// Eager import so renderToString doesn't hit a Suspense boundary on 404 routes
// and abort to client rendering. The prod 404 page is tiny; the dev-tools
// variant stays lazy because it pulls in dev-only code we don't want in
// production bundles.
import ProdNotFoundPage from './pages/_404';

const NotFoundPage = import.meta.env.DEV
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : ProdNotFoundPage;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/social',
    element: <SocialPage />,
    loader: () => loadPillarOrThrow('social'),
  },
  {
    path: '/political',
    element: <PoliticalPage />,
    loader: () => loadPillarOrThrow('political'),
  },
  {
    path: '/economic',
    element: <EconomicPage />,
    loader: () => loadPillarOrThrow('economic'),
  },
  {
    // Military was removed — redirect to home
    path: '/military',
    element: <Navigate to="/" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Types for type-safe navigation
export type Path = '/' | '/social' | '/political' | '/economic';

export type Params = Record<string, string | undefined>;
