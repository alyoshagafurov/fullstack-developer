---
name: aly.lat
description: A clean personal studio site in the manner of apple.com, in two themes. One headline, one quiet line and the picture, then a lot of air.
colors:
  wall: "#ffffff"
  wall-2: "#f5f5f7"
  wall-3: "#e8e8ed"
  bone: "#1d1d1f"
  bone-2: "#6e6e73"
  bone-3: "#86868b"
  brass: "#0071e3"
  seam: "rgb(0 0 0 / 0.08)"
  seam-2: "rgb(0 0 0 / 0.16)"
  dark-wall: "#000000"
  dark-wall-2: "#161617"
  dark-wall-3: "#1d1d1f"
  dark-bone: "#f5f5f7"
  dark-bone-2: "#a1a1a6"
  dark-brass: "#2997ff"
  dark-seam: "rgb(255 255 255 / 0.12)"
  dark-seam-2: "rgb(255 255 255 / 0.24)"
typography:
  display:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6.4vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3.6vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.9vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: "-0.005em"
  note:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 300
    lineHeight: 1.6
  label:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
  signature:
    fontFamily: "Pacifico, cursive"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  focus: "6px"
  screenshot: "18px"
  tile: "28px"
  portrait-top: "32px"
  pill: "9999px"
spacing:
  gutter: "1.25rem"
  gutter-md: "2rem"
  tile-gap: "0.75rem"
  screen: "6rem"
  screen-md: "9rem"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 1.375rem"
    height: "2.75rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.brass}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 1.375rem"
    height: "2.75rem"
  button-outline-hover:
    backgroundColor: "{colors.brass}"
    textColor: "#ffffff"
  link-more:
    textColor: "{colors.brass}"
    typography: "{typography.body}"
  tile:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone}"
    rounded: "{rounded.tile}"
    padding: "3rem 1.5rem 0"
  screenshot:
    backgroundColor: "{colors.wall-3}"
    rounded: "{rounded.screenshot}"
  header-bar:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.bone}"
    height: "3.5rem"
  header-request:
    backgroundColor: "{colors.brass}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0 0.875rem"
    height: "2rem"
---

# Design System: aly.lat

Scope: the public site only (`app/(site)/[lang]/**`, `body.museum`). The admin and the Telegram Mini App keep the older studio tokens at the top of `app/globals.css` and are not described here. The site's class names come from an earlier look (wall, bone, brass, hall, exhibit). They now mean background, text, accent, page column and screenshot.

## Overview

**Creative North Star: "The Product Page"**

Each screen of the site works like a screen on apple.com. It has one big heavy headline in mixed case, one quiet line under it, at most two pill buttons or a chevron link, and then the picture: his photograph or a screenshot of the work. Everything else is air. The page gets its rhythm from alternating bands: white and #f5f5f7 in the light theme, black and #161617 in the dark one, with some bands that are dark in either theme. The owner chose this world. It replaced the earlier "dark house" world, and nothing from that world (room lighting, lamps, BBH Bogle) carries over.

The site has two equal themes. The light theme uses Apple's white and very light grey with a near-black text and the #0071e3 blue. The dark theme uses Apple's Pro-page black with an off-white text and the #2997ff blue. Both themes share every class and only the variables change. Where a theme needs a different picture, the picture is swapped rather than tinted.

Density is low on purpose. The owner's rules are: one big headline and one small line per screen, a lot of air, no enumerated text lists, and a clean page.

**Key Characteristics:**
- Two full themes on `<html data-theme>`, plus fixed-tone sections (`data-tone="dark"` / `"light"`).
- One type family, Nunito Sans: 800 for headlines, 400 for the lead line, 300 for small print.
- Centered composition: headline, line, actions, picture.
- Pill buttons, chevron text links, 28px tiles and 18px screenshots.
- Flat surfaces. Depth comes from tone changes and a hairline, not from shadows.

## Colors

The palette is neutral with one accent. Greys sit close to Apple's own values, and a single blue (a different blue in each theme) carries every action.

