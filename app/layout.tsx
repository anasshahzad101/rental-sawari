import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@/components/analytics/Analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const notoUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-noto-urdu",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0F766E",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rentalsawari.com"),
  title: {
    default: "Rent a Car in Pakistan · 1,400+ Verified Vendors · RentalSawari",
    template: "%s | RentalSawari",
  },
  description:
    "Verified rent-a-car companies across Lahore, Islamabad, Karachi & 18 more Pakistani cities. Real prices, direct WhatsApp, no booking fees.",
  applicationName: "RentalSawari",
  alternates: { canonical: "/" },
  keywords: [
    "rent a car Pakistan",
    "car rental Lahore",
    "car rental Islamabad",
    "car rental Karachi",
    "self-drive car Pakistan",
    "rent a car with driver Pakistan",
    "wedding car rental Pakistan",
    "tourist car rental Pakistan",
    "Hunza car rental",
    "Northern Areas tour",
  ],
  authors: [{ name: "RentalSawari" }],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://rentalsawari.com",
    siteName: "RentalSawari",
    title: "Rent a Car in Pakistan · 1,400+ Verified Vendors · RentalSawari",
    description:
      "Verified rent-a-car companies across Lahore, Islamabad, Karachi & 18 more Pakistani cities. Real prices, direct WhatsApp, no booking fees.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RentalSawari — Pakistan's verified car rental directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rentalsawari",
    title: "Rent a Car in Pakistan · 1,400+ Verified Vendors · RentalSawari",
    description:
      "Verified rent-a-car companies across Pakistan. Real prices, direct WhatsApp, no booking fees.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: false,
    email: false,
  },
  // Search engine verification. Drop in the real tokens before launch (see
  // PENDING_TASKS.md → Section D).
  verification: {
    google: "REPLACE_WITH_GSC_TOKEN",
    other: {
      "msvalidate.01": "REPLACE_WITH_BING_TOKEN",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoUrdu.variable}`}>
      <head>
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://api.whatsapp.com" />
        <link rel="dns-prefetch" href="https://upload.wikimedia.org" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
      </head>
      <body className="min-h-screen bg-white text-stone-900 font-sans">
        {children}
        <Analytics />
        {/* Google AdSense — required for site verification + manual AdSlot placements */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4703255031750777"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
