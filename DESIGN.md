---
name: aly.lat
description: A dark modern home at night, and he lives in it. Every section is a different room, lit only by its architectural light.
colors:
  wall: "#070707"
  wall-2: "#0d0d0d"
  wall-3: "#161616"
  bone: "#f3eee7"
  bone-2: "#b9b2a8"
  bone-3: "#8d877e"
  brass: "#f2c58a"
  led: "#ffe2b8"
  cobalt: "#2d4dff"
  cobalt-led: "#8fa3ff"
  seam: "rgb(243 238 231 / 0.08)"
  seam-2: "rgb(243 238 231 / 0.18)"
typography:
  display-name:
    fontFamily: "BBH Bogle, Nunito Sans, ui-sans-serif, sans-serif"
    fontSize: "clamp(4.25rem, 19.5vw, 22rem)"
    fontWeight: 900
    lineHeight: 0.82
    letterSpacing: "-0.015em"
  display:
    fontFamily: "BBH Bogle, Nunito Sans, ui-sans-serif, sans-serif"
    fontSize: "clamp(3.25rem, 10.5vw, 10.5rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "BBH Bogle, Nunito Sans, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.25rem, 5.6vw, 5.25rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.01em"
  title:
    fontFamily: "BBH Bogle, Nunito Sans, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 2.25rem)"
    fontWeight: 900
    lineHeight: 1
  body:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 300
    lineHeight: 1.65
  quote:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 300
    lineHeight: 1.625
  label:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.14em"
  script:
    fontFamily: "Pacifico, cursive"
    fontSize: "clamp(1.375rem, 2.4vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
rounded:
  focus: "2px"
  field: "1rem"
  pill: "9999px"
spacing:
  hall-gutter-sm: "1.25rem"
  hall-gutter-md: "2.5rem"
  hall-gutter-lg: "4.5rem"
  hall-max: "1680px"
  room-y: "7rem"
  room-y-md: "10rem"
  inner-y: "6rem"
  inner-y-md: "9rem"
components:
  button-bone:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.wall}"
    rounded: "{rounded.pill}"
    padding: "0 1.875rem"
    height: "3.5rem"
  button-bone-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.wall}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "0 1.875rem"
    height: "3.5rem"
  door-round:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    size: "3rem"
  door-round-hover:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.wall}"
  screen:
    backgroundColor: "{colors.wall-2}"
    rounded: "0"
  led-strip:
    backgroundColor: "{colors.led}"
    rounded: "{rounded.pill}"
    height: "2px"
  link-quiet:
    textColor: "{colors.bone-2}"
  link-quiet-hover:
    textColor: "{colors.bone}"
  field:
    backgroundColor: "{colors.wall-2}"
    textColor: "{colors.bone}"
    rounded: "{rounded.field}"
    padding: "1rem 1.25rem"
---

# Design System: aly.lat

Scope: this file describes the public site under `app/(site)/[lang]` only, everything that renders under `body.museum`. The admin (`/admin`) and the Telegram Mini App (`app/(mini)`) keep the older light studio tokens at the top of `app/globals.css` (paper, ground, ink, Onest) and are out of scope. Don't apply house rules there, and don't pull studio tokens into the public site. The one sanctioned bridge is the form room remap (see Components).

A note on names. The class and token names `wall`, `bone`, `brass`, `exhibit`, `hall`, `museum` and `ease-gallery` survive from the previous build, but their values have changed. `wall` is now matte black, `bone` is off-white, `brass` is warm 2700K line light, an `exhibit` is a screen set flush into a wall, and a `hall` is just the page container. Read the names as legacy handles. The museum metaphor itself was rejected by the owner and is no longer part of the system.

## Overview

**Creative North Star: "The Dark House at Night"**

The site is a dark modern home at night, and he lives in it. Every section is a different room. The room is built from matte black surfaces and lit only by architectural light: LED line strips, a cove glowing behind battens, a picture light over a portrait, a lit island, and once in a while a cold cobalt doorway. The owner appears in the rooms himself. Cut-out photographs of him stand at the island, under the picture light and in the doorway, because visitors have to recognise him straight away. There are no cards, no panels and no UI chrome standing in for depth. Light defines every edge.

The owner fixed the character himself. Every section gets one huge headline and one small thin note in a corner. There are no enumerated lists. Headings are BBH Bogle only, small text is thin Nunito Sans, and Pacifico appears as warm-light handwriting. The pages are clean, with lots of air. Content is fully visible at first paint. The lights switching on (a ceiling line drawing itself, the under-light fading up) are decoration over a page that is already complete.

