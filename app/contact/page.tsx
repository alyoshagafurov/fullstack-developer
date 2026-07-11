import type { Metadata } from 'next';
import { ru } from '@/lib/i18n/ru';
import PageShell from '@/components/PageShell';
import Contact from '@/components/Contact';

export const metadata: Metadata = {
  title: ru.nav.contact,
  description: ru.contact.sub,
};

export default function ContactPage() {
  return (
    <PageShell>
      <Contact />
    </PageShell>
  );
}
