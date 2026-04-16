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

## Pattern vocabulary

Names for patterns as they emerge and get validated. New additions require earning their keep — reach for existing ones first.

- **Ribbon-card.** Used on the bookshelf filter/sort/search controls. A flat muted-cloth tab (burgundy, moss, indigo — Everyman's Library register) with a darker selvedge hairline and a V-notched tail hangs from the top of the shelf frame. Clicking extends the ribbon into a library-card panel: cream paper, ruled horizontal underlines between rows, UPPERCASE mono labels in warm ink-brown, V-notched bottom. Evocative of silk bookmarks and card catalogs without any satin sheen, dashed stitching, or photographic textures. See [BookshelfControls.tsx](frontend/src/components/bookshelf/BookshelfControls.tsx).

## Notes

- The bookshelf is the flagship page for "signal-your-taste." It carries more weight than other pages; hold a higher bar.
- When a detail tempts you toward literal physical imitation, ask: "is this evoking the *feeling* of a library, or cosplaying a library?" If the latter, pull back.
- Ribbons, tabs, spines, stamps, cloth, paper-cream — all fair game as *inspiration*. Satin gradients, dashed stitching, and faux-fabric textures are the cliff edge — use them only if the result feels genuinely Alexander-whole, not crafty.
- This file should get sharper each loop. Edit freely.