Density is low. Each room holds one statement, one lit thing and one quiet note. The black does the rest.

**Key Characteristics:**
- Matte black in three close steps, off-white ink, and warm line light used as light, never as paint.
- One huge Bogle headline per room, plus one thin Nunito note away from it.
- Light lines with real glow (stacked box-shadows) instead of borders. Glowing hairlines replace dividers.
- The owner cut out of his own photographs, standing inside the room's light.
- Cobalt is rare. A cool doorway or cove appears at most once per room, and in most rooms not at all.
- Two doors everywhere: the request and WhatsApp.

## Colors

The palette is a house at night: near-neutral matte blacks, warm off-white ink, one warm line light and a rare cold one.

### Primary
- **Line Light Brass** (`brass`): the warm 2700K light as a colour. Used for Pacifico script (with its own glow), the 1px active-nav underline, hover ink and fill on round doors, the hover underline on quiet links, text selection, the focus outline and the input caret. It never fills an area larger than a round door, and it is never used for body text or headlines.
- **LED Core** (`led`): the hot core of a strip light. It is used only as the fill of a glowing line (`.led`: floor strips, the island under-light, the picture light, room cove edges) and as the stroke of drawn SVG light (the ceiling rectangle, the corridor lines, the draft line). It is always paired with its glow and is never used as text.

### Secondary
- **Cobalt Cove** (`cobalt`): the house's cold light. It appears as low-alpha gradients in doorways and coves (the hero doorway, the glass wall, the closing doorway, the bots direction room) and as the cool rim on the doorway cut-out.
- **Cobalt Line** (`cobalt-led`): the core of a cold light line (`.led-cobalt`), the doorway's jambs and the glass wall's floor line.

### Neutral
- **Floor Black** (`wall`): the page itself, the default room and the scrollbar track.
- **Wall Black** (`wall-2`): alternate rooms (the portrait room, the "what you get" rooms on inner pages), screen backgrounds and form fields.
- **Lit Edge** (`wall-3`): the deepest raised surface. Used for the floating WhatsApp door and the scrollbar thumb.
- **Off-White** (`bone`): headlines, primary ink and the filled door. The hero name sits at 90% of it.
- **Thin Text** (`bone-2`): wall notes, quiet links, nav at rest, and the island role line (9.6:1 on Floor Black).
- **Quiet Text** (`bone-3`): labels, captions and footer small print (5.6:1 on Floor Black). This is the floor for text.
- **Seam** (`seam`) / **Seam Strong** (`seam-2`): the few real hairlines that remain: the scrolled header's bottom edge and the footer top rule (Seam), and outlined button and round door borders (Seam Strong). Island tops and the closing room's base use a white 10% hairline.

### Named Rules
**The Light Is Not Paint Rule.** Warm and cold colour enter the page as light: a glowing line, a radial or linear falloff to transparent, or a text glow. Brass and cobalt never fill a surface, a card or a block of type. The only solid accent areas allowed are a 2-3px LED line and a round door on hover.

**The Rare Cobalt Rule.** Warm is the house. Cobalt is the cold doorway you glimpse. Use it once in a room at most, keep it as a cove, doorway or single line, and keep most rooms entirely warm.

**The Falloff Rule.** Every gradient is light falling off into black: warm `rgb(255 190 120)` to `rgb(255 236 204)` family, or cobalt, at low alpha, fading to transparent by about 70%. There are no colour-to-colour gradients and no gradient text.

## Typography

**Display Font:** BBH Bogle (fallback Nunito Sans, ui-sans-serif)
**Body Font:** Nunito Sans with the `wdth` axis loaded (fallback ui-sans-serif, system-ui)
**Accent Font:** Pacifico (cursive)

**Character:** A heavy caps grotesk names the room. A thin humanist sans speaks quietly in the corner. A warm brush script glows like a neon sign written by hand.

