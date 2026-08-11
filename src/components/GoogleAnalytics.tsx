import { useEffect } from "react";

import { getAnalyticsConsent, onConsentChange } from "@/lib/analytics-consent";

const MEASUREMENT_ID = "G-SYBQXS6TZK";
const SCRIPT_ID = "ga4-script";

type AnalyticsWindow = typeof globalThis & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
} & Partial<Record<`ga-disable-${string}`, boolean>>;

function enableGoogleAnalytics(): void {
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow[`ga-disable-${MEASUREMENT_ID}`] = false;

  if (document.getElementById(SCRIPT_ID)) return;

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag = (...args: unknown[]) => {
    analyticsWindow.dataLayer!.push(args);
  };
  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", MEASUREMENT_ID);

  const script = document.createElement("script");
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
    if (getAnalyticsConsent()) {
      enableGoogleAnalytics();
    }

    return onConsentChange((consented) => {
      if (consented) {
        enableGoogleAnalytics();
      } else {
        disableGoogleAnalytics();
      }
    });
  }, []);

  return null;
}
