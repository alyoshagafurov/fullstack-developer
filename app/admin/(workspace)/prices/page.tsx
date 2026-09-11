import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getPriceRows } from '@/lib/prices';
import { PriceEditor } from './PriceEditor';

export const dynamic = 'force-dynamic';

/*
 * Prices.
 *
 * Every service is listed, hidden ones included: a service the owner has
 * taken off the public list still has to be findable here to be put back.
 */
export default async function PricesAdminPage() {
  const gate = await requireAdmin();
  if (gate.status === 'refused') redirect('/admin/login');

  const rows = await getPriceRows();

  return (
    <div className="space-y-10">
      <header>
        <p className="label mb-3">Цены</p>
        <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] tracking-[-0.03em]">
          Стоимость услуг
          <span className="tabular ml-4 text-ink-3">{rows.length}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-2">
          Пустое поле означает «оставить как есть» — на сайте покажется цена, которую вы дали
          изначально, она стоит в поле подсказкой. Чтобы отменить свою правку, очистите поле.
        </p>
      </header>

      <div className="border-t border-line pt-10">
        <PriceEditor rows={rows} />
      </div>
    </div>
  );
}
