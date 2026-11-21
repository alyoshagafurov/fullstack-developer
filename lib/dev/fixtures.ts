import type { CaseRow, TestimonialRow } from "@/lib/cases";

/*
 * Development stand-ins for the database.
 *
 * Copied from what the live site publishes, so a checkout without
 * DATABASE_URL can be worked on against real cases and real reviews instead
 * of empty sections. Read only when NODE_ENV is "development" and no database
 * is configured; production never touches this file.
 */

export const devCases: CaseRow[] = [
  {
    "id": "dev-arusdomod-shop",
    "slug": "arusdomod-shop",
    "title": "ArusDomod",
    "client": "arusdomod tj",
    "year": "2026",
    "task": "Магазину ARUS DOMOD нужен был сайт, чтобы покупатели могли просматривать традиционные наряды, узнавать цены и условия проката, а команда магазина — управлять товарами и заказами.",
    "solution": "Создал интернет-магазин с каталогом товаров и категориями, информацией о наличии, размерах, ценах и прокате. Добавил административную панель для управления товарами, категориями, скидками и заказами.",
    "result": "Покупатели могут знакомиться с ассортиментом онлайн, а магазин — управлять каталогом и отслеживать заказы через сайт.",
    "technologies": [
      "UI/UX Design",
      "E-commerce Website",
      "Product Catalog",
      "Admin Dashboard",
      "Multilingual Interface",
      "Responsive Web Design"
    ],
    "liveUrl": "https://arusdomod.shop",
    "objectImage": "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/home-01-glavny-ekran-yXCJaf17WIuIaOljWCPc9btCDoQvlB.jpg",
    "ghostWord": null,
    "logoUrl": null,
    "screenshots": [
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/home-01-glavny-ekran-yXCJaf17WIuIaOljWCPc9btCDoQvlB.jpg",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/home-05-istorii-o-svadbe-a6ihCbz6fYdAd5arcyXKbpHuWc636D.jpg",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/catalog-01-naryady-i-filtry-Ej5o4kw0MRQNs1Pn8zeEaA4FyTOlei.jpg",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/catalog-02-modeli-01-GMTUvRjz5rE1sxTzZEWhq2WtfAiUl0.jpg",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/catalog-04-modeli-03-mFVBPIQDzLuETRsU1B3zrE4JLvee2w.jpg",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/admin-tovary-2zlyBYfPbIV0FXnj6AIEjpiQqAzcGX.png"
    ],
    "featured": true,
    "order": 0
  },
  {
    "id": "dev-autoshine-store",
    "slug": "autoshine-store",
    "title": "AutoShine",
    "client": "AutoShine TJ",
    "year": "2026",
    "task": "Покупателям было неудобно просматривать товары для ухода за автомобилем и детейлинга, узнавать цены и наличие, а также находить контакты магазина.",
    "solution": "Создал интернет-магазин с поиском, категориями, описаниями и ценами товаров, информацией о наличии, добавлением в корзину и прямыми ссылками для связи.",
    "result": "Каталог, где покупатели могут посмотреть товары и их наличие, а также связаться с магазином.",
    "technologies": [
      "UI/UX Design",
      "E-commerce Website",
      "Product Catalog",
      "Admin Dashboard",
      "Multilingual Interface",
      "Responsive Web Design"
    ],
    "liveUrl": "https://autoshine-production.up.railway.app",
    "objectImage": "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/01-shop-and-contact-VVjaa085yZQw6BuUyPDFu4YD1Oy6QB.png",
    "ghostWord": null,
    "logoUrl": null,
    "screenshots": [
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/01-shop-and-contact-VVjaa085yZQw6BuUyPDFu4YD1Oy6QB.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/02-product-catalog-8SNSFeMWK1AClmHWelTKcdZfOSCYFe.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/03-detailing-tools-KIDFt8KbljdN1NYDAdVbwLXS7mB22f.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-10-03-12.53.55-832zpzFpt8M2V5tlnOthrpLNgwt5P4.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-10-03-12.54.21-kKLTOidu84QbZtjyhH7uIVkmsobaww.png"
    ],
    "featured": true,
    "order": 1
  },
  {
    "id": "dev-parfumeria",
    "slug": "parfumeria",
    "title": "ARZON-PARFUME",
    "client": "ARZON-PARFUME",
    "year": "2026",
    "task": "Нужен был сайт который был уровнем не меньше самого парфюмерии Нужно было чтобы сайт был премиальным с современным дизайном и клиенты могли видить все товары и заказывать А товары админ сам мог добавлять новые товары",
    "solution": "И я сделал то что не стыдно показывать клиенту Сайт интернет магазин с современным дизайном и админ панелью что позволяет управлять контентом сайта",
    "result": "3х общего дохода за месяц",
    "technologies": [
      "react",
      "typescript",
      "node.js"
    ],
    "liveUrl": "https://parfumeria-production.up.railway.app",
    "objectImage": "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.54.50-gNuqxydwE6RKzWLV8sK1khDPQoBb9m.png",
    "ghostWord": null,
    "logoUrl": null,
    "screenshots": [
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.54.50-gNuqxydwE6RKzWLV8sK1khDPQoBb9m.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.54.54-sQKS6aTt22vVtv88CV1UgfDWTWOATU.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.55.11-m3GizoNMGQX41BziVk5AcNLnLj4Vif.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.55.31-S0S1DLXBo6EsLyBrJCWg41lvEX46oS.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.55.41-RdDI5TSEyFhJCd052ORKTsTwYfqOLf.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.55.44-ulg9lXR6FjEzePGK1xRq1dKVjMrVYQ.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-21.55.45-pbJrDYKlN0AZnTosz0P2kzE1Idf7Kh.png"
    ],
    "featured": true,
    "order": 2
  },
  {
    "id": "dev-python-academy",
    "slug": "python-academy",
    "title": "python-academy",
    "client": "python-academy",
    "year": "2025",
    "task": "Многие меня спрашивали где я научился создавать сайты и говорили чтобы я их научил",
    "solution": "Поэтому я создал python-academy чтобы было легко и просто и добавил туда свои курсы по программированию с теориями задачами на каждый день",
    "result": "5+ человек уже научились писать код на языке PYTHON и развиваются со мной в этой сфере",
    "technologies": [
      "python",
      "node.js",
      "typescript",
      "PHP",
      "Django",
      "Laravel"
    ],
    "liveUrl": "https://python-academy-production.up.railway.app",
    "objectImage": "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.56.52-uyc3wvbVPgwl5PReTfDgI1hzo7BIXy.png",
    "ghostWord": null,
    "logoUrl": null,
    "screenshots": [
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.56.52-uyc3wvbVPgwl5PReTfDgI1hzo7BIXy.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.56.58-C8X35dpVt8TraM7ISoqRea1MMHkuxW.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.57.26-SSxR7hIGOSshw48qhHsXFb7sXcmk8y.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.57.05-QrLGKR7fTxqU3lQ2gyCYkDVNQdxnzp.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.57.31-cqyfszGrYt3MELqoSiSUQzElgeIIci.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.57.35-ZAngqO9EvKw5AMRWquqU2NSET5bXmR.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-22.57.45-HLiSEEX7qjI2nine2ERpcFcGK6KoHv.png"
    ],
    "featured": true,
    "order": 3
  },
  {
    "id": "dev-tajshop",
    "slug": "tajshop",
    "title": "Tajshop",
    "client": "tajshop",
    "year": "2026",
    "task": "Не было сайта продавали только с телеграмма и с магазина",
    "solution": "А мы сделали им полный интернет магазин чтобы их клиентам стало удобно находить то что им нужно и следить за акциями",
    "result": "Но они не купили нашу работу  сказав что им такое пока не нужно, но для нас это хороший пример чтобы клиенты видели что мы можем сделать для них",
    "technologies": [
      "next.js",
      "react",
      "python",
      "node.js",
      "typescript"
    ],
    "liveUrl": "https://taj-shop-production.up.railway.app",
    "objectImage": "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-20.59.20-f1kCOcFFlFWLObJ6sPBE78ianrPLKd.png",
    "ghostWord": null,
    "logoUrl": null,
    "screenshots": [
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-20.59.20-f1kCOcFFlFWLObJ6sPBE78ianrPLKd.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-20.59.30-3rZ3wweDN9A9rPEPfS6pZvLmVQwwZj.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-20.59.34-UdlbUXIvDhnLmpdCmzUzBB2r2RVfCI.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-20.59.50-7YPJcOKPld30IKVBRgcQMizjEQPHAW.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-20.59.57-eArJKZQ7ss0qPUjfjgmtuAD6Djokec.png",
      "https://zturm0tmmtpqxguv.public.blob.vercel-storage.com/cases/-2026-09-06-20.59.59-tjPfUOPPcGmZftEBLy0sm15cY3AEeT.png"
    ],
    "featured": true,
    "order": 4
  }
];

