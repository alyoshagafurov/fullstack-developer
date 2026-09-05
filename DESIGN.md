---
name: aly — penthouse-noir
description: A dark room where the cursor is a light source; graphite, warm white, one copper mark.
colors:
  graphite: "#0C0C0E"
  graphite-deep: "#070708"
  surface: "#121214"
  surface-raised: "#18181B"
  warm-white: "#F7F4F0"
  warm-white-bright: "#FFFFFF"
  copper: "#C0996F"
  copper-bright: "#D4AF87"
  copper-deep: "#A8845B"
  led: "#FFE9CE"
  day: "#EDE8E1"
  day-ink: "#17140F"
typography:
  display:
    fontFamily: "Unbounded, Onest, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 1.1rem + 2.6vw, 3.3rem)"
    fontWeight: 300
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Unbounded, Onest, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 1.15rem + 1.6vw, 2.4rem)"
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.02em"
  body:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  body-l:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body-s:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  micro:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
  input:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  menu:
    fontFamily: "Unbounded, Onest, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 300
    lineHeight: 1.2
  label:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.18em"
rounded:
  chip: "3px"
  control: "4px"
  panel: "6px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  panel-x: "24px"
  panel-y: "28px"
  beat-tight: "88px"
  beat: "112px"
  beat-wide: "144px"
components:
  button-primary:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.graphite}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.copper-bright}"
    textColor: "{colors.graphite}"
  button-primary-active:
    backgroundColor: "{colors.copper-deep}"
    textColor: "{colors.graphite}"
  button-solid:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.warm-white}"
    typography: "{typography.body}"
    rounded: "{rounded.chip}"
    padding: "0 10px"
    height: "28px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-y} {spacing.panel-x}"
  panel-raised:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-y} {spacing.panel-x}"
  panel-day:
    backgroundColor: "{colors.day}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.panel}"
    padding: "48px 40px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.panel}"
    padding: "16px 20px"
---

# Design System: aly — penthouse-noir

## Overview

**Creative North Star: "Пентхаус ночью"**

Сайт — одна тёмная комната из графита, в которой свет выхватывает детали. Стены и панели не отделены бордюрами: каждую поднятую плоскость выдаёт одна тёплая линия по верхней кромке, и она загорается там, где проходит курсор. Один цвет — медь — появляется на слове, на котором заканчивается заявление, на главной кнопке и на точке у логотипа; остальное — тёплый белый на графите, зерно и «кожа» на поднятых панелях. Свет здесь — материал, а не украшение: он делает работу бордюров, теней, ховеров и фокуса.

Плотность — editorial: заголовки некрупные и лёгкие (Unbounded 300), текст короткими мерами, между секциями воздух неравной длины. Ничего не въезжает и не скользит: секция включается один раз, когда до неё дошли, и кромки в ней вспыхивают на 300 мс. Отвергнуто явно: градиентный текст, стекло, ряды одинаковых карточек с иконками, гигантские заголовки в каждой секции, параллакс, круглые «пилюли» и одинаковые большие радиусы.

**Key Characteristics:**
- Кромка вместо бордюра: 1px тёплая линия, которая горит.
- Курсор — источник света; без курсора свет отдыхает у «лампы», при reduced-motion — горит всё.
- Один цвет (медь `{colors.copper}`), одна дисплейная гарнитура в одном весе.
- Прямые линии, радиусы 3–6 px, никаких скруглённых пилюль.
- Панели читаются как ступени одного камня: графит → surface → surface-raised.

## Colors

Графит с каплей тона, тёплый белый как краска (не свечение), медь как единственный цвет, тёплый свет LED как материал.

### Primary
- **Copper** (`{colors.copper}`): акцентное слово заголовка, основная кнопка («Обсудить проект»), точка у логотипа, активный номер на треке, ошибка формы. Hover-тон `{colors.copper-bright}`, нажатие `{colors.copper-deep}`.

### Neutral
- **Graphite** (`{colors.graphite}`): фон всего сайта. Не чистый чёрный — матовый камень, который может поймать свет.
- **Graphite deep** (`{colors.graphite-deep}`): пол — футер и самые глубокие области.
- **Surface** (`{colors.surface}`) и **Surface raised** (`{colors.surface-raised}`): панели — тот же камень на ступень светлее; raised несёт текстуру «кожи» и используется для панелей-призывов и активного варианта в формах.
- **Warm white** (`{colors.warm-white}`): основной текст; вторичный — тот же цвет на 72 % и 52 % альфы (`--ink-2`, `--ink-3`); минимум контраста в системе 5.18:1.
- **LED** (`{colors.led}`): свет кромок и трека — тёплый белый, ореол вокруг него — медь на низкой альфе.
- **Day** (`{colors.day}`) / **Day ink** (`{colors.day-ink}`): единственная светлая панель («О себе») — дневной контраст миров; текст на ней — тёмная краска, разделители — `rgb(23 20 15 / 0.14)`.

