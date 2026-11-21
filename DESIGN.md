---
name: aly.lat
description: A night museum of one developer's work; each project hangs alone on a dark wall under its own light.
colors:
  wall: "#0e0f0e"
  wall-2: "#151715"
  wall-3: "#1d201d"
  bone: "#ece7dd"
  bone-2: "#b3ada2"
  bone-3: "#8c877e"
  brass: "#c8a46b"
  seam: "rgb(236 231 221 / 0.1)"
  seam-2: "rgb(236 231 221 / 0.2)"
typography:
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
    fontSize: "clamp(1.5rem, 2.2vw, 2.125rem)"
    fontWeight: 900
    lineHeight: 1
  body:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 300
    lineHeight: 1.65
  label:
    fontFamily: "Nunito Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.14em"
  script:
    fontFamily: "Pacifico, cursive"
    fontSize: "clamp(1.5rem, 3vw, 2.75rem)"
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
  section-y: "6rem"
  section-y-md: "9rem"
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
  button-line-hover:
    backgroundColor: "rgb(236 231 221 / 0.06)"
    textColor: "{colors.bone}"
  door-round:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    size: "3.5rem"
  door-round-hover:
    textColor: "{colors.brass}"
  exhibit-frame:
    backgroundColor: "{colors.wall-2}"
    rounded: "0"
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

Scope: this file describes the public site under `app/(site)/[lang]` only, everything that renders under `body.museum`. The admin (`/admin`) and the Telegram Mini App (`app/(mini)`) keep the older light studio tokens at the top of `app/globals.css` (paper, ground, ink, Onest) and are out of scope. Don't apply museum rules there, and don't pull studio tokens into the public site. The one sanctioned bridge is the form room remap (see Components).

## Overview

**Creative North Star: "The Night Museum"**

Every section is a hall: a dark painted wall, one thing hung on it under its own warm light, and the hall's name set huge. Whatever someone might want to read sits small and thin in a corner, like the label next to a painting. The visitor walks through the halls instead of reading a landing page. The density is deliberately low. Each screen holds one statement, one exhibit and one quiet note, with a lot of dark air around them.

The owner fixed the system's character himself. Every section has one huge headline and a small thin piece of text in a corner. There are no enumerated lists. Headings are BBH Bogle and only BBH Bogle, small text is Nunito Sans at a thin weight, and Pacifico is the brass handwritten accent. The whole site stays clean with lots of air. Light is the material. Warm radial pools (`rgb(255 236 204)` at 5 to 24% alpha) are the only gradients. A fine plaster grain over the whole page (6% opacity, screen blend) keeps the walls painted rather than rendered.

The movement has a ceiling. Content is fully visible at first paint, and reveals only touch elements that start below the fold. The one authored motion moment is the lamp: an exhibit waits in the dark and its light comes up as it reaches the middle of the hall.

**Key Characteristics:**
- Charcoal walls in three tonal steps, bone ink, brass used only as a pencil mark.
- One huge Bogle headline per hall, set flush-left at the foot of the room. One small thin Nunito note in the opposite corner.
- Work shown as framed exhibits with real cast shadows and a hairline frame offset from the picture.
- Two doors everywhere: the request (filled bone pill) and WhatsApp (outlined pill or round button).
- Motion that adds to a page that is already complete, never motion that a page waits on.

## Colors

The palette is a dark gallery: near-black green-tinted walls, warm bone ink and one restrained brass accent.

### Primary
- **Gallery Brass** (`brass`): the curator's pencil. Used for Pacifico script lines, the active-nav underline (1px), the Voices progress hairline, hover states on round arrow doors (border and ink, and a fill on the Directions arrow), the quote marks around testimonials, the hand-drawn SVG stroke, text selection, focus rings and the input caret. It never fills a large area and is never used for body text or headlines.

