---
name: aly.lat
description: A loud, airy personal studio site. Wide heavy capitals on warm paper, black sections that turn grey into colour, and a bento of small living tiles, with one orange.
colors:
  paper: "#efeee9"
  paper-raised: "#ffffff"
  paper-sunk: "#e3e1da"
  ink: "#0f0f0f"
  ink-2: "#55534e"
  ink-3: "#6f6c66"
  seam: "rgb(15 15 15 / 0.1)"
  seam-2: "rgb(15 15 15 / 0.2)"
  night: "#0a0a0a"
  night-raised: "#161616"
  night-sunk: "#232323"
  night-ink: "#f2f1ec"
  night-ink-2: "#a9a6a0"
  night-ink-3: "#8e8b85"
  night-seam: "rgb(242 241 236 / 0.12)"
  night-seam-2: "rgb(242 241 236 / 0.24)"
  signal-orange: "#ff5a1f"
  whatsapp-green: "#25d366"
typography:
  display-hero:
    fontFamily: "Unbounded, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 9vw, 9rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  display:
    fontFamily: "Unbounded, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6.6vw, 6.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Unbounded, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.6vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  inset: "20px"
  screenshot: "22px"
  tile: "28px"
  card: "32px"
  block: "36px"
  pill: "9999px"
spacing:
  gutter-sm: "20px"
  gutter-md: "40px"
  bento-gap: "12px"
  tile-pad: "24px"
  section-sm: "96px"
  section-lg: "144px"
  column: "1320px"
  column-wide: "1440px"
components:
  button-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "52px"
    typography: "{typography.label}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "52px"
  bento-tile:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "{spacing.tile-pad}"
  bento-tile-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    rounded: "{rounded.tile}"
    padding: "{spacing.tile-pad}"
  stack-card:
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  screenshot-frame:
    backgroundColor: "{colors.paper-sunk}"
    rounded: "{rounded.screenshot}"
  closing-block:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.block}"
    padding: "80px 24px"
  header-quote:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
---

# Design System: aly.lat

## Overview

**Creative North Star: "The Poster Studio"**

The site is a sequence of posters, not a scrolling document. Each section is one poster: one enormous headline in wide, heavy Unbounded capitals, one quiet line of Manrope beneath it, and one living thing (a lens, a counter, a stack, a running line of words). Warm off-white paper and near-black alternate section by section, so the page reads like prints pinned up in turns on a light wall and a dark one. There is no theme switch. Tone belongs to the section, not to the visitor.

Three moves give the world its character. Pictures are set inside headlines as if they were words: round-ended capsules that open in width as the sentence arrives. On black, the owner's photo and the screenshots wait in grey and turn to colour, through a round lens that follows the pointer (and drifts by itself on touch) or as a screenshot reaches the middle of the screen. And useful facts sit in a bento of small rounded tiles, each with its own small motion: a count rising, the Dushanbe clock with an online dot, a ring filling, tools running past, reviews changing by themselves.

There is a lot of air. Sections breathe at 96 to 144px vertically, and the headline carries the whole section. Every section is built differently from the one before it. Motion is lively but never required: reduced motion stops every loop and reveal, and nothing is hidden before the motion script arrives.

**Key Characteristics:**
- Wide heavy uppercase display (Unbounded 800) against a calm humanist text face (Manrope).
- Light and dark alternate by section through `data-tone`, never through a theme toggle.
- One orange accent for markers, dots, rings, underlines and the badge; WhatsApp green only on WhatsApp doors.
- Grey-to-colour as the reveal for photographs and screenshots on black.
- Generous, rounded containers (20 to 36px) with everything interactive as a full pill.
- One headline and one line per section; no enumerated text lists.

## Colors

A warm two-tone ground (paper and night) with a single hot orange and a functional green.

### Primary
- **Signal Orange** (`signal-orange`): the one accent. Used for marker dots between marquee words, the filling progress ring, the underline of "more" links, the centre disc of the rotating badge, the focus ring, text selection, the input caret and form focus halo (at 20% alpha). On black it may colour large type on hover; on paper it stays a fill, a dot or a line.