### Hierarchy
- **Display Name** (900, `clamp(4.25rem, 19.5vw, 22rem)`, 0.82, centred): the owner's name across the living room's back wall, behind him. One use, the first room only.
- **Display** (900, `clamp(3.25rem, 10.5vw, 10.5rem)`, 0.88): the room title, one per section. Rooms tune it between about `clamp(3rem, 8vw, 8.5rem)` and `clamp(3rem, 10vw, 11rem)`. It is set in line masks with balanced wrap.
- **Headline** (900, `clamp(2.25rem, 5.6vw, 5.25rem)`, 0.92): sub-room titles on inner pages.
- **Title** (900, `clamp(1.375rem, 2.2vw, 2.25rem)`, 1): work names under screens and the island offer line. Large Bogle words also serve as navigation: direction words (up to 5.5rem lit, set vertically like a door sign when the room is dark) and the mobile menu (up to 4.5rem).
- **Body / Wall Note** (300, 0.875rem, 1.65, max 34ch, Thin Text): the only reading text. It sits in a corner, right-aligned on desktop.
- **Quote** (300, 1.0625rem to 1.125rem, relaxed, Off-White): review text written on the glass.
- **Label** (400, 0.75rem, 0.14em, uppercase, Quiet Text): captions beside work names, client roles, the corridor's walk hint and field labels.
- **Script** (Pacifico 400, about `clamp(1.375rem, 2.4vw, 2.25rem)`, up to 4rem in the portrait room, Line Light Brass with a 22px warm glow): one handwritten line near a headline, rotated -2 to -5deg.

Buttons and nav use Nunito Sans 500 at 0.875 to 0.9375rem. Sizes are set by role. There is no ratio scale.

### Named Rules
**The One Voice Per Role Rule.** Bogle is used only for headings and heading-scale words. Nunito is used only for small text. Pacifico is used only as the warm-light accent. Bogle never sets body text, Nunito never sets an English headline, and Pacifico never carries content someone must read to act.

**The Russian Headline Rule.** Bogle draws only Latin capitals, so Cyrillic falls through to Nunito Sans Black. Under `:lang(ru)`, every room title, `.font-display` word and form-room heading is set at `font-stretch: 75%`, `text-transform: uppercase` and letter-spacing -0.005em, so the Russian site keeps the same condensed-caps mass. Every Bogle stack asks for weight 900 with `font-synthesis: none`.

**The Corner Note Rule.** Each room has one huge headline and one small thin note, and the note sits away from the headline, in the opposite corner or at the end of the row. A room never gets a paragraph block under its headline.

## Layout

The container is the hall: full width up to 1680px, centred, with gutters of 1.25rem, 2.5rem from 768px and 4.5rem from 1280px. Large-screen compositions use a 12-column grid. Text takes columns 1 to 7, and the owner's figure takes 8 to 12.

Home rooms breathe at 7rem top and bottom on phones and 10rem from 768px (`py-28 md:py-40`). The draft room goes to 8rem/12rem. Inner-page rooms use 6rem/9rem. Rooms with the owner in them (living room, portrait, doorway) fill 100svh, and the figure stands on the room's floor line. Inner-page openings (Hall Head) fill 62svh on phones and 70svh on desktop, with the headline at the bottom and an LED floor strip at the foot.

On phones everything stacks in a single column. Direction rooms become 42svh slatted panels, and the one crossing the middle of the screen is lit. The glass partition becomes a horizontal drag of 82vw panes. The corridor is a plain column until its script can run.

**The Different Room Rule.** No two consecutive sections share a lighting setup. Each room picks its own light source (ceiling line, cove behind slats, picture light, floor strip, cold doorway, single drawn line) and its own surface step. A new section that reuses the previous room's light is a repeated room.

**The Look Don't Read Rule.** Each room holds one statement. A choice between options is a set of large words or lit panels, never a numbered sequence of steps.

## Elevation & Depth

Depth comes from light falling into black and from real perspective, never from UI layering. Surfaces are flat and matte. Three things carry shadow. Light lines glow, with three stacked box-shadows from a tight core to a wide halo. Screens (pictures of work) sit deep in the wall with a long dark cast. Floating doors carry one soft drop so they read above content on scroll. The owner's cut-outs take a faint warm rim (`drop-shadow` 40px) and, near a doorway, a cobalt rim, so he is lit by the room he stands in. The corridor adds true 3D: works hang along a 900px perspective and come out of the dark as the scroll walks forward. A fine grain over the whole page (6% opacity, screen blend) keeps the black matte rather than glossy. Once the page scrolls, the header becomes a 95% Floor Black bar with a light blur and a seam bottom edge.