### Neutral
- **Night Wall** (`wall`): the page itself. Also `theme-color` and the scrollbar track.
- **Raised Wall** (`wall-2`): alternate halls (work hall, "what you get" rooms), exhibit frame backgrounds and form fields inside a form room.
- **Alcove** (`wall-3`): the deepest raised surface, used for the floating WhatsApp door and the scrollbar thumb.
- **Bone** (`bone`): headlines, primary ink and the filled request button.
- **Worn Bone** (`bone-2`): thin wall notes, quiet links and nav at rest (8.6:1 on wall).
- **Faded Bone** (`bone-3`): the quietest labels, captions and footer small print (5.4:1 on wall; this is the floor for text).
- **Seam** (`seam`) / **Seam Strong** (`seam-2`): hairlines. Seam is used for list rules, the header bottom border and the exhibit outline. Seam Strong is used for outlined buttons, round door borders and underline color on quiet links.

### Named Rules
**The Curator's Pencil Rule.** Brass marks things. It never paints them. Allowed: script lines, 1px markers, hover ink, focus, selection. A brass area larger than a 64px round button on hover is off-system.

**The Warm Light Rule.** The only gradients are warm light pools of `rgb(255 236 204)` falling on the wall: radial, low alpha, fading to transparent by about 50 to 72%. There are no colored gradients and no gradient text.

## Typography

**Display Font:** BBH Bogle (fallback Nunito Sans, ui-sans-serif)
**Body Font:** Nunito Sans with the `wdth` axis loaded (fallback ui-sans-serif, system-ui)
**Accent Font:** Pacifico (cursive)

**Character:** A heavy caps grotesk shouts the hall's name. A thin humanist sans whispers the label. A loose brush script adds the curator's aside at a slight tilt.

### Hierarchy
- **Display** (900, `clamp(3.25rem, 10.5vw, 10.5rem)`, 0.88): the hall title, one per section. The home entrance pushes it to `clamp(3.75rem, 13vw, 12.5rem)`. Set line by line in masks, balanced wrap.
- **Headline** (900, `clamp(2.25rem, 5.6vw, 5.25rem)`, 0.92): the room title for sub-sections inside an inner page.
- **Title** (900, about `clamp(1.5rem, 2.2vw, 2.125rem)`, 1): the names of works under their frames. Large Bogle words also serve as navigation: the four direction words (up to 8.25rem) and the mobile menu (up to 4.5rem). The testimonial lead is set as display-scale Bogle at line-height 1.04.
- **Body / Wall Note** (300, 0.875rem, 1.65, max 34ch, pretty wrap, Worn Bone): the only reading text. It sits in a corner, usually right-aligned on desktop.
- **Label** (400, 0.75rem, 0.14em, uppercase, Faded Bone): captions under exhibits, client and year lines, field and definition labels.
- **Script** (Pacifico 400, `clamp(1.5rem, 3vw, 2.75rem)`, 1, Brass): one curator's line under a headline, rotated -3 to -4deg and indented by 0.25rem.

Buttons and nav use Nunito Sans 500 at 0.875 to 0.9375rem. Sizes are set by role. There is no ratio scale.

### Named Rules
**The One Voice Per Role Rule.** Bogle is used only for headings and heading-scale words. Nunito is used only for small text. Pacifico is used only as the brass accent. Bogle is never used for body text, Nunito is never used for an English headline, and Pacifico is never used for content someone must read to act.

**The Russian Headline Rule.** Bogle draws only Latin capitals, so Cyrillic falls through to Nunito Sans Black. Under `:lang(ru)`, every hall title, room title, `.font-display` word and form-room heading is set at `font-stretch: 75%`, `text-transform: uppercase` and letter-spacing -0.005em, so the Russian site keeps the same condensed-caps mass. Every Bogle stack asks for weight 900 with `font-synthesis: none`. Bogle answers at its own single weight, and the Nunito fallback answers at Black.

**The Corner Note Rule.** Each hall has one huge headline and one small thin note, and the note sits away from the headline, in the opposite corner or at the end of the row. A hall never gets a paragraph block under its headline.

## Layout

The container is the hall: full width up to a 1680px maximum, centred, with side gutters of 1.25rem on phones, 2.5rem from 768px and 4.5rem from 1280px. Inside it, the large-screen composition uses a 12-column grid with a 2.5rem column gap. Headlines usually take columns 1 to 7, and exhibits take 7 to 12 or hang offset (8 columns, then 7 columns starting at column 6, then full width).

