# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Business owners and founders who need a website, an online store, a Telegram bot or Mini App, or a web app / CRM, and are deciding whom to hire. Two audiences in equal measure: local businesses in Tajikistan (Russian, prices in somoni, contact through WhatsApp or Telegram) and foreign clients (English, prices in dollars, contact through the request form or email). Most arrive on a phone, often from Instagram, Telegram or a direct link.

## Product Purpose

aly.lat is the personal portfolio of Alisher Gafurov (brand: aly), a full-stack developer in Dushanbe. Its one job is to turn a visitor into a request: the visitor sees beautiful finished work, becomes convinced of the quality, picks a direction, and sends a request through the site form or WhatsApp in a few taps. Success is the number of qualified requests, not time on page.

## Positioning

One person does the whole product — idea, design, code, server and launch — with no middlemen and no hand-off "to another guy". The client talks directly to the person who builds the thing.

## Operating Context

- Next.js 16 App Router, React 19, Tailwind 4, Prisma on Neon, deployed on Vercel.
- English at bare URLs, Russian under /ru. Language choice follows the visitor's browser on first visit.
- Cases, testimonials and price overrides are published from the owner's admin (/admin) and read from the database; the site revalidates every few minutes.
- Requests arrive in the owner's Telegram through the bot; the admin and the Telegram Mini App live in the same codebase but are out of scope for the site redesign.

## Capabilities and Constraints

- Four directions to lead with: websites and landing pages; online stores; Telegram bots and Mini Apps; web apps and CRM. The full list of fourteen services stays on /prices and /services.
- Request form (/start, four short steps) posts to /api/lead and notifies the owner in Telegram.
- WhatsApp: +992 918 79 32 31 (wa.me/992918793231). Telegram: @alishergafurovv. Email: gafurovalyosha@gmail.com.
- Prices: somoni on /ru, dollars on the English site (converted, labelled approximate).
- Do not run `prisma db push`: the database is shared with an older site.
- Site copy lives in lib/i18n (en.ts, ru.ts) and lib/content; the owner's wording is authoritative.

## Brand Commitments

- Name: Алишер Гафуров / Alisher Gafurov; brand "aly", always lowercase; wordmark at public/brand/wordmark.webp.
- Fonts pinned by the owner: BBH Bogle (bold, headings only), Nunito Sans (thin, small text only), Pacifico (handwritten accent, decoration only).
- The site must be clean, with a lot of air.
- Every section: one big headline, a small piece of text somewhere in a corner for those who want to read. No long enumerated lists (no "01 Заявка / 02 Консультация / …" steps).
- Motion should make the site feel alive (motion.dev, GSAP), but content must be visible immediately.

## Evidence on Hand

- Published cases in the database (ArusDomod, ArusDomod.shop, AutoShine, TajShop, Arzon-Parfume at the time of writing) with screenshots in Vercel Blob.
- Seven published client testimonials (Maftuna — SEO, mimi agency; Rasul — videographer, mimi; Irina; others).
- Owner photographs in public/photo and public/gallery; device renders in public/objects.
- Figures, reconciled: 50+ projects, 3–4 years of experience (the owner's own figure), 10+ technologies. The old "2 years as a developer" stat was dropped because it contradicted the 3–4 years; the Telegram bot still says 60+ projects and must be aligned when the bot is redone. Do not invent metrics, clients, logos or results the owner has not provided.

## Product Principles

1. Work first: the visitor should see real projects before reading anything about the person.
2. Look, don't read: one large statement per screen; detail is optional and small.
3. Two taps to a request: the form or WhatsApp is always within reach.
4. One truth: every figure is the same on the site, the bot and the Mini App.
5. Fast on a cheap Android phone: nothing hidden waiting for animation.

## Accessibility & Inclusion

Small thin text must still meet contrast (WCAG AA) and remain at least 12px; respect prefers-reduced-motion; keyboard focus visible.