### Secondary
- **WhatsApp Green** (`whatsapp-green`): reserved for WhatsApp. The full-width WhatsApp bento tile, the round WhatsApp button in the sticky bar, and the "online now" dot on the clock tile. Never decorative.

### Neutral
- **Warm Paper** (`paper`): the default ground of every section and the warm block inside the closing section.
- **Raised Paper** (`paper-raised`): bento tiles, alternate inner-page bands, the footer.
- **Sunk Paper** (`paper-sunk`): the empty state behind a screenshot while it loads, and the track of the progress ring.
- **Ink** (`ink`), **Ink 2** (`ink-2`), **Ink 3** (`ink-3`): headline, quiet line and meta text on paper. Ink 3 sits exactly at 4.5:1 on paper; it is the floor, not a step to go lighter from.
- **Seam** (`seam`), **Seam 2** (`seam-2`): hairlines (marquee rules, price rows, the header once scrolled) and the outline-button stroke.
- **Night** (`night`), **Night Raised** (`night-raised`), **Night Sunk** (`night-sunk`), **Night Ink 1-3**, **Night Seam 1-2**: the same roles re-pointed for a `data-tone="dark"` section. Stacked work cards use Night Raised on Night.

### Named Rules
**The Section Owns the Tone Rule.** A section is either `data-tone="dark"` or paper; tokens are re-pointed in place and components never pick a light or dark colour themselves. A paper island inside a black section (the closing block) declares `data-tone="light"`. The header reads the section under it and flips its own tone to match.

**The One Orange Rule.** Signal Orange is the only accent. It marks, it never fills a section, and on paper it is never used as reading text (2.7:1 against paper).

**The Green Means WhatsApp Rule.** Green appears only where a tap opens WhatsApp or reports that he is answering now.

## Typography

**Display Font:** Unbounded (with ui-sans-serif, system-ui)
**Body Font:** Manrope (with ui-sans-serif, system-ui)

**Character:** Unbounded is wide, round and heavy, set in capitals with tight tracking so a headline locks into a block that reads as an image. Manrope is plain and warm, and it only ever speaks quietly beside it. Both carry Cyrillic; the site is bilingual.

### Hierarchy
- **Display Hero** (800, clamp(2.75rem, 9vw, 9rem), 0.95, uppercase): his name on the lens screen, one word per line, each rising out of its own mask.
- **Display** (800, clamp(2.25rem, 6.6vw, 6.5rem), 1.02, -0.03em, uppercase): the one headline of every section and every inner page. Pages may push it larger (the statement at up to 7.75rem, the closing at up to 7.5rem, the next-case link at up to 8rem) or smaller (inner page heads at up to 5rem), but never change face, weight or case.
- **Marquee Words** (Unbounded 800, clamp(3rem, 9vw, 8.5rem), 1, uppercase): the running line of directions.
- **Headline** (700, clamp(1.375rem, 3vw, 2.5rem), 1.05, uppercase): card titles, tile statements, case section names.
- **Tile Figures** (Unbounded 800, about clamp(2.5rem, 5vw, 4.5rem), 1, tabular figures): counter, clock, prices inside tiles.
- **Lead** (Manrope 400, clamp(1.0625rem, 1.6vw, 1.25rem), 1.5, Ink 2): the one quiet line under a headline.
- **Body** (Manrope 400, 0.9375rem, 1.6, Ink 2, max 40ch): short notes beside a headline.
- **Label** (Manrope 600, 0.8125rem, 1.3, Ink 2, sentence case): a tile's name, a review's author, a screenshot caption.

### Named Rules
**The One Shout Rule.** Each section has one Unbounded headline and one Manrope line. A second display-sized line in the same section is a new section.

**The Words-as-Pictures Rule.** An image may sit inside a display headline as a capsule 0.8em tall with fully round ends, aligned to the baseline, that grows from zero width as the line enters view.

## Layout

Two columns of fixed width carry everything. The reading column is 1320px wide with 20px side gutters (40px from 768px). The wide column is 1440px with 12px gutters (24px from 768px) and holds the bento, the work stack and full-bleed pictures. Sections breathe at 96px top and bottom on phones and 128 to 144px from 768px; inner page heads start at 128 to 160px to clear the fixed header.