The vertical rhythm is generous and comes from the section. Most halls use 6rem top and bottom on phones and 9rem from 768px (`py-24 md:py-36`). Opening halls use 7rem/10rem. Page openings (HallHead) fill 62svh on phones and 70svh on desktop, with the headline pushed to the bottom. The home entrance fills 100svh. Gaps between headline, script line and doors run 0.25rem, then 2.5 to 3rem, then 3 to 4rem.

The entrance's first viewport: the giant headline at the bottom left, the featured case lit at the top right, the wall note at the bottom right, and both doors under the headline. On phones everything stacks in a single column, the note goes last, and the work hall becomes a native horizontal swipe with snap points (84vw per exhibit).

**The Look Don't Read Rule.** Each section holds one statement. If a section needs a list, it is a set of large words separated by hairline seams (as in Directions). It is never a numbered sequence of steps.

## Elevation & Depth

Depth comes from light and real cast shadow, never from UI layering. The walls are flat. Exhibits (pictures of work) are the only things that cast a shadow, and they cast it like a frame on a wall. Long, soft and dark, falling downward. Hairline outlines give the frame its edge. Floating doors carry one soft drop shadow so they read above the content on scroll. The header becomes a 95% Night Wall bar with a light backdrop blur and a seam bottom border once the page scrolls.

### Shadow Vocabulary
- **Frame Cast** (`box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.75), 0 18px 30px -18px rgb(0 0 0 / 0.6)`): every exhibit frame.
- **Floating Door** (`box-shadow: 0 18px 40px -16px rgb(0 0 0 / 0.8)`): the sticky request and WhatsApp doors only.
- **Brass Focus Halo** (`box-shadow: 0 0 0 4px rgb(200 164 107 / 0.28)`): focused inputs in a form room.

### Named Rules
**The Lit Wall Rule.** Depth is lighting. A section gets a warm radial pool behind its content. On halls marked as lit, the pool follows the pointer through `--lx`/`--ly`, and without the script it stays where the stylesheet put it, so the room is lit either way. Cards, panels and layered surfaces don't stand in for depth.

## Shapes

The geometry is square and pill. The only middle ground is form fields. Exhibit frames are hard-cornered rectangles (16:10 for case shots, 4:3 for the floating print) with a 1px seam outline offset 10px from the picture, so the frame reads as a mat. Everything you press is a full pill or a circle (9999px): filled buttons, outlined buttons, round arrow doors (48, 56 or 64px), the language switch and the menu button. Form-room fields are softly rounded (1rem), inherited from the form markup. Focus rings use a small 2px radius. Rules are 1px seams. The one organic line is the brass hand-drawn SVG stroke (3px, round caps) that the scroll draws.

## Components

### Buttons
Two doors, quietly confident.
- **Shape:** full pill (9999px), at least 3.5rem tall, 1.875rem horizontal padding, 0.75rem gap to its icon.
- **Bone (request):** filled Bone with Night Wall ink, Nunito 500 at 0.9375rem. It goes to white on hover. Its arrow nudges 4px right on hover.
- **Line (WhatsApp):** transparent with a Seam Strong border and Bone ink. On hover the border turns Bone and a 6% Bone wash appears.
- **Motion:** colour transitions run for 300ms on `ease-gallery`. Hero doors are magnetic on fine pointers: they lean about 22% horizontally and 30% vertically toward the cursor.
- **Focus:** 2px Brass outline, offset 4px.

### Round Doors
A circle with a Seam Strong border and a single arrow (48 to 64px). On hover, the border and ink turn Brass. In Directions the circle fills Brass with Night Wall ink. These circles end every list row, the work-hall "all work" tile, contacts and next-case links.

### Exhibit Frame (signature)
A work hung on the wall, shown as a Raised Wall rectangle with Frame Cast and an offset seam outline. The image is cropped to the top of the page. Above it hangs a lamp: an elliptical warm pool anchored at the top centre. On hover the image scales by 3.5 to 4% over 1.4 to 1.6s. A caption row sits under the frame: the title in Bogle on the left, and the caption label plus an "open" link on the right.