### Primary
- **Action Blue** (`brass` light / `dark-brass` dark): filled pill buttons, outlined pill borders, chevron text links, the header's request pill, the selection highlight, the focus ring and the form caret. Nothing decorative is blue.

### Neutral
- **Paper White / Pro Black** (`wall` / `dark-wall`): the default page band, and the inside of Choices tiles.
- **Apple Mist / Graphite** (`wall-2` / `dark-wall-2`): alternate bands (Hero, Choices, Draft, inner page openings, footer) and the default tile fill.
- **Silver Well / Deep Graphite** (`wall-3` / `dark-wall-3`): the background behind a screenshot while it loads, and the carousel's dot pill and play button.
- **Ink / Frost** (`bone` / `dark-bone`): headlines, lead lines and primary text.
- **Slate / Ash** (`bone-2` / `dark-bone-2`): secondary lines under headlines, small print and quiet links.
- **Pewter** (`bone-3`, the same in both themes): small labels and carousel dots at rest. See the contrast rule below.
- **Hairline** (`seam` / `dark-seam`, `seam-2` / `dark-seam-2`): the 1px ring around screenshots, the header's bottom edge, price-list dividers and input borders.

### Named Rules
**The Variable Swap Rule.** A theme only redefines the `--color-*` variables, on `html[data-theme='dark']` and on `[data-tone]` sections. Components never hard-code a theme's hex. The one exception is white text on a filled blue pill. Tailwind's `dark:` variant matches both the dark theme and any `data-tone="dark"` section.

**The Fixed Tone Rule.** `data-tone="dark"` makes a section dark in both themes (the Feature, the Closing, and tiles 2 and 3 of every four in the Tiles grid). `data-tone="light"` keeps a section light in both. Use fixed tones to create the black-and-white rhythm, not to style a single element.

**The Small Text Contrast Rule.** Text under 18px must reach 4.5:1 against the surface it sits on. In the light theme, Pewter `#86868b` measures 3.6:1 on white and 3.3:1 on Mist, so small labels in that theme belong in Slate. Pewter is safe for small text only on dark surfaces.

## Typography

**Display Font:** Nunito Sans, loaded with `next/font` and the `wdth` axis (falls back to ui-sans-serif, system-ui)
**Body Font:** Nunito Sans
**Signature:** Pacifico, used only for his signature in the Closing

**Character:** The headlines are heavy and tight, and Nunito Sans's rounded terminals give them some warmth. The rest of the text is light and plain. The site uses one family, the way Apple does.

