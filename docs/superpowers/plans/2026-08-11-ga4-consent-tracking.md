# GA4 Consent-Gated Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load GA4 measurement ID `G-SYBQXS6TZK` only after analytics consent and use the web stream's existing Enhanced Measurement settings.

**Architecture:** A client-only React component will reuse `getAnalyticsConsent()` and `onConsentChange()` from the existing consent API. It will idempotently initialize `gtag`, append the Google tag to `document.head`, and toggle GA4's stream-specific disable flag when consent changes. `App.tsx` will mount the component outside the router because it does not require routing context.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, jsdom, Google tag (`gtag.js`)

## Global Constraints

- Use measurement ID `G-SYBQXS6TZK`.
- Do not load the Google tag before analytics consent.
- Preserve the existing C2 analytics integration.
- Rely on GA4 Enhanced Measurement; do not send manual `page_view` events.
- Do not add custom conversion events.
- Analytics failures must not break application rendering or navigation.

---

## File Structure

- Create `src/components/GoogleAnalytics.tsx`: consent-gated GA4 initialization and disable handling.
- Create `src/components/__tests__/GoogleAnalytics.test.tsx`: jsdom behavior tests for consent and idempotency.
- Modify `src/App.tsx`: mount the client-only analytics component.

### Task 1: Consent-gated Google Analytics component

**Files:**
- Create: `src/components/__tests__/GoogleAnalytics.test.tsx`
- Create: `src/components/GoogleAnalytics.tsx`

**Interfaces:**
- Consumes: `getAnalyticsConsent(): boolean` and `onConsentChange(callback): () => void` from `src/lib/analytics-consent.ts`.
- Produces: default React component `GoogleAnalytics` with no props and no rendered DOM.

- [ ] **Step 1: Write the failing component tests**

Create jsdom tests that use the real consent module and assert these observable behaviors:

```tsx
const CONSENT_KEY = 'c2_analytics_consent';
const MEASUREMENT_ID = 'G-SYBQXS6TZK';

it('does not load GA4 without analytics consent', () => {
  render(<GoogleAnalytics />);
  expect(document.getElementById('ga4-script')).toBeNull();
});

it('loads and configures GA4 when consent was already granted', () => {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true, timestamp: Date.now() }));
  render(<GoogleAnalytics />);
  const script = document.getElementById('ga4-script') as HTMLScriptElement;
  expect(script.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`);
  expect(window.dataLayer).toContainEqual(['config', MEASUREMENT_ID]);
});

it('loads GA4 once when consent is granted during the session', () => {
  render(<GoogleAnalytics />);
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: { consented: true } })));
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: { consented: true } })));
  expect(document.querySelectorAll('#ga4-script')).toHaveLength(1);
});

it('disables collection on revocation and re-enables without duplicating the script', () => {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics: true, timestamp: Date.now() }));
  render(<GoogleAnalytics />);
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: { consented: false } })));
  expect(window[`ga-disable-${MEASUREMENT_ID}`]).toBe(true);
  act(() => window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: { consented: true } })));
  expect(window[`ga-disable-${MEASUREMENT_ID}`]).toBe(false);
  expect(document.querySelectorAll('#ga4-script')).toHaveLength(1);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
npm test -- --run src/components/__tests__/GoogleAnalytics.test.tsx
```

Expected: FAIL because `src/components/GoogleAnalytics.tsx` does not exist.

- [ ] **Step 3: Implement the minimal component**

Implement:

```tsx
import { useEffect } from 'react';
import { getAnalyticsConsent, onConsentChange } from '@/lib/analytics-consent';

const MEASUREMENT_ID = 'G-SYBQXS6TZK';
const SCRIPT_ID = 'ga4-script';

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
} & Partial<Record<`ga-disable-${string}`, boolean>>;

function enableGoogleAnalytics(): void {
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow[`ga-disable-${MEASUREMENT_ID}`] = false;
  if (document.getElementById(SCRIPT_ID)) return;

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.dataLayer!.push(args);
  analyticsWindow.gtag('js', new Date());
  analyticsWindow.gtag('config', MEASUREMENT_ID);

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function disableGoogleAnalytics(): void {
  (window as AnalyticsWindow)[`ga-disable-${MEASUREMENT_ID}`] = true;
}

export default function GoogleAnalytics() {
  useEffect(() => {
    if (getAnalyticsConsent()) enableGoogleAnalytics();
    return onConsentChange((consented) => {
      if (consented) enableGoogleAnalytics();
      else disableGoogleAnalytics();
    });
  }, []);
  return null;
}
```

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
npm test -- --run src/components/__tests__/GoogleAnalytics.test.tsx
```

Expected: all GA4 component tests pass with no warnings.

### Task 2: Mount GA4 in the client application

**Files:**
- Modify: `src/App.tsx`
- Test: `src/components/__tests__/GoogleAnalytics.test.tsx`

**Interfaces:**
- Consumes: default `GoogleAnalytics` component from `@/components/GoogleAnalytics`.
- Produces: one persistent client-side GA4 consent listener for the application.

- [ ] **Step 1: Import and mount the component**

Add:

```tsx
import GoogleAnalytics from '@/components/GoogleAnalytics';
```

Mount `<GoogleAnalytics />` as a sibling immediately after `<RouterProvider router={router} />`. `App.tsx` is client-only, so this avoids SSR access to `window` and `document`.

- [ ] **Step 2: Run focused and related consent tests**

Run:

```powershell
npm test -- --run src/components/__tests__/GoogleAnalytics.test.tsx src/components/__tests__/CookieBanner.test.tsx src/lib/__tests__/analytics-consent.ts
```

Expected: all selected tests pass.

### Task 3: Production verification

**Files:**
- Verify only; no planned source edits.

- [ ] **Step 1: Run TypeScript checking**

```powershell
npm run type-check
```

- [ ] **Step 2: Run the production client and SSR build**

```powershell
npm run build
```

- [ ] **Step 3: Check generated client output**

Search the generated client bundle for `G-SYBQXS6TZK` and confirm the server bundle can be built without evaluating browser-only analytics code.

- [ ] **Step 4: Explain deployment verification**

After deployment, clear `c2_analytics_consent`, verify Decline produces no `gtag/js` request, then Accept and verify requests to `googletagmanager.com/gtag/js?id=G-SYBQXS6TZK` and `google-analytics.com/g/collect`. Confirm the visit in GA4 Realtime.

## Repository Note

This workspace currently exposes no usable Git repository metadata to shell commands, so the normal per-task commit steps cannot be performed here. All edits and verification results will be reported directly.