### Shadow Vocabulary
- **LED Glow** (`box-shadow: 0 0 6px 1px rgb(255 214 160 / 0.9), 0 0 22px 4px rgb(255 180 110 / 0.45), 0 0 70px 14px rgb(255 160 90 / 0.18)`): every warm line light.
- **Cobalt Glow** (`box-shadow: 0 0 8px 1px rgb(120 140 255 / 0.9), 0 0 30px 6px rgb(45 77 255 / 0.5), 0 0 90px 22px rgb(45 77 255 / 0.22)`): every cold line light.
- **SVG Light** (`filter: drop-shadow(0 0 6px rgb(255 214 160 / 0.9)) drop-shadow(0 0 24px rgb(255 170 100 / 0.45))`): drawn light strokes (ceiling, corridor, draft line).
- **Screen Cast** (`box-shadow: 0 60px 120px -50px rgb(0 0 0 / 0.95), 0 0 0 1px rgb(0 0 0 / 0.6)`, with a `rgb(255 255 255 / 0.06)` 1px edge): every screen.
- **Floating Door** (`box-shadow: 0 18px 40px -16px rgb(0 0 0 / 0.8)`): the sticky doors only.
- **Script Glow** (`text-shadow: 0 0 22px rgb(255 190 120 / 0.35)`): Pacifico only.

### Named Rules
**The Light Defines The Edge Rule.** If something needs an edge, give it a light line, a light falloff or a 1px hairline. Never use a card, a filled panel or a border box.

**The Lit Figure Rule.** The owner's cut-outs always stand inside a light source in their room and take that light's rim colour. A cut-out never floats on bare black.

## Shapes

The geometry is architectural: hard rectangles and lines, with pills only for what you press. Screens, slatted panels, glass panes, islands and doorways are hard-cornered. Light lines are 1 to 3px with fully rounded ends. The slatted wall is a repeating vertical batten (14px batten, 8px gap) in two near-blacks. Glass panes have a 6px black frame, an inset 1px white 8% edge, a faint diagonal sheen and a 3px backdrop blur. Everything you press is a full pill or a circle (9999px): filled and outlined doors, round arrow doors (48 to 80px), the language switch and the menu button. Form fields are softly rounded (1rem), inherited from the form markup. Focus rings have a 2px radius.

## Components

### Buttons
Two doors, quietly confident.
- **Shape:** full pill, at least 3.5rem tall (4rem in the closing doorway), 1.875rem horizontal padding, 0.75rem gap to the icon.
- **Bone:** filled Off-White with Floor Black ink, Nunito 500 at 0.9375rem. It goes to white on hover, and the arrow nudges right.
- **Line:** transparent with a Seam Strong border and Off-White ink. On hover the border turns Off-White and a faint 6% wash appears.
- **Order:** in the living room and inner pages the request is filled and WhatsApp is outlined. In the closing doorway WhatsApp is filled, since that is the room you leave by.
- **Motion:** 300ms colour transitions. On fine pointers the doors are magnetic.
- **Focus:** 2px Line Light Brass outline, offset 4px.

### Round Doors
A circle with a Seam Strong border and a single arrow, 48 to 80px. On hover it fills Line Light Brass with Floor Black ink. Round doors end direction rooms, work rows, contacts and next-case links.

### LED Strip (signature)
A 1 to 3px line of LED Core with LED Glow, or of Cobalt Line with Cobalt Glow. It runs along floors (the island, the portrait room, every Hall Head), above a portrait as a picture light, and along the base of a lit direction room. Every strip has a soft radial falloff spilling onto the surface next to it.

### The Living Room (signature)
The first room. A ceiling light rectangle seen from below draws itself on (1.8s). The owner's name is set huge across the back wall. He stands in front of it (the `hero.png` cut-out), and a black island sits in front of him with an under-light that fades up (1.4s, 0.8s delay). A slatted wall on the left is grazed from the floor, and a cold doorway glows at the right. The pointer separates name and figure slightly for parallax. The island's face carries the role line, the Bogle offer with its script, both doors and the corner note. Every element is present at first paint.

### Corridor (signature)
The work room. A long hall drawn only by light lines (floor strips, faint ceiling edges, a warm door at the vanishing point). Works hang one behind another, alternating left and right on wide screens. They are pinned and scrubbed through a 900px perspective, light up as you approach (`is-lit`), and pass beside you. Without the script or under reduced motion they form a plain two-column grid.

### Direction Rooms
Four slatted panels side by side. The one you point at (or the one at mid-screen on a phone) widens to 2.4x over 700ms, and its cove light comes up behind the battens with an LED edge at the base. It then shows its Bogle word, script line, "from" price and round door. Dark panels show the word vertically at 40% Off-White, like a sign on a door. The bots room is lit cobalt, and the rest are warm.