A section's headline and its quiet line usually sit on opposite sides at the bottom edge: headline left, line and actions below it or right-aligned beside it, with the round badge pushed to the far right. Inner pages use a 12-column grid from 1024px for the headline and note pairing (7 + 4 columns, often mirrored on the next band).

The bento is 2 columns on phones and 4 from 768px, with a 12px gap and rows of at least 200px; the portrait tile spans 2 by 2 and the WhatsApp tile spans the full width at the bottom. Work cards stack: each sticks 18px lower than the one before (starting at 4.5rem), so they pile under the header as you scroll.

**The Every Section Different Rule.** No two adjacent sections share a composition. A lens, a sentence with pictures, a bento, a stack, a running line and a closing block follow each other on the home page; inner pages alternate paper, raised paper and night bands.

## Elevation & Depth

The system is flat and tonal. Depth comes from tone (night under paper, raised paper on paper), from pictures moving from grey to colour, and from things physically stacking. There is one structural shadow, on the stacked work cards, cast upward so each card darkens the one it covers. The sticky request bar carries a soft drop so it floats over any section. The header becomes an 80% translucent, blurred band once the page has moved.

### Shadow Vocabulary
- **Stack shadow** (`box-shadow: 0 -30px 60px -30px rgb(0 0 0 / 0.9)`): only on work cards that pile on scroll.
- **Floating bar** (`box-shadow: 0 10px 30px -12px rgb(0 0 0 / 0.45)`): only on the sticky request and WhatsApp buttons.
- **Screenshot hairline** (`box-shadow: 0 0 0 1px` Seam): the edge of every screenshot frame, not a lift.

### Named Rules
**The Grey Until Seen Rule.** On black, photographs and screenshots start in greyscale (contrast 1.05) and come into colour over 900ms when they reach the middle band of the screen, under the pointer, or inside the lens. Colour is the reward for attention.

## Shapes

Everything is soft and large. Containers have generous radii that grow with their size: an inset picture 20px, a screenshot 22px, a bento tile 28px, a stacked card 32px, the closing block 36px. Every control is a full pill or a full circle: buttons, the language switch, tool chips, the arrow discs on tiles, the round badge. Lines are hairlines at 10 to 20% of the ink colour. Nothing is square-cornered except the full-bleed sections themselves.

**The Round Lens Rule.** Circles carry meaning here: the colour lens, the rotating badge, the online dot, the progress ring, the arrow discs. A new interactive marker should be round before it is anything else.

## Components

### Buttons
- **Shape:** full pill (9999px), at least 52px tall, 28px side padding, Manrope 600 at 1rem, with a 0.6rem gap for an icon.
- **Solid:** Ink ground with Paper text; inside a dark section it inverts automatically (light ground, black text). Hover lifts it 1px over 250ms on the gallery ease.
- **Line:** transparent with a 1.5px Seam 2 stroke and Ink text; hover darkens the stroke to Ink. Used for WhatsApp, Telegram and "visit the site".
- **Header request:** a smaller solid pill (40px) in the header from 768px.
- **Focus:** a 2px Signal Orange outline at 3px offset on every focusable element.

### Chips
- **Tool chips:** Paper pills inside a raised tile, Manrope 600, 16px by 10px padding, running sideways in an endless loop over 22s.

### Cards / Containers
- **Bento tile:** Raised Paper, 28px radius, 24 to 28px padding, content pinned top and bottom (name and figure). A tile may declare `data-tone="dark"` to become a night tile inside the paper grid (the prices tile).
- **Stacked work card:** Night Raised, 32px radius, 16 to 24px padding, title row in Headline type with year and an "open" link, then a 20px-radius screenshot at 16:10 (16:8 from 768px) that colours up and scales 2% on hover.
- **Screenshot frame:** Sunk Paper behind, 22px radius, a hairline edge, image clipped.
- **Closing block:** a Paper island (36px radius) inside a black section, with the headline, the line, a solid and a line button, and the badge.

