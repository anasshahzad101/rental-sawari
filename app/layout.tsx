import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
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
    default: "Rent a Car in Pakistan · 1,000+ Verified Vendors · RentalSawari",
    template: "%s | RentalSawari",
  },
  description:
    "Verified rent-a-car companies across Lahore, Islamabad, Karachi & 5 more Pakistani cities. Real prices, direct WhatsApp, no booking fees.",
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
    title: "Rent a Car in Pakistan · 1,000+ Verified Vendors · RentalSawari",
    description:
      "Verified rent-a-car companies across Lahore, Islamabad, Karachi & 5 more Pakistani cities. Real prices, direct WhatsApp, no booking fees.",
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
    title: "Rent a Car in Pakistan · 1,000+ Verified Vendors · RentalSawari",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoUrdu.variable}`}>
      <body className="min-h-screen bg-white text-stone-900 font-sans">
        {children}
      </body>
    </html>
  );
}
