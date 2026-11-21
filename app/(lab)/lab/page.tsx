import { getPublishedCases, getTestimonials } from '@/lib/cases';
import { ru } from '@/lib/i18n/ru';
import { site } from '@/lib/content/site';
import { Lab } from './Lab';
import type { LabData } from './data';

/* Real content for the concepts: his name, his work, his reviews, his prices. */
export default async function LabPage() {
  const [cases, reviews] = await Promise.all([getPublishedCases(), getTestimonials()]);
  const data: LabData = {
    name: ru.person.name,
    offer: 'Делаю сайты для вашего бизнеса',
    note: ru.home.heroNote,
    works: cases.map((row) => ({
      title: row.title,
      year: row.year,
      image: row.screenshots[0] || row.objectImage,
      href: `/ru/work/${row.slug}`,
    })),
    reviews: reviews
      .filter((r) => r.text.length < 260)
      .map((r) => ({ text: r.text, name: r.name, who: [r.role, r.company].filter(Boolean).join(', ') })),
    directions: ru.home.directions.map((d, i) => ({
      word: d.word,
      line: d.script,
      price: ['от 1 500 сомони', 'от 5 000 сомони', 'от 1 500 сомони', 'от 7 000 сомони'][i] ?? '',
    })),
    whatsapp: `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(ru.common.whatsappText)}`,
    start: '/ru/start',
  };
  return <Lab data={data} />;
}