### Inputs / Fields
- **Style:** the request and review forms inherit the section tokens; field labels and form headings switch to Unbounded 800 uppercase.
- **Focus:** the border darkens to Ink with a 4px Signal Orange halo at 20% alpha; the caret is orange.

### Navigation
- **Header:** fixed, 56px (64px from 768px), wordmark left (inverted on dark), Manrope 500 links at 0.875rem in Ink at 75% that sharpen to full Ink on hover or when current, a round language switch, the request pill. Transparent at the top, then an 80% blurred band with a hairline. It flips its own tone to match the section under it.
- **Mobile menu:** below 1024px a full-screen Paper panel; the links are Unbounded 800 uppercase at 1.75rem, each rising in a little after the one before, followed by the request and WhatsApp buttons and a quiet contact line.
- **Sticky request bar:** a solid Ink pill and a round green WhatsApp button that rise from below the fold after the first screen and sink away when a section with its own doors (lens, closing), the menu or a form page is on screen.
- **Footer:** Raised Paper, quiet Manrope 0.8125rem, links in Ink 2 that darken on hover.

### Colour Lens Hero
His photograph fills the black first screen (100svh, at least 600px) in greyscale at 50% opacity; a second, full-colour copy shows only through a radial mask (radius clamp(120px, 16vw, 220px)) centred on the pointer, or drifting in a slow figure on touch screens. A gradient darkens the bottom for his name in Display Hero type, the offer line, and a solid and a line button.

### Rotating Badge
A 128 to 144px circle of Unbounded 700 text set on a circular path, rotating once every 16s, around a 56px Signal Orange disc holding an arrow that turns 45 degrees on hover. It is always a WhatsApp door.

### Directions Marquee
One endless line of huge uppercase direction words between two hairlines, each separated by an orange dot and each a link into the request form with that direction chosen; a word turns orange under the pointer. The loop runs 28s. Its accessible copy is the first set only.

### Living Bento
The tiles of concept E: a counter rising to its number over 1.8s, the Dushanbe clock (refreshed every 15s) with a green "online" or orange "offline" dot, a ring that draws itself over 2.2s, the price from, the tools loop, a review that changes every 6s with a 12px rise and fade, his portrait tile with an arrow disc, and the full-width WhatsApp tile with a pinging ring.

### Motion
One script reads attributes from the markup: `data-rise` lifts headline lines out of their masks (1.25s, expo out, 0.09s stagger), `data-fade` settles an element up 48px from a 6px blur (1.3s), `data-colour` turns grey to colour mid-screen, `data-gallery` pins a horizontal track on wide screens. Reveals only apply to elements that start below the fold. Smooth scroll is for wheels and trackpads only. The house ease is `cubic-bezier(0.16, 1, 0.3, 1)`.

## Do's and Don'ts

### Do:
- **Do** give every section exactly one Unbounded 800 uppercase headline and one Manrope line, with at least 96px of air above and below.
- **Do** set tone by section with `data-tone="dark"` or `data-tone="light"` and let the tokens follow; never hard-code a light or dark colour inside a component.
- **Do** keep photographs and screenshots grey on black until they are seen, and bring them to colour through the lens, the middle of the screen, or the pointer.
- **Do** make every control a pill or a circle, and every container a large soft rectangle (20 to 36px).
- **Do** give a new section its own living behaviour (a count, a loop, a stack, a reveal) and make it stop cleanly under reduced motion.
- **Do** keep Signal Orange to markers, dots, rings, underlines and the badge disc.

### Don't:
- **Don't** add a light/dark theme switch; tone belongs to the section.
- **Don't** write enumerated text lists or bullet grids of features; one fact becomes one tile, one headline, or one running word.
- **Don't** repeat a section's composition directly after itself.
- **Don't** use Signal Orange for reading text on paper, or use green for anything that is not WhatsApp or online status.
- **Don't** bring back Pacifico, BBH Bogle or any script or system display face; display is Unbounded, everything read is Manrope.
- **Don't** hide content until a script arrives; reveals start from a visible state.
