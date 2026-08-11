/**
 * @vitest-environment jsdom
 */
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import GoogleAnalytics from "../GoogleAnalytics";

const CONSENT_KEY = "c2_analytics_consent";
const MEASUREMENT_ID = "G-SYBQXS6TZK";
const SCRIPT_ID = "ga4-script";

type AnalyticsWindow = typeof globalThis & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
} & Partial<Record<`ga-disable-${string}`, boolean>>;

function dispatchConsent(consented: boolean): void {
  window.dispatchEvent(
    new window.CustomEvent("cookie-consent-changed", {
      detail: { consented },
    }),
  );
}

function resetAnalyticsState(): void {
  localStorage.clear();
  document.getElementById(SCRIPT_ID)?.remove();

  const analyticsWindow = window as AnalyticsWindow;
  delete analyticsWindow.dataLayer;
  delete analyticsWindow.gtag;
  delete analyticsWindow[`ga-disable-${MEASUREMENT_ID}`];
}

describe("GoogleAnalytics", () => {
  beforeEach(resetAnalyticsState);
  afterEach(resetAnalyticsState);

  it("does not load GA4 without analytics consent", () => {
    render(<GoogleAnalytics />);

    expect(document.getElementById(SCRIPT_ID)).toBeNull();
  });

  it("loads and configures GA4 when consent was already granted", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ analytics: true, timestamp: Date.now() }),
    );

    render(<GoogleAnalytics />);

    const script = document.getElementById(SCRIPT_ID);
    expect(script).toHaveProperty(
      "src",
      `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`,
    );
    expect((window as AnalyticsWindow).dataLayer).toContainEqual([
      "config",
      MEASUREMENT_ID,
    ]);
  });

  it("loads GA4 once when consent is granted during the session", () => {
    render(<GoogleAnalytics />);

    act(() => dispatchConsent(true));
    act(() => dispatchConsent(true));

    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
  });

  it("disables collection on revocation and re-enables without duplicating the script", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ analytics: true, timestamp: Date.now() }),
    );
    render(<GoogleAnalytics />);

    act(() => dispatchConsent(false));
    expect((window as AnalyticsWindow)[`ga-disable-${MEASUREMENT_ID}`]).toBe(
      true,
    );

    act(() => dispatchConsent(true));
    expect((window as AnalyticsWindow)[`ga-disable-${MEASUREMENT_ID}`]).toBe(
      false,
    );
    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
  });
});
