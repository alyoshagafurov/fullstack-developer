import Navbar from './Navbar';
import Footer from './Footer';

/* Shared wrapper for the dedicated section pages: nav + padded main + footer. */
export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}