### The Lamp (signature motion)
This is the site's one authored moment. While the motion script runs, a lamped exhibit waits dim (lamp at 12% opacity, image at `brightness(0.55) saturate(0.7)`). When it reaches the middle of the hall, its lamp comes up to full and the image clears over 900ms. On a wide screen this happens in a narrow band at the centre of the pinned, sideways-walking work hall. Elsewhere it is driven by vertical scroll or swipe visibility. With no script, or with reduced motion, every lamp is simply on.

### Hall Head
The opening of an inner page. A bottom-aligned display headline in line masks, an optional brass script line, the doors at the bottom left, and the wall note at the bottom right. A quiet "back" link with a reversed arrow sits in that same corner rather than as a label over the title.

### Directions List
Four large Bogle words separated by seam rules. Each row has a brass script subline, a small "from" price and a round door. On pointer devices the other words fade to 25% Bone and a print of the work follows the cursor on a spring, slightly rotated.

### Voices
One testimonial at a time. The quote is the headline, in Bogle, with brass quote marks. The name is in script, the role is a label and the remainder is a wall note. Hairline tabs mark progress, and the active tab fills with brass over its hold time.

### Inputs / Fields (form room)
The request and review forms keep their studio markup. Inside `.form-room`, the studio tokens are remapped onto the museum's: paper becomes Raised Wall, ink becomes Bone, and line becomes Seam. Fields are softly rounded (1rem) and sit on the raised wall with a Seam Strong border, Nunito 300 text and a Brass caret. On focus the border turns Brass and the Brass Focus Halo appears. Headings and field labels switch to Bogle 900, with the condensed caps treatment on the Russian site.

### Navigation
- **Header:** fixed and 80/96px tall. The wordmark is inverted to bone. Nav items are Nunito 0.875rem in Worn Bone and turn Bone on hover and on the current page. The current page also gets a 1px brass underline. A small filled Bone pill acts as the persistent request door from 768px up. The language switch is a seam-outlined pill with tracked 0.6875rem codes.
- **Mobile menu:** a full Night Wall sheet listing pages as large Bogle words (up to 4.5rem). Hover turns them Brass, and the current page drops to 40% Bone. Both doors and a wall note sit at the foot.
- **Sticky doors:** these appear after 60% of a viewport has scrolled past. On phones they are a pair: the request as a filled pill and WhatsApp as a round button. On desktop only the WhatsApp circle shows, since the header carries the request. They hide on form pages, while the menu is open, and whenever a hall with its own doors (`data-doors`) is in view. They rise in over 680ms.

## Do's and Don'ts

### Do:
- **Do** give every section one display headline and one thin corner note, and nothing else competing.
- **Do** set every heading in Bogle 900 with `font-synthesis: none`. Let `:lang(ru)` carry it into Nunito Sans Black at 75% width in uppercase.
- **Do** keep content visible at first paint. Apply rise and fade reveals only to elements whose top starts below 92% of the viewport height, and only once the script is running.
- **Do** keep the lamp as the single authored motion moment. Other motion (line rises, fades, parallax, pointer light, magnetic doors, the sideways work walk, Lenis smooth wheel scroll) supports it and switches off under `prefers-reduced-motion`.
- **Do** put the two doors, request and WhatsApp, in every hall that asks for action. Mark that hall `data-doors` so the floating pair stands aside.
- **Do** hang work as framed exhibits with Frame Cast and the 10px offset seam outline.
- **Do** keep text at Faded Bone or brighter. Faded Bone is the contrast floor.

### Don't:
- **Don't** build numbered or enumerated step lists ("01 Request / 02 Consultation / ..."), and don't use bullet-heavy feature lists.
- **Don't** use Nunito for an English headline, Bogle for body text, or Pacifico for anything a visitor must read to act.
- **Don't** fill large areas with brass or use it for body text.
- **Don't** hide content with initial opacity 0 in CSS or in server markup. A slow phone must see the page, not a blank wall.
- **Don't** put white or light cards on the wall. Raised surfaces are Raised Wall or Alcove, and only exhibits cast shadows.
- **Don't** add small uppercase labels above headlines. The hall's name stands alone, with the script line under it.
- **Don't** add a third door or a competing call to action. The request and WhatsApp are the only two.
