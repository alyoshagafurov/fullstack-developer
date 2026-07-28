import Navbar from './Navbar';
import Footer from './Footer';

/*
 * Shared wrapper for the dedicated section pages: nav + padded main + footer.
 * `h1` is a keyword-rich, screen-reader-only heading so every page has exactly
 * one descriptive H1 without changing the visual design.
 */
export default function PageShell({ h1, children }: { h1?: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="relative pt-16 md:pt-20">
        {h1 && <h1 className="sr-only">{h1}</h1>}
        {children}
      </main>
      <Footer />
    </>
  );
}
