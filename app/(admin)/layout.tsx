import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { RegisterServiceWorker } from "./RegisterServiceWorker";

/**
 * Root layout for the admin. It is a separate root from the public site
 * (app/(site)/layout.tsx) on purpose: no AdSense, no Google Analytics or
 * Clarity, no chat widget, and nothing indexable ever loads in the admin.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { default: "RentalSawari Admin", template: "%s · RentalSawari Admin" },
  applicationName: "RentalSawari Admin",
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/admin/logo-tile.png", apple: "/admin/app-icon-192.png" },
  // Installable as an app (and the Android app in android/ opens it).
  manifest: "/admin/manifest.webmanifest",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="admin min-h-screen bg-page font-sans text-ink antialiased">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