### Named Rules
**The One Colour Rule.** Медь — единственный цвет. Она появляется на одном слове, на главной кнопке экрана и на знаках состояния; свет комнаты лишь подкрашен ею. Второго цвета нет и для ошибок: ошибка — это медь плюс текст.
**The Warm Line Rule.** Любая граница — это свет, а не бордюр: 1px `rgb(247 244 240 / 0.10)` выключенная, `{colors.led}` включённая. `border` допустим только как волосяная линейка между строками одного леджера.

## Typography

**Display Font:** Unbounded (with Onest, system-ui)
**Body Font:** Onest (with system-ui)
**Label Font:** Onest, разрядка 0.18em, капитель

**Character:** Широкий лёгкий дисплей, который читается как надпись на стене, и тихий гротеск для всего остального. Дисплей никогда не бывает жирным — вес 300 единственный; 400 разрешается в тот же файл.

### Hierarchy
- **Display** (300, `clamp(1.9rem, 1.1rem + 2.6vw, 3.3rem)`, 1.08): заявление героя в четыре строки, заголовки страниц (h1).
- **Headline** (300, `clamp(1.6rem, 1.15rem + 1.6vw, 2.4rem)`, 1.12): заголовок секции (h2), стоящий на рейке.
- **Title** (500, 15px, 1.25, капитель с разрядкой 0.02em): названия услуг и панелей, строки леджеров.
- **Body** (400, 15px, 1.7; **Body L** 16px для описаний и подводок страниц): текст; мера 44–52ch в подводках, до 62ch в описаниях.
- **Body S** (400, 14px, 1.6): строки леджеров, ссылки футера, каналы. **Caption** (13px, 1.55): тэглайны, подсказки, ошибки. **Micro** (12px): чипы и номера сегментов.
- **Input** (400, 17px, 1.5): значение в поле брифа. **Menu** (Unbounded 300, 22px): пункты мобильной шторки.
- **Label** (500, 11px, 0.18em, капитель): счётчики на рейках, подписи полей, навигация, метки в леджерах — нижняя граница размера на сайте.

### Named Rules
**The Never-Bold Rule.** Ни один заголовок не тяжелее 300 в Unbounded и 500 в Onest; иерархия строится размером и светом, не весом.
**The Nameplate Rule.** Над заголовком нет кикера: заголовок сам стоит на рейке и прерывает линию, счётчик — в конце рейки.

## Layout

Оболочка `.shell` шириной до 1440px с отступом `clamp(16px, 4vw, 48px)`; 12-колоночная сетка там, где секция расставляет блоки по колонкам. Герой построен на full-bleed-сетке `.stage` (колонки full-start | gutter | shell | gutter | full-end), чтобы LED-трек прошёл через весь экран, а слова остались на сетке. Панели в секциях разделены зазором 8–12px, не линейками. Ритм секций нарочно неровный: `beat-tight` 64/88px, `beat` 88/112px, `beat-wide` 120/144px (мобильный/≥768). Шапка фиксирована (64/80px), прозрачна над первым экраном и становится сплошной с горящей нижней кромкой после 24px скролла; ниже 1024px навигация уходит в шторку. Три вьюпорта проверки: 1440 / 768 / 390; на 390 — одна колонка, фото героя уходит в приглушённый фон.

## Elevation & Depth

Теней-как-глубины нет. Глубина — тональные ступени одного камня (graphite → surface → surface-raised) и свет по кромке: `.led` рисует выключенную линию, горящую линию и «пул» — радиальный градиент с центром в курсоре, замаскированный до линии и полосы 48px под ней. Свечения (`box-shadow: 0 0 14px 1px rgb(192 153 111 / 0.35)`) — это свет от линии, а не тень от объекта; они статичны, анимируется только opacity. Поднятые панели получают текстуру «кожи» (SVG-шум, `background-blend-mode: soft-light`), а комната — фиксированный слой зерна 4.2 %.

