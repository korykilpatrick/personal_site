# Design Rubric

This is the aesthetic contract for the personal site. `/design-loop` measures every change against this file.

## Emotional register

**Site-wide.** A living study: warm, personal, grounded, and exact. The quality-without-a-name is the target; every screen should feel alive and whole, not assembled. Restraint should make Kory's thinking more present, not make the site feel empty.

**Bookshelf page.** Analog library — the felt sense of standing among books, the quiet magic of a collection, the hum of accumulated reading life. Not a list of titles. The page is internet-native, so modern restraint is welcome, but the _feel_ leans analog: paper, cloth, ribbon, stamped ink.

## North stars

- **Analog library / archive** — card catalogs, Dewey drawers, stamped date-due slips, ribbon markers, cloth-bound spines. Borrow the vocabulary of physical books without photographing them.
- **Christopher Alexander's _The Nature of Order_** — centers, wholeness, the quality-without-a-name. Strong, unambiguous centers; parts that feel necessary, not decorative.
- **Small-press book design** — Everyman's Library, New Directions, Fitzcarraldo — paper-first typography, quiet confidence, restraint as a design choice.
- **Craig Mod / Robin Sloan / Maggie Appleton-adjacent personal sites** — text-forward, pattern-rich, slightly irregular in a human way, never corporate.

## One house, several rooms

The shell is a quiet compass. Each destination keeps the same paper, ink, rules, and typographic proportions, but has a distinct spatial job:

- **Home is a threshold.** One statement, one image, and three paths. No résumé summary or product copy.
- **Posts are a field and a study.** The map should feel drawn on the page; the reader should feel composed for sustained attention.
- **Bookshelf is a library.** Books and reading state may carry more material detail than the rest of the site, but never faux texture.
- **About is a biographical room.** A strong first sentence, an actual photograph, and an unhurried narrative.
- **Quotes are a commonplace book.** One complete passage at a time, advanced by the reader rather than a timer.

## Hard no's

- **Generic SaaS chrome** — Stripe/Vercel-style glassy cards, default brand-blue CTAs, dashboard shadows, "app" feel. This is not an app.
- **Skeuomorphic kitsch** — overwrought paper textures, faux wood grain, stitched dashed borders, excessive drop shadows, satin gradients. Evocative of physicality is good; _imitation_ of physicality is embarrassing. The bookshelf should _feel_ analog, not cosplay it.
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

- **Paper field** — cream ground with barely visible grain and contour, never a card sitting on another card. The atlas and large reading surfaces use the page itself as their container.
- **Rule as joinery** — walnut hairlines connect and separate regions. Prefer a rule, alignment, or change in measure before adding a box, radius, or shadow.
- **Quiet compass** — the sticky header is slim, legible, and subordinate. Active destinations use an oxblood underline; secondary destinations live under one `Elsewhere` disclosure.
- **Marginal note** — contextual detail attaches to its source. The atlas dossier is a light paper margin on desktop and a compact bottom sheet on small screens. Footnotes open beside their marker.
- **House dingbat (◆)** — a small oxblood diamond used sparingly at major thresholds and reading breaks. Repetition makes it a signature; proliferation makes it decoration.
- **Mono furniture** — labels, counts, controls, and provenance use small IBM Plex Mono. They should orient the reader, never compete with Newsreader titles or body copy.

## Notes

- The bookshelf is the flagship page for "signal-your-taste." It carries more weight than other pages; hold a higher bar.
- When a detail tempts you toward literal physical imitation, ask: "is this evoking the _feeling_ of a library, or cosplaying a library?" If the latter, pull back.
- Ribbons, tabs, spines, stamps, cloth, and paper are fair game as _inspiration_. Satin gradients, dashed stitching, faux wood grain, and faux-fabric textures cross the line into cosplay.
- Progressive disclosure is the default for provenance, concepts, map instructions, and secondary destinations. It should reduce noise without hiding the next meaningful action.
- This file should get sharper each loop. Edit freely.