### Hierarchy
- **Display** (800, `clamp(2.5rem, 6.4vw, 5.5rem)`, 1.04): the one headline of each screen and of each inner page opening. It is always mixed case. Single statement screens (Draft, the service price figure) push it larger, up to `clamp(3rem, 9vw, 9rem)`.
- **Headline** (800, `clamp(1.75rem, 3.6vw, 3rem)`, 1.08): tile and choice titles, and section titles on inner pages.
- **Lead** (400, `clamp(1.125rem, 1.9vw, 1.5rem)`, 1.35): the one quiet line under a headline. It is balanced, centered and limited to about `max-w-2xl`.
- **Body** (400, 17px): button and link text, tile captions (16px) and review quotes (600, `clamp(1.25rem, 2.2vw, 1.875rem)`).
- **Note** (300, 15px, 1.6, max 38ch): small print for readers who want it, in Slate.
- **Label** (600, 12px, +0.02em, mixed case): field names in definition lists (contacts, thanks page, a service's "for whom") and work meta (client, year). It is never uppercase and never placed above a headline.
- **Signature** (Pacifico 400, 2rem): his name at the end of the Closing, and nowhere else.

### Named Rules
**The One Headline Rule.** Each screen has one Display headline and one Lead line. A second headline-sized element on the same screen starts a new screen.

**The One Family Rule.** All text is Nunito Sans. Pacifico appears only in the signature.

## Layout

Two columns frame everything. The **hall** column is 1100px wide, with 1.25rem gutters that grow to 2rem from 768px. It holds headlines and text. The **hall-wide** column is 1440px wide, with 0.75rem gutters that grow to 1.25rem. It holds the header bar and the tile grid. Screens are centered stacks: the headline, the Lead line 12px below it, the actions 24–32px below that, and the picture 56–80px further down.

Section padding sets the air: 5–6rem of vertical space on phones and 7–9rem from `md` upward. Tiles sit two to a row from `md` with a 12px gap (the Tiles grid), or one to four per row (Choices: 1 / 2 at `sm` / 4 at `lg`). Inner pages open with a Mist band (7rem top on phones, 9rem from `md`) that holds the page title, its line and its actions. The fixed header is 48px tall on phones and 56px from `md`, and its links fold into a full-screen menu below 1024px. On phones a sticky request pill sits at the bottom of the screen.

**The Air Rule.** When in doubt, add vertical space. Never add a second idea to a screen.

## Elevation & Depth

The page is flat. Depth comes from changes in tone between bands and tiles, and from a 1px Hairline ring (`box-shadow: 0 0 0 1px seam`) around every screenshot. The only translucent layer is the header: a 75% background over `backdrop-blur-xl` and `saturate(150%)`. The sticky phone controls carry the site's only real shadow.

### Shadow Vocabulary
- **Floating control** (`box-shadow: 0 10px 30px -12px rgb(0 0 0 / 0.45)`): only on the sticky request pill and the WhatsApp button fixed to the bottom of a phone screen.
- **Screenshot hairline** (`box-shadow: 0 0 0 1px var(--color-seam)`): the edge of every screenshot.

### Named Rules
**The Flat Surface Rule.** Tiles, bands and screenshots have no drop shadows. Only something that floats above the page while it scrolls gets a shadow.

## Shapes

Corners follow a small fixed scale: 9999px pills for every button, the header request and the carousel controls; 28px tiles; 18px screenshots; and a 32px top-only rounding on the light-theme photographs, which sit on the band below them like a framed print. A screenshot inside a tile drops its bottom corners so it runs off the tile's lower edge. The Feature screenshot starts at a 36px radius and 84% scale, then grows to full width with square corners as it scrolls in. Cut-out photographs in the dark theme have no frame or radius: the figure stands directly on black.

## Components

### Buttons
Light and confident, like Apple's own buttons.
- **Shape:** full pill (9999px), at least 44px tall, 22px side padding, 17px weight 500.
- **Primary (filled):** Action Blue background with white text. On hover it darkens to 86% blue mixed with black.
- **Outline:** a 1px Action Blue border with blue text. On hover it fills blue with white text.
- **Pairing:** a primary action and a WhatsApp outline (with its icon) appear together as one unit, called "the two doors". They are centered, 12px apart, and appear in the Hero, the Closing and the menu.
- **Focus:** a 2px Action Blue outline, offset 3px, with a 6px radius.

### Text Links
- **More link:** Action Blue, 17px, followed by a 12px stroked chevron with a 4px gap. It is underlined on hover. It is the default secondary action: open a work, see all works, read more. The Back link uses the same style with the chevron turned 180 degrees.
- **Quiet link:** Slate text that turns to Ink and gains an underline on hover. It is used for contact lines and footer links.

### Cards / Containers
- **Tile:** 28px corners with a Mist fill (Paper White in Choices), a centered headline, a caption and a More link, with no border and no shadow. In the Tiles grid, tiles 2 and 3 of every four are fixed dark, which makes a checkerboard of two light and two dark tiles. Hovering a tile raises its screenshot by 6px over 700ms.
- **Screenshot (exhibit):** 18px corners, a Silver Well fill and a Hairline ring. The image is set to `object-cover object-top`.

### Inputs / Fields
The request and review forms keep their own markup. Inside `.form-room` the older studio tokens are mapped to the site's variables, so the forms follow the theme. Labels and form headings use Nunito Sans 800. On focus a field's border turns Action Blue and gains a `0 0 0 4px` ring of 22% blue.

### Navigation
- **Header bar:** fixed, with a translucent background, a Hairline bottom edge and background blur. It holds the wordmark on the left (inverted in dark), 13px links in the center (Ink at 80%, full Ink on hover or on the current page), and on the right the theme switch, the language switch and a small 32px blue request pill (`md` and up).
- **Theme switch:** a 36px round icon button: a moon in the light theme and a sun in the dark. Clicking it writes `aly-theme` to localStorage. Before the first paint, an inline script in the site layout sets `data-theme` from `aly-theme`, or from `prefers-color-scheme` if nothing is stored.
- **Mobile menu:** a full-screen panel with links in 28px weight 700, the two doors and a small note. It fades in with a 12px drop.

### Highlights Carousel (signature)
Reviews are shown the way Apple's "Get the highlights" carousel works. One tile sits in the center (52–84vw wide, at least 22–26rem tall) and its neighbors show at the edges. It snaps on a native horizontal scroll and advances every 6s. Under it sit a pill of dots (Silver Well background; the active dot is a 32px Ink bar, the others are 8px Pewter dots) and a round 48px play/pause button. Swiping, tapping a dot or reduced motion pauses it.

### Themed Pictures
`.only-light` and `.only-dark` swap images by theme, and a fixed-dark section shows the dark version.
- **Light theme:** his photographs as taken: `public/photo/about.webp` (Hero) and `public/gallery/work-phone.webp` (Person). Both have rounded tops.
- **Dark theme:** cut-outs of the same moments, `public/photo/cut/hero.png` and `public/photo/cut/stand.png`. They are transparent PNGs set directly on black. **Provenance:** both were made from his own photographs with macOS Vision subject lifting (foreground subject extraction). They are not generated or illustrated. A new cut-out must be made the same way, from a real photograph of him.

### Motion
One script (`GalleryMotion`) reads attributes from the markup. `data-rise` lifts headline lines into their masks (1.25s expo-out, 90ms stagger). `data-fade` settles a tile up 48px out of a 6px blur. `data-zoom` scrubs the Feature screenshot from 0.84 scale and a 36px radius to full width. Wheels get smooth scrolling through Lenis, while touch scrolling stays native. Nothing above the fold is ever hidden before the script runs, and reduced motion turns every reveal off. Theme changes fade the background and text over 400ms (`cubic-bezier(0.25, 0.1, 0.25, 1)`).

## Do's and Don'ts

### Do:
- **Do** give each screen one Display headline (800, mixed case), one Lead line and at most one set of actions: the two doors or one or two More links.
- **Do** build every new surface from the `--color-*` variables so it works in both themes, and check it in both themes before shipping.
- **Do** use `data-tone="dark"` on whole sections or whole tiles to create the black-and-white rhythm.
- **Do** keep small text at 4.5:1 or better. In the light theme, use Slate (`#6e6e73`) rather than Pewter for any text under 18px.
- **Do** frame every screenshot in an 18px radius with a Hairline ring, and every tile in a 28px radius.
- **Do** swap pictures with `.only-light` / `.only-dark` when a theme needs a different image. Dark-theme cut-outs must come from his real photographs, made with subject lifting.
- **Do** leave a lot of air: 6–9rem between screens and centered stacks.

### Don't:
- **Don't** list things as enumerated text (numbered steps, bullet lists of features). Say it once in a headline and a line, or give each item its own tile.
- **Don't** put a small uppercase label or kicker above a headline. Labels are mixed-case field names, not section announcers.
- **Don't** set headlines in uppercase, and don't use a second display family. BBH Bogle and the old studio fonts are retired from the public site.
- **Don't** use Pacifico anywhere except his signature.
- **Don't** add drop shadows to tiles, bands or screenshots. Only floating phone controls get a shadow.
- **Don't** color anything Action Blue that is not an action or a focus state.
- **Don't** bring the dark-house devices back (room lighting, lamps, pointer-following light). The `data-lit`, `data-magnetic`, `data-draw` and `data-parallax` hooks still exist in the motion script, but they are not part of this world.
- **Don't** use the admin or Mini App tokens (`paper`, `ground`, `ink`, Onest) on the public site, except through the `.form-room` mapping.
