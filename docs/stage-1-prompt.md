# Промпт этапа 1 — «Пентхаус-нуар»: дизайн-система + главная

Вставить целиком первым сообщением в **новую** сессию Claude Code в корне репозитория. Сессия не помнит предыдущую — всё нужное ниже.

---

═══ СОСТОЯНИЕ ПРОЕКТА ═══
Проект: aly.lat — портфолио Алишера Гафурова
Класс: M | Этап: 1 из 3
Стек: Next.js 15 App Router + React 19 + TypeScript + Tailwind 3.4 + Prisma/Neon; админ-API Django (не трогать); Vercel
Дизайн: Figma нет → мир закреплён брифом владельца; контракт в `.impeccable/surfaces/app-page-tsx.md`; lane brand; `PRODUCT.md` записан
Инструменты: ECC (`/ecc:plan`, `/ecc:code-review`), скиллы `ecc:motion-foundations`, `ecc:motion-advanced`, `ecc:verification-loop`; агенты `ecc:react-reviewer`, `ecc:a11y-architect`; Impeccable (new-work build → `audit` → агенты finish-reviewer, documenter на этапе 3); проверка — встроенная панель браузера (Playwright MCP не установлен); Emil Kowalski не установлен — по §2.2 заменён `ecc:motion-*`

ПЛАН ЭТАПОВ
 [>] 1  Дизайн-система «пентхаус-нуар» + главная целиком + общий хром
 [ ] 2  /work, /work/[slug], /services, /services/[slug], /start-project в новом мире
 [ ] 3  Финал: critique → polish, SEO/OG, a11y, Lighthouse ≥ 90, security-scan, DESIGN.md, деплой

ПРИНЯТЫЕ РЕШЕНИЯ
 - Направление: интерьер «пентхаус-нуар» владельца — свет выхватывает детали из темноты; из броска №6 (seed 50918d29) остаются ведущая линия, сетка интерлиньяжа, состояния как события
 - Путь сборки code-led (генерации изображений нет; `build-phase note` записан) — гейты comps/spec/plates не проходятся; ambition в блоке FIRST VIEWPORT контракта
 - Палитра закреплена: графит #0C0C0E, тёплый белый #F7F4F0, медь #C0996F — единственный цвет
 - Фото владельца как сняты; стоков и чужих людей нет; отзывы и кейсы не выдумывать
 - Tailwind остаётся 3.4; `lenis`, `gsap`, `@gsap/react`, `framer-motion`, `split-type` снимаются (бюджет)
 - Шрифт-дисплей: `@fontsource/unbounded` **5.3.0** (проверено `npm view`), latin + cyrillic, weights 300/400; текст — Onest (уже self-hosted)

ОТКРЫТЫЕ ВОПРОСЫ
 - Blob-store в Vercel и `prisma migrate deploy` — вне этого этапа

ПОСЛЕДНИЙ СТАТУС: планирование DONE (PRODUCT.md, контракт направления, этот промпт)
СЛЕДУЮЩИЙ ХОД: этот промпт
═══════════════════════════

## 1. ROLE

Работай как Senior Full-Stack Developer + Senior UI/UX Designer + Design Engineer. Это production-сайт реального человека, не демо. Каждое решение должно быть таким, которое ты защитишь перед владельцем одним предложением.

## 2. CONTEXT

Владелец: Алишер Гафуров, full-stack разработчик, Душанбе; бренд aly, домен aly.lat. Цель сайта — заявки через бриф (`/start-project` → Prisma/Neon → админка → Telegram). Аудитория: владельцы малого и среднего бизнеса СНГ, чаще с телефона. Прочитай `PRODUCT.md` целиком — пользователи, обязательства бренда, доказательства на руках, что запрещено выдумывать.

Что уже есть и работает (логику не переписывать): маршруты `/`, `/work`, `/work/[slug]`, `/services`, `/services/[slug]`, `/start-project`, `/admin/*`; i18n RU/TG/EN в `lib/i18n/`; услуги в `lib/services.ts` (только RU — решение владельца); кейсы из БД через `lib/cases.ts`; секции лендинга в `components/sections/`, хром в `components/chrome/`, примитивы в `components/ui/`. Текущий визуал — предыдущая итерация; для этого этапа он **улика и анти-референс**, не авторитет.

