import { lazy } from 'react';
import { redirect, type RouteObject } from 'react-router-dom';
import HomePage from './pages/index';
import PoliciesPage from './pages/policies';
import RegisterPage from './pages/register';
import { loadPolicyCatalog } from '@/lib/policies-loader';
import ProdNotFoundPage from './pages/_404';

const NotFoundPage = import.meta.env.DEV ? lazy(() => import('../dev-tools/src/PageNotFound')) : ProdNotFoundPage;

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage />, loader: loadPolicyCatalog },
  { path: '/policies', element: <PoliciesPage />, loader: loadPolicyCatalog },
  { path: '/energy', loader: () => redirect('/policies', 301) },
  { path: '/register', element: <RegisterPage /> },
  { path: '*', element: <NotFoundPage /> },
];

export type Path = '/' | '/policies' | '/register';
export type Params = Record<string, string | undefined>;
