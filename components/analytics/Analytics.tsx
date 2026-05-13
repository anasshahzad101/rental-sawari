import Script from "next/script";
import { TrackingListener } from "./TrackingListener";

/**
 * Google Analytics 4 loader + global event delegation.
 *
 * Hardcoded measurement ID for simplicity (NEXT_PUBLIC_GA_ID is a public
 * value — visible in any browser DevTools — so there's no secret to hide).
 * Override per environment via the env var if you ever need to (e.g. a
 * separate property for staging).
 *
 * Consent Mode v2: intentionally NOT defaulted to denied. Pakistan has no
 * cookie-banner requirement and the launch audience is overwhelmingly
 * Pakistani — full-fidelity tracking from page load is the right trade-off.
 * If EU/UK traffic ever crosses ~5% of sessions, add a banner + default-deny.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-373YQEMVC4";

export function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="ga4-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: true,
            anonymize_ip: false
          });
        `}
      </Script>
      <TrackingListener />
    </>
  );
}
