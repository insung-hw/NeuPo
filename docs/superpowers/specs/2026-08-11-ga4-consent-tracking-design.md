# GA4 Consent-Gated Tracking Design

## Goal

Enable Google Analytics 4 for the NeuPo production website using measurement ID `G-SYBQXS6TZK`, while preserving the existing analytics-cookie consent behavior.

## Scope

- Load the Google tag only after the visitor grants analytics consent.
- Use the Enhanced Measurement settings already configured in the GA4 web data stream.
- Stop GA4 collection when analytics consent is declined or revoked.
- Do not add custom conversion events in this change.
- Do not replace or modify the existing C2 analytics integration.

## Architecture

Create a focused client-only `GoogleAnalytics` component. On mount, it reads consent through `getAnalyticsConsent()` and subscribes to later decisions through `onConsentChange()`. When consent is granted, the component initializes `dataLayer` and `gtag`, queues the GA4 configuration, and dynamically appends the asynchronous Google tag script to `document.head`.

Mount the component from `App.tsx`, which is client-only in this application. The component will not use React Router hooks. GA4 Enhanced Measurement will handle normal page views and browser-history changes, avoiding a second manual `page_view` implementation and duplicate reporting.

## Consent Flow

1. With no saved consent or with declined consent, no Google tag script is added.
2. When the visitor accepts analytics cookies, the script is added once and GA4 starts collecting according to the web stream's Enhanced Measurement settings.
3. When consent is declined or revoked after loading, set GA4's stream-specific disable flag so no further hits are sent.
4. When consent is granted again, clear the disable flag and reuse the existing script instead of inserting a duplicate.

## Error Handling

Analytics initialization must not interrupt rendering or navigation. Initialization is idempotent, browser-only, and checks for an existing script element before insertion. A blocked or failed third-party script request leaves the application usable.

## Testing

Add Vitest/jsdom component tests proving that:

- GA4 does not load without consent.
- Previously stored consent loads the correct script and queues configuration for `G-SYBQXS6TZK`.
- A consent-change event loads GA4 once.
- Declining or revoking consent sets the GA4 disable flag.
- Re-granting consent clears the disable flag without duplicating the script.

Run the focused test first, then TypeScript checking and the production build. Manual deployment verification will use the browser Network panel and GA4 Realtime reporting.

## Out of Scope

- Google Tag Manager
- Custom events such as signup completion
- Cross-domain measurement
- GA4 property administration or credential access