## 3. STAGE GOAL

После этапа: главная целиком построена в мире «пентхаус-нуар» по контракту; токены мира в `app/globals.css` + Tailwind theme; header/footer в новом мире; сигнатурное взаимодействие «курсор — источник света» работает; страница прошла полный цикл проверки и открывается на preview-деплое.

OUT OF SCOPE: внутренние страницы (этап 2); SEO/OG, Lighthouse-тюнинг, DESIGN.md (этап 3); админка; любые изменения БД, API, Django; новые тексты владельца.

## 4. USERS & SCENARIOS

С телефона: открыл главную → за три секунды понял «один мастер, всё под контролем» → пролистал услуги и о себе → нажал заявку → `/start-project`. С десктопа: то же, плюс курсор-свет оживляет кромки и трек. Клавиатура: все контролы достижимы, фокус виден. `prefers-reduced-motion`: статичный, полностью освещённый вариант.

## 5. DESIGN

Контракт направления — `.impeccable/surfaces/app-page-tsx.md`, блок `## Direction contract`. Прочитай до кода; **не копируй в исходники**. Кратко: свет выхватывает детали из темноты; графит как матовый камень; панели без бордюров — кромка задана 1px тёплой линией со свечением; зерно; «кожа» на поднятых панелях; медь — единственный цвет; Unbounded (дисплей) + Onest (текст); радиусы 0–6px, прямые линии; потолочные «рёбра» в герое; фото как панорамное окно от пола до потолка; один LED-трек под заголовком; курсор — источник света; секции включаются из темноты один раз при скролле.

Lane Impeccable: brand. Мир заменяющий → плейбук `~/.claude/skills/impeccable/reference/new-work.md` §6 «Build with full commitment»; перед правкой UI загрузить `reference/craft-floor.md`.

ЗАПРЕЩЕНО (Mimi §5.3): бессмысленные градиенты и градиентный текст, glassmorphism, ряды одинаковых карточек с иконкой в квадратике, карточка в карточке, гигантские заголовки во всех секциях, блобы, Inter/Roboto, контраст ниже 4.5:1, стоковые улыбки, lorem ipsum, «въезжающие» секции с задержкой, parallax, одинаковые радиусы 16–24px на всём, шапка с 8 пунктами. От владельца: логотипы клиентов, цены, «100% довольных», «24/7», отзывы-заглушки, фото посторонних людей.

## 6. ARCHITECTURE & FILES

Создать/изменить: `app/globals.css` (токены мира, @font-face Unbounded), `tailwind.config.js` (theme под токены, радиусы 0/6), `components/ui/LightField.tsx` (новый: курсор-свет + LED-кромки через `pointermove` → CSS custom properties или Canvas 2D, ≤ 8 KB), `components/ui/Panel.tsx` (кромка светом вместо бордюра), `components/sections/{Identity,Capabilities,Method,Studio,Principles,Technology,StartProject,SiteFooter}.tsx`, `components/chrome/Header.tsx`, `app/page.tsx`. Удалить: `components/SmoothScroll.tsx` и его импорт в `app/layout.tsx`; зависимости `lenis`, `gsap`, `@gsap/react`, `framer-motion`, `split-type`.

НЕ ТРОГАТЬ: `app/api/**`, `app/admin/**`, `lib/**` (кроме нового ключа в `lib/i18n`, если строго нужен), `prisma/**`, `backend/**`, `docs/DEPLOYMENT.md`.

## 7. FEATURES — главная

**Header:** логотип `public/aly-logo.png` (h 24–28px; никогда текстом) + медная точка; ПРОЕКТЫ · УСЛУГИ · ОБО МНЕ · ПРОЦЕСС · КОНТАКТЫ, 11px, разрядка; одна кнопка «Обсудить проект» → `/start-project`; переключатель RU/TG/EN сохранить. На 390 — бургер, блокировка скролла, закрытие по Esc/клику вне.

