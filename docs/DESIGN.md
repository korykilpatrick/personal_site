# Design Rubric

This is the aesthetic contract for the personal site. `/design-loop` measures every change against this file.

## Emotional register

**Site-wide.** Warm, professional but personal. Authentic, creative, grounded, polished. A visitor (often a professional peer evaluating the site) should come away thinking: "this person has real taste — sharp, intentional, interesting, not sloppy." The quality-without-a-name is the target; every screen should feel alive and whole, not assembled.

**Bookshelf page.** Analog library — the felt sense of standing among books, the quiet magic of a collection, the hum of accumulated reading life. Not a list of titles. The page is internet-native, so modern restraint is welcome, but the *feel* leans analog: paper, cloth, ribbon, stamped ink.

## North stars

- **Analog library / archive** — card catalogs, Dewey drawers, stamped date-due slips, ribbon markers, cloth-bound spines. Borrow the vocabulary of physical books without photographing them.
- **Christopher Alexander's *The Nature of Order*** — centers, wholeness, the quality-without-a-name. Strong, unambiguous centers; parts that feel necessary, not decorative.
- **Small-press book design** — Everyman's Library, New Directions, Fitzcarraldo — paper-first typography, quiet confidence, restraint as a design choice.
- **Craig Mod / Robin Sloan / Maggie Appleton-adjacent personal sites** — text-forward, pattern-rich, slightly irregular in a human way, never corporate.

## Hard no's

- **Generic SaaS chrome** — Stripe/Vercel-style glassy cards, default brand-blue CTAs, dashboard shadows, "app" feel. This is not an app.
- **Skeuomorphic kitsch** — overwrought paper textures, faux wood grain, stitched dashed borders, excessive drop shadows, satin gradients. Evocative of physicality is good; *imitation* of physicality is embarrassing. The bookshelf should *feel* analog, not cosplay it.
- **Sterile flatness** — pure flat Material-style minimalism with no warmth or material hint. Grounded, not sterile.
- **Visual noise** — competing accents, decorative bloat, too many colors, busy textures behind text.

## Palette — the four-note library chord

The site commits to four colors, used in roughly 60/25/10/<5 proportions. Every new surface should reach for one of these registers before inventing anything.

- **Paper** — cream (`#f4ecd8` / `#faf5ea` / `#ebe0c6`). The ground. Body background, card fills, popover surfaces.
- **Ink** — navy (`#15263f` / `#172331`). Primary text, anchors, navbar frame, book-hover tooltips (navy-cloth-bound panels on cream paper).
- **Wood** — walnut (`#4a3423` / `#6b4f35`). Secondary / meta ink: dividers, rules, chip borders, shelf graphics, inactive menu rows, warm drop-shadows under books. Replaces the cool-slate grays elsewhere in the site.
- **Stamp** — oxblood (`#9e3a2a` / `#b54a37`). ≤10% usage: navbar active pill, house dingbat (◆), currently-reading ember glow, link-hover color, filter popover selection marker. Never the dominant color on a surface.

Temperature alignment is the whole point — warm ground plus one warm neutral plus one warm accent, with navy as the cool ink that grounds everything. Cool-blue accents (the legacy `secondary`) are retired from visible surfaces; keep only for focus-rings and legacy components until they're touched.

## Pattern vocabulary

Names for patterns as they emerge and get validated. New additions require earning their keep — reach for existing ones first.

- **Paper-slip popover** — extends `site-card-soft`. Cream-paper background (`rgba(250,245,234,0.94)` over backdrop-blur), 14px radius, walnut hairline border (`rgba(74,52,35,0.18)`), warm drop-shadow with a cream inset highlight, navy body ink. Use for transient surfaces that sit atop content and should read as a slip of paper laid on the page. Selected rows get a walnut whisper tint (`rgba(74,52,35,0.08)`) and a small oxblood `◆` marker; hover rows get a walnut breath tint (`rgba(74,52,35,0.04)`).
- **Paper-slip chip** — extends `site-link-chip` for removable selections. Cream-paper fill, 12px radius, walnut hairline border, mono caps at ~0.64rem / 0.14em tracking, trailing `×` in quiet walnut ink that warms to oxblood on hover. Reads as a small index slip inline with surrounding typography.
- **House dingbat (◆)** — a small oxblood diamond used as the house mark across the site. Appears as: the selection marker inside the paper-slip popover; the signature eyebrow on the About page (walnut rule + ◆ + walnut rule); the ember glow beneath currently-reading books (same ink, different form). The repetition is the signature — new uses should extend this vocabulary rather than invent alternatives.
- **Warm navbar pill** — navy-glass active pill with oxblood-tinted border and fill (`border-oxblood/50 bg-[rgba(158,58,42,0.28)]`), white text. Used for the active nav link. This is the single warm-on-dark treatment on the site and serves as the navbar's "lifted" element.
- **Navy-cloth tooltip** — small Radix tooltip styled as a navy-glass panel (matches the navbar material) with cream/90 text and cream-tinted shelf pills inside. Reads as a navy-cloth-bound bookmark floating next to the content.

## Notes

- The bookshelf is the flagship page for "signal-your-taste." It carries more weight than other pages; hold a higher bar.
- When a detail tempts you toward literal physical imitation, ask: "is this evoking the *feeling* of a library, or cosplaying a library?" If the latter, pull back.
- Ribbons, tabs, spines, stamps, cloth, paper-cream — all fair game as *inspiration*. Satin gradients, dashed stitching, and faux-fabric textures are the cliff edge — use them only if the result feels genuinely Alexander-whole, not crafty.
- This file should get sharper each loop. Edit freely.