### Shadow Vocabulary
- **Edge glow** (`box-shadow: 0 0 14px 1px rgb(192 153 111 / 0.35)`): под горящей линией кромки.
- **Control ring** (`box-shadow: 0 0 0 1px rgb(255 233 206 / 0.55), 0 0 22px 2px rgb(192 153 111 / 0.24)`): hover/focus кнопок, через opacity.
- **Stamp** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.22), inset 0 -1px 0 rgb(0 0 0 / 0.4)`): медная кнопка «оттиснута», стоит на рейке как переключатель.

### Named Rules
**The Light-Not-Shadow Rule.** Поверхности плоские; всё, что похоже на тень, — свет от кромки и появляется только как ответ на состояние (hover, focus, active, включение секции).

## Shapes

Прямые линии. Панели 6px, контролы 4px, чипы 3px; ничего круглого, кроме точек-меток. Фото — прямоугольные окна с растушёвкой только по кромкам (маски), никакого скругления снимков. Линии — волосяные 1px; рейки и трек — 1px свет.

## Components

### Buttons
- **Shape:** прямые углы, радиус контрола (4px), высота 48px, горизонтальный отступ 24px, Onest 500 14px.
- **Primary (copper):** `{colors.copper}` на `{colors.graphite}`, «оттиснута» (см. Stamp). Hover: `{colors.copper-bright}` + кольцо света (opacity 0→1, 260 мс). Active: `{colors.copper-deep}` и сдвиг на 1px вниз. Один на экран.
- **Solid:** тёплый белый на графите; hover — чистый белый.
- **Ghost:** прозрачная, 1px кромка `rgb(247 244 240 / 0.20)`, при hover — кольцо света; active — заливка 5 % белого.
- **Text link (`.lnk`):** линия света под текстом появляется через opacity; active — медь.
- Focus-visible везде: outline 1px `{colors.led}` со смещением 3px (на дневной панели — тёмная краска).

### Chips
- **Style:** очень маленькая панель — фон 4 % белого, 1px световая кромка сверху, радиус 3px, 12px текст на 72 % альфе, высота 28px.
- **State:** без интерактивных состояний; чипы — факты (стек, технологии кейса).

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** `{colors.surface}`; raised — `{colors.surface-raised}` + кожа; day — `{colors.day}`.
- **Shadow Strategy:** нет; верхняя кромка — `.led` (пул под курсором, полная линия при hover 0.55 / focus 1 / active 1 / включении секции — вспышка 300 мс).
- **Border:** нет. Внутри леджера строки делит 1px `rgb(247 244 240 / 0.10)`.
- **Internal Padding:** 20–24px на телефоне, 24–36px от 768.
- **Interactive panel** (ссылка-панель): `lit` + `group`; стрелка сдвигается на 4px, текст подсвечивается; на 390 панели остаются низкими «ящиками».

### Inputs / Fields
- **Style:** поле — панель `{colors.surface}` без обводки; подпись 11px капителью в верхнем левом углу, значение 17px, `placeholder` 52 % альфы; нижняя кромка `.led` без покойного пула (`led-flat`).
- **Focus:** нижняя кромка загорается до 1 (`:focus-within`), outline у самого поля отключён.
- **Error:** кромка держится включённой, сообщение 13px медью с `role="alert"`, `aria-invalid`. Варианты выбора — низкие панели с меткой 6×6px (медь у выбранного), радиогруппа с roving tabindex.

### Navigation
- **Style:** 5 пунктов 11px капителью с разрядкой 0.18em, 52 % альфы → белый при hover, под пунктом — линия света; переключатель RU/TG/EN кнопками с `aria-pressed`; одна ghost-кнопка заявки.
- **Mobile (< 1024):** бургер 44×44, шторка сверху (диалог с блокировкой скролла, Esc, кольцо Tab), пункты в Unbounded 22px, язык и медная кнопка внизу шторки.

### Rail (signature)
Секцию открывает рейка: 1px световая линия на высоте заголовка; заголовок стоит на ней как табличка (фон графита прерывает линию), счётчик — в конце линии. Никаких надписей над заголовком.

### LED edge & LightField (signature)
`components/ui/LightField.tsx` пишет положение курсора (`--mx`, `--my`) в каждый элемент с `data-light`; CSS рисует пул света с центром в курсоре на кромках панелей, рёбрах потолка героя и треке. Три режима: `cursor` (свет следует), `touch` (свет отдыхает у верхней кромки), `static` (reduced-motion: горит всё, ничего не движется). Секции включаются один раз через IntersectionObserver: opacity 0→1 и вспышка кромок; движения и стаггеров нет.

### Process track (signature)
Семь шагов — сегменты одного трека неравной длины (пропорции проекта, без чисел); активный сегмент держит кромку включённой, это табы с клавиатурой; readout-панель показывает текст шага. В брифе тот же трек — 8 сегментов прогресса (пройдено 0.4 / текущий 1 / впереди выключен).

## Do's and Don'ts

### Do:
- **Do** делать границу светом: `.led` на верхней кромке панели, `border` — только как линейка внутри леджера.
- **Do** держать медь редкой: одно слово, одна кнопка на экран, знаки состояния.
- **Do** ставить заголовок на рейку и счётчик в её конец; секцию открывает рейка, не кикер.
- **Do** оставлять фото как сняты: маски по кромкам, `object-fit: cover`, без фильтров и перекраски.
- **Do** анимировать только opacity и transform, ≤ 300 мс, `cubic-bezier(0.22, 1, 0.36, 1)`; под `prefers-reduced-motion` — статичный полностью освещённый вариант.

### Don't:
- **Don't** использовать градиентный текст, стекло, блобы, параллакс, въезжающие секции.
- **Don't** рисовать пилюли и радиусы больше 6px; не скруглять фотографии.
- **Don't** ставить второй цвет ни для ошибок, ни для ссылок, ни для графики.
- **Don't** делать заголовки жирными и «гигантскими» в каждой секции; иерархию несут размер и свет.
- **Don't** выкладывать ряды одинаковых карточек с иконками и карточку в карточке; список — леджер в одной панели.
- **Don't** заменять логотип текстом или перерисовывать его; `public/aly-logo.png` — единственный знак.
