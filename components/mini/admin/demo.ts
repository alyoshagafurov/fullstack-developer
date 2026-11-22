/*
 * Made-up answers for looking at the panel on a developer's machine, where
 * there is no Telegram signature and no database. Reached only from
 * `useAdminApi` when NODE_ENV is development and the address carries ?demo;
 * a production build never takes that branch.
 */

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const leads = [
  { id: 'l1', ref: 'ALY-2026-031', name: 'Мадина', projectType: 'Интернет-магазин', budget: '5 000 – 10 000 сомони', status: 'NEW', createdAt: new Date().toISOString(), firstRepliedAt: null },
  { id: 'l2', ref: 'ALY-2026-030', name: 'Фаррух', projectType: 'Лендинг', budget: 'до 3 000 сомони', status: 'NEW', createdAt: day(-1), firstRepliedAt: null },
  { id: 'l3', ref: 'ALY-2026-029', name: 'Рустам · AutoShine', projectType: 'Сайт под ключ', budget: '10 000+ сомони', status: 'IN_PROGRESS', createdAt: day(-6), firstRepliedAt: day(-5) },
  { id: 'l4', ref: 'ALY-2026-027', name: 'Зарина', projectType: 'Telegram-бот', budget: '3 000 – 5 000 сомони', status: 'PROPOSAL', createdAt: day(-12), firstRepliedAt: day(-11) },
  { id: 'l5', ref: 'ALY-2026-022', name: 'ArusDomod', projectType: 'Интернет-магазин', budget: '10 000+ сомони', status: 'COMPLETED', createdAt: day(-40), firstRepliedAt: day(-39) },
  { id: 'l6', ref: 'ALY-2026-019', name: 'Бахтиёр', projectType: 'Лендинг', budget: 'до 3 000 сомони', status: 'DECLINED', createdAt: day(-55), firstRepliedAt: day(-54) },
];

const reviews = [
  { id: 'r1', name: 'Maftuna', company: 'mimi agency', role: 'SEO', text: 'Довольны результатом. Быстро понимают, какие правки нужны. Всё очень красиво и в нашем стиле, сдали в короткие сроки.', rating: 5, published: false, createdAt: day(-1) },
  { id: 'r2', name: 'Rasul', company: 'mimi', role: 'Видеограф', text: 'Профессиональный разработчик. Отлично понимает технические задачи и качественно выполняет работу.', rating: 5, published: true, createdAt: day(-20) },
];

const stageOf: Record<string, string[]> = {
  new: ['NEW'],
  work: ['CONTACTED', 'DISCOVERY', 'PROPOSAL', 'IN_PROGRESS', 'ON_HOLD'],
  done: ['COMPLETED'],
  lost: ['DECLINED', 'CANCELLED'],
};

export async function demoCall(command: string, payload: Record<string, unknown>): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 250));
  switch (command) {
    case 'overview':
      return { waiting: 2, fresh: 6, active: 2, completed: 1, conversion: 0, funnel: [], reviews: reviews.filter((r) => !r.published).length };
    case 'leads': {
      const s = String(payload.status ?? 'all');
      const q = String(payload.q ?? '').toLowerCase();
      const rows = leads.filter((l) => (s in stageOf ? stageOf[s].includes(l.status) : true) && (!q || `${l.name} ${l.ref}`.toLowerCase().includes(q)));
      return { rows, total: rows.length, page: 1, pages: 1 };
    }
    case 'lead': {
      const l = leads.find((x) => x.id === payload.id);
      return l
        ? {
            ...l,
            email: 'client@example.com',
            company: null,
            contact: 'Telegram: @example_client',
            goal: 'Продавать платья онлайн и принимать заказы на прокат',
            description: 'Каталог на 40 моделей, фильтры, корзина и оплата картой. Нужна админка для товаров.',
            audience: 'Невесты 20–30 лет в Душанбе',
            features: null,
            links: 'arusdomod.shop',
            extra: null,
            timeline: 'Месяц',
            notes: [{ id: 'n1', body: 'Созвон в четверг в 15:00', createdAt: new Date().toISOString() }],
          }
        : null;
    }
    case 'reviews':
      return reviews;
    case 'money':
      return {
        rows: [
          { id: 'm1', amount: 4500, currency: 'TJS', day: day(-2), note: 'AutoShine — аванс' },
          { id: 'm2', amount: 300, currency: 'USD', day: day(-15), note: 'Бот для mimi' },
        ],
        rates: null,
        today: day(0),
      };
    case 'tasks':
      return {
        rows: [{ id: 't1', title: 'Созвон с Мадиной', note: null, dayFrom: day(0), dayTo: null, startHour: 15, endHour: 16, leadMinutes: 30, active: true }],
        today: day(0),
      };
    default:
      return { status: 'ok' };
  }
}