**Hero (`Identity`):** во всю высоту. Фон — потолочные «рёбра»: 9–13 параллельных световых линий в лёгкой перспективе, яркость по расстоянию до курсора. Слева: `t.hero.eyebrow`; заголовок `t.hero.titleMain` + `t.hero.titleAccent` медью, четыре строки, Unbounded light/regular, не жирный; `t.hero.sub`; CTA «Смотреть работы» → `/work` — текст + тонкая линия + стрелка. Справа: `public/hero-portrait.jpg` как панорамное окно от пола до потолка, растушёвка только по кромкам, свечение по нижней кромке. Один LED-трек через экран под заголовком — ведущая линия, к которой регистрируется всё. Отражение заголовка в «тёмной поверхности» под ним: перевёрнуто, размыто, ≤ 6%. Медная кнопка заявки одна, у трека. Ниже 1024 — одна колонка, фото уходит в приглушённый фон.

**Услуги (`Capabilities`, id `services`):** тексты и цифры из `t.servicesSection` и `featuredServices` (5 карточек) — не менять. Карточки — низкие массивные панели «без ручек»: без бордюра, кромка светом сверху; `ServicePreview` остаются. Ссылка «Все услуги 14 →» на `/services`. Панель помощи — одна.

**Процесс (`Method`):** шаги из `t.process.steps`; длительность каждого — точной длиной сегмента LED-трека, не равными карточками. Фото `workspace-detail.jpg` как панель.

**О себе (`Studio`):** единственная светлая панель на странице — «дневной» контраст миров из брифа; `public/about-portrait.jpg` как сняли; факты плашками.

**Принципы, стек:** панели с кромкой-светом; чипы стека; фото `lifestyle-macbook.jpg`, `lifestyle-accessories.jpg` как панели.

**Заявка (`StartProject`):** широкая панель, `t.contact.title1/title2`, каналы из `t.contact.channels`, кнопка → `/start-project`. **Footer:** логотип крупно; ссылки `/work`, `/#services`, `#process`, `#studio`, `#start`.

**Состояния:** hover / focus-visible / active у всех ссылок и кнопок — как события света (кромка загорается), различимые между собой; empty на главной не нужен (кейсов на ней нет).

## 8. DATA & API — не применимо

Данные и API не меняются; `lib/cases.ts`, `lib/services.ts`, словари — только чтение.

## 9. TECH & VERSIONS

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS **3.4** (не v4 — обосновано в СОСТОЯНИИ), Prisma 6.19, Node 22 LTS. Новая зависимость только одна — `@fontsource/unbounded` 5.3.0 (subset latin + cyrillic, weights 300/400); перед установкой повтори `npm view @fontsource/unbounded version` и запиши число в отчёт. Motion (motion.dev 13.x) на этом этапе не добавлять — движение делается CSS transitions + `pointermove`; если понадобится оркестрация — обосновать в отчёте. Снять: `lenis`, `gsap`, `@gsap/react`, `framer-motion`, `split-type`.

## 10. QUALITY

Красиво: соответствие контракту; Impeccable audit 0 critical / 0 high; движение по `ecc:motion-foundations` — ease-out, ≤ 300 мс, только transform/opacity, reduced-motion выключает декоративное; все состояния реализованы; ни одного клише из блока 5.
Безопасно: секреты только в env; CSP и security headers в `next.config.js` не трогать; ни одного запроса к localhost из прод-кода.
Быстро: JS первого экрана ≤ 150 KB gzip (сейчас shared 103 KB — не превышать после снятия gsap/lenis); hero `priority` + AVIF/WebP + размеры; шрифты self-hosted subset, ≤ 2 семейства / ≤ 4 файла; CLS ≤ 0.1; LightField ≤ 8 KB и не блокирует главный поток.
Без багов: `tsc` 0 ошибок; сборка без warning; консоль 0; сеть 0 ошибок 4xx/5xx; 390 без горизонтального скролла; тач-цели ≥ 44px.
Подтверждение в отчёте: таблица «вьюпорт × статус» и размер бандла.

