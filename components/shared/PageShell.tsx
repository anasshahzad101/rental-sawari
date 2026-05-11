import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Wraps every non-homepage page with the global header + footer.
 * The homepage uses its own composition so it can do hero-edge things.
 */
export function PageShell({
  children,
  bottomCTA,
}: {
  children: React.ReactNode;
  bottomCTA?: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="bg-white">{children}</main>
      {bottomCTA}
      <Footer />
    </>
  );
}