### Screen
A picture of work set into the wall: a Wall Black rectangle with Screen Cast and a 6% white hairline edge, cropped to the top of the page. Where a lamp is present (`data-lamp`), a warm elliptical falloff sits above it. With the script running the screen waits dim and clears as it reaches the light. Without the script it is simply lit.

### Glass Partition
Reviews written on black-framed glass panes standing in front of a cobalt-lit wall with a single cold floor line. The quote is set in thin Nunito on the glass, and the name in Pacifico underneath. Drag or swipe sideways to read on.

### Hall Head
The opening of an inner page. A bottom-aligned display headline in line masks, an optional script line, the doors at the bottom left, the wall note and a quiet back link at the bottom right, a warm pool that follows the pointer, and an LED floor strip at the foot.

### Inputs / Fields (form room)
The request and review forms keep their studio markup. Inside `.form-room`, the studio tokens are re-pointed at the house's: paper becomes Wall Black, ink becomes Off-White, and line becomes Seam. Fields are softly rounded (1rem) with Nunito 300 text and a Line Light Brass caret. On focus the border turns brass and a 4px halo appears. Headings and field labels switch to Bogle 900, with the condensed caps treatment on the Russian site.

### Navigation
- **Header:** fixed, 80/96px tall, with no bar until the page scrolls. The wordmark is inverted to Off-White. Nav items are Nunito 0.875rem in Thin Text, turning Off-White on hover and on the current page, and the current page gets a 1px brass underline. A small filled request pill shows from 768px up.
- **Mobile menu:** a full Floor Black sheet that wipes down (clip-path, 700ms). Pages are listed as large Bogle words, which turn brass on hover. The current page drops to 40%. Both doors and a wall note sit at the foot.
- **Sticky doors:** these appear after 60% of a viewport has scrolled past. On phones they are a pair (filled request pill and round WhatsApp). On desktop only the WhatsApp circle on Lit Edge shows. They hide on form pages, while the menu is open, and whenever a room marked `data-doors` is in view. They rise in over 680ms.

### Owner Cut-outs (imagery)
`public/photo/cut/hero.png` (1025x851, at the island), `stand.png` (403x1060, under the picture light) and `doorway.png` (399x1197, in profile at the cold doorway). They were lifted from his own photographs with macOS Vision subject lifting, then edge-eroded to remove halo fringe and graded to sit in the room's light. New figures follow the same path. Use his real photographs only, lift them, erode the edge, grade them to the room's light, and add the matching rim drop-shadow.

## Do's and Don'ts

### Do:
- **Do** give every section one display headline and one thin corner note, and nothing else competing.
- **Do** make every section a different room, with its own light source and no repeat of the previous room's setup.
- **Do** light edges with LED strips (with LED Glow) or falloffs to black rather than borders or cards.
- **Do** put the owner in rooms as a Vision-lifted, edge-eroded, graded cut-out from his own photographs, standing in that room's light.
- **Do** set every heading in Bogle 900 with `font-synthesis: none`, and let `:lang(ru)` carry it into Nunito Sans Black at 75% width in uppercase.
- **Do** keep content visible at first paint. Lights may switch on and reveals may run only on elements below the fold, and only once the script is running.
- **Do** switch every motion (corridor walk, parallax, magnetic doors, glass drag, Lenis smooth scroll, light-on animations) off under `prefers-reduced-motion`, leaving a complete static room.
- **Do** keep text at Quiet Text or brighter. Quiet Text is the contrast floor.
- **Do** put the two doors, request and WhatsApp, in every room that asks for action, and mark it `data-doors`.

### Don't:
- **Don't** build numbered or enumerated step lists ("01 Request / 02 Consultation / ..."), or bullet-heavy feature lists.
- **Don't** use Nunito for an English headline, Bogle for body text, or Pacifico for anything a visitor must read to act.
- **Don't** fill surfaces with brass or cobalt, or use either for body text.
- **Don't** use cobalt in more than one place per room, or in most rooms.
- **Don't** return to the museum metaphor (halls, frames, curator's labels, gallery lamps as the organising idea). The owner rejected it.
- **Don't** put light or white cards on the black. Raised surfaces are Wall Black or Lit Edge.
- **Don't** hide content with initial opacity 0 in CSS or in server markup.
- **Don't** use stock or generated people. The figure in the house is always the owner, from his own photographs.
- **Don't** add small uppercase labels above headlines. The room's name stands alone, with the script line near it.
- **Don't** add a third door or a competing call to action.