## 11. TOOLS PLAN — строго в этом порядке

1) Изучи `PRODUCT.md`, `.impeccable/surfaces/app-page-tsx.md`, `CLAUDE.md`, `components/sections/*`; 2) `/ecc:plan` — файлы, порядок, риски; жди подтверждения только если план расходится с промптом; 3) `node ~/.claude/skills/impeccable/scripts/context.mjs` один раз, затем `reference/new-work.md` §6 и `reference/craft-floor.md`; 4) Разработка: токены → LightField → Panel → хром → секции; `ecc:motion-foundations` как фоновые правила; в конце один прогон `node ~/.claude/skills/impeccable/scripts/detect.mjs --json <изменённые файлы>`, findings исправить сразу; 5) `ecc:motion-advanced` — ревью всего движения этапа; 6) `/impeccable audit` главной → исправить critical/high; 7) `/ecc:code-review` изменённых файлов + агент `ecc:react-reviewer`; 8) Панель браузера: 1440×900 / 768×1024 / 390×844 — скриншоты в `.impeccable/review/{desktop,tablet,mobile}.png`, чеклист (навигация, бургер, hover/focus/active, overflow, консоль, сеть), reduced-motion; исправить → повторить, не больше двух раундов; 9) агент `impeccable-finish-reviewer` с контрактом, скриншотами, findings детектора — действовать по disposition; 10) агент `ecc:a11y-architect` — клавиатура, фокус, контраст; 11) `ecc:verification-loop`: build → tsc → консоль; 12) preview-деплой на Vercel; 13) отчёт.

Дозировка §3.5: ECC-скиллы 3, агенты ECC 2, Emil-замены 2, команды Impeccable 1 + агенты плейбука.

## 12. ACCEPTANCE

[ ] Сборка зелёная, `tsc` 0, консоль 0 на трёх вьюпортах
[ ] Токены мира в `globals.css` и Tailwind theme; в компонентах нет hex-кодов
[ ] Все 8 секций + header/footer в новом мире; ни одного клише из блока 5
[ ] Курсор-свет и LED-кромки работают; reduced-motion даёт статичный освещённый вариант
[ ] Hero: рёбра, фото-окно, трек, отражение, четырёхстрочный заголовок; медь только на «продают.» и кнопке
[ ] hover / focus-visible / active различимы; тач-цели ≥ 44px
[ ] Impeccable audit 0 critical/high; finish-reviewer: ship, либо fix закрыт verdict pass
[ ] JS первого экрана ≤ 150 KB gzip; lenis/gsap/framer-motion/split-type удалены
[ ] 390: без горизонтального скролла, бургер работает
[ ] Preview-URL открывается

## 13. CONSTRAINTS

Не менять данные, API, Django, Prisma, админку. Не добавлять зависимости вне блока 9. Не трогать `docs/DEPLOYMENT.md`. Не отключать хуки и не добавлять ignore-правила. Не хардкодить секреты. Не переписывать тексты владельца. Не копировать контракт направления в исходники. Не оставлять TODO без строки в отчёте. Не пушить в `main` без команды владельца.

## 14. PLAN FIRST

Перед началом кратко изложи план: список файлов, порядок, риски, вопросы. Если план расходится с промптом или есть неоднозначность, которую нельзя решить из контракта, — остановись и спроси. Иначе приступай.

## 15. REPORT

Верни: (1) что сделано по секциям; (2) созданные/изменённые/удалённые файлы; (3) скриншоты трёх вьюпортов и таблица «вьюпорт × статус»; (4) результаты Impeccable audit, motion-ревью, code-review, finish-reviewer с disposition; (5) размер JS первого экрана и версия установленного шрифта; (6) состояния, спроектированные сверх контракта; (7) конфликты правил и как решены; (8) открытые вопросы; (9) preview-URL. Начни ответ с блока СОСТОЯНИЕ.
