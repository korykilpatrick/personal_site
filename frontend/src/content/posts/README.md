# Private post authoring

Post bodies and editorial metadata live in Postgres and are fetched at runtime. They
must never be added to this public repository. Local source files belong under the
ignored `.private/posts/` directory and exist only as import material.

The source directory contains Markdown bodies plus `manifest.json`, `taxonomy.json`,
and `graph-layout.json`. Validate and import it into a non-production database with:

```sh
npm run validate:posts
ENV_FILE=.env.development.local npm --prefix server run posts:import -- --source "$PWD/.private/posts" --dry-run
ENV_FILE=.env.development.local npm --prefix server run posts:import -- --source "$PWD/.private/posts"
```

The importer refuses to run when `NODE_ENV=production`. Public endpoints return only
posts whose status is `published` and whose publication time has arrived. A preview
build (`npm run build:posts-preview`) reads drafts through authenticated `/api/admin`
routes and sends `Cache-Control: private, no-store`.

For an interactive local review, run `npm run start:posts-preview`, sign in once at
`/login`, and return to `/posts`. The login flow preserves the complete map/filter URL.

The local env file must also set `POSTS_IMPORT_TARGET=local-preview`; imports are
accepted only for the isolated loopback `personal_site_posts_preview` database. Each
import is a full sync: rows missing from the source bundle are made inactive and
disappear from both public and preview reads.

`sourcePeriod` is the span attached to the source material or event, not a formal
publication date; the UI labels it “Drawn from the archive.”

Do not add an H1 to a body. The post page supplies the title and dek. Start with prose or an occasional `##` section.

## Themes, concepts, and graph relationships

The graph has three different editorial layers:

- `themes` are the eight curated clearings in the visual map. Give each post one
  primary theme and only genuinely useful secondary themes.
- `conceptIds` are canonical tags in the private taxonomy. Reuse an existing
  concept before adding a near-synonym.
- `relations` are deliberate post-to-post edges. Every relation needs a target,
  a semantic kind, and a short reason that is useful to a reader. Links inside
  Markdown are also represented in the graph, while lower-priority similarities
  are inferred from shared themes and concepts.

After adding, linking, or re-theming a post, run `npm run posts:layout`. The offline
layout weights authored links, body links, and inferred kinship, then commits stable
positions and a source fingerprint to the private layout file; the browser never runs
a force simulation. `npm run validate:posts` checks graph integrity and layout drift.

## Links

Standard Markdown links work. Links beginning with `/` stay inside the React app; external links open in a new tab.

Link a recurring idea when the earlier piece gives the reader useful context. Prefer linking an
existing phrase over adding a sentence whose only job is to point elsewhere.

```md
[another essay](/posts/example-essay)
[an external source](https://example.com)
```

## Contextual footnotes

Wrap the exact word or phrase the note belongs to. Numbers are assigned in reading order.

```md
I learned this on <Footnote note="The useful context, ideally under 120 words.">the long walk home</Footnote>.
```

Footnotes open on hover, focus, click, or tap; Escape closes them. The note is also exposed in print. If an aside needs several paragraphs, it belongs in the essay.

## Images

Normal Markdown images stay in the reading column:

```md
![Useful alternative text](https://media.example.com/example/photo.webp 'Optional caption')
```

Use `Figure` when the image should run wider. `align` accepts `body`, `wide`, or `full`.

```md
<Figure
  src="https://media.example.com/example/photo.webp"
  alt="Required description of what the image shows"
  caption="Optional caption and credit"
  width="1600"
  height="1000"
  align="wide"
/>
```

Draft media must not be committed under `public/`. Store it in the private media
system and use its HTTPS URL in the post body. Prefer WebP or AVIF, include real
dimensions, and do not use an image merely to fill a slot.

## YouTube, X, and hosted video

Only the controlled components below can create embeds; raw scripts and iframes are rejected by the content validator.

```md
<YouTube
  url="https://www.youtube.com/watch?v=VIDEO_ID"
  title="A descriptive title"
  caption="Optional context"
/>

<Tweet
  url="https://x.com/person/status/1234567890"
  author="Name (@handle)"
  fallback="A durable summary or short excerpt for readers whose blocker hides the embed."
/>

<Video
  src="https://media.example.com/example/clip.mp4"
  poster="https://media.example.com/example/clip-poster.webp"
  captionsSrc="https://media.example.com/example/clip.en.vtt"
  captionsLanguage="en"
  captionsLabel="English"
  title="A descriptive title"
  caption="Optional context"
/>
```

Self-hosted video requires either `captionsSrc` or `transcriptUrl`. YouTube uses the
privacy-enhanced host. All media lazy-loads or uses metadata-only preload; nothing
autoplays.

## Pull quotes

Use at most once in a long piece, and only for a line that deserves to become a visual center.

```md
<PullQuote attribution="Optional attribution">
The quote goes here.
</PullQuote>
```

## Editorial rules

- Keep Kory's vocabulary, cadence, bluntness, uncertainty, digressions, and humor.
- Prefer a concrete scene or mechanism to a claim about importance.
- Do not invent facts, examples, quotes, or beliefs.
- Never draw from a source marked `🔒` without a separate, explicit decision from Kory.
- Run `npm run validate:posts` before review or publication.