export const devTestimonials: TestimonialRow[] = [
  {
    "id": "dev-t0",
    "name": "Maftuna",
    "company": "mimi agency",
    "role": "SEO",
    "text": "Довольны результатом. Умеют работать в команде, быстро понимают какие правки надо внести. Все очень красиво, в нашем И стиле . В короткие сроки сдали проект, респект вам",
    "avatarUrl": null,
    "rating": 5,
    "gender": null,
    "caseSlug": null
  },
  {
    "id": "dev-t1",
    "name": "Rasul",
    "company": "mimi",
    "role": "Видеограф",
    "text": "Профессиональный разработчик. Отлично понимает технические задачи, быстро находит решения и качественно выполняет работу. Ответственный, всегда на связи, рекомендую.",
    "avatarUrl": null,
    "rating": 5,
    "gender": null,
    "caseSlug": null
  },
  {
    "id": "dev-t2",
    "name": "Ирина",
    "company": null,
    "role": null,
    "text": "Алишер сделал всё, что просили - подключил оплату через PayPal, настроил автоматическое создание аккаунта и рассылку доступов, добавил оплату картой без регистрации в PayPal. Заодно нашел и бесплатно починил старую проблему с сертификатом почты, из-за которой письма клиентам не уходили.. Всё протестировал на тестовой среде. На вопросы и правки реагировал быстро, объяснял понятно. Работой довольна, очень рекомендую.",
    "avatarUrl": null,
    "rating": 5,
    "gender": null,
    "caseSlug": null
  },
  {
    "id": "dev-t3",
    "name": "Romane Robb",
    "company": "Стартапер из Франции",
    "role": "Стартапер",
    "text": "The work was excellent, delivered on time and exactly as I wanted. Very professional communication and great attention to detail. I highly recommend working with Alisher. I will definitely work with him again on future projects.",
    "avatarUrl": null,
    "rating": 5,
    "gender": null,
    "caseSlug": null
  },
  {
    "id": "dev-t4",
    "name": "Абубакр",
    "company": null,
    "role": null,
    "text": "В плане результата все понравилось , самое главное что ты разбираешься в своей сфере и сам подсказывал что мне сделать и как будет лучше. Спасибо, было комфортно работать с тобой",
    "avatarUrl": null,
    "rating": 5,
    "gender": null,
    "caseSlug": null
  },
  {
    "id": "dev-t5",
    "name": "ibrohim_1986",
    "company": "MARDAKSHOP",
    "role": "SEO",
    "text": "Реальный профессионал. Действительно быстро работает. Качественно. 100% продолжу работу с ним.",
    "avatarUrl": null,
    "rating": 5,
    "gender": null,
    "caseSlug": null
  },
  {
    "id": "dev-t6",
    "name": "SergeyVladov",
    "company": "Pivobar",
    "role": "Бизнесмен",
    "text": "Алишер разработал для нас современный FinTech-сервис с личным кабинетом, переводами, оплатой услуг, виртуальными картами и историей операций. Работа выполнена профессионально: всё быстро, безопасно, качественно и именно так, как мы ожидали. Рекомендую",
    "avatarUrl": null,
    "rating": 5,
    "gender": null,
    "caseSlug": null
  }
];
