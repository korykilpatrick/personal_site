module.exports = {
  content: [
    './frontend/src/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/**/*.test.{js,jsx,ts,tsx}',
    '!./frontend/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/pages/dormant/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/library/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/projects/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/work/**/*.{js,jsx,ts,tsx}',
    '!./frontend/src/components/home/{CurrentlyReading,ExploreGrid,HomepageLibraryItem,NavCard,SiteNote,WelcomeBlurb}.tsx',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Primary ink — navy, used for body text, navbar, anchors, primary chrome.
        // Splitting this into separate `ink` + `chrome` tokens is a pending
        // cleanup (prereq for any future chrome color bakeoff); keeping it
        // unified for now since both jobs currently share the value.
        primary: {
          DEFAULT: '#15263f',
          dark: '#0c1727',
          light: '#274361',
        },
        // Paper — the site's warm ground. Cream-stock, not cool sky.
        // Tint audit kept only tints with live consumers:
        //   DEFAULT — main page paper (site-card, background)
        //   light   — cream-light (button/pill/tooltip text on dark chrome,
        //             Input disabled-fill surface hints)
        //   deep    — Input disabled background, slight popover surface
        // `deeper` was removed — no consumers.
        cream: {
          DEFAULT: '#f4ecd8',
          light: '#faf5ea',
          deep: '#ebe0c6',
        },
        // Warm neutral — walnut, the library's wood. Dividers, meta, chip
        // borders, card hairlines.
        // Tint audit kept only tints with live consumers:
        //   DEFAULT — walnut (NavCard accent, dormant border-t-walnut/40)
        //   dark    — walnut-dark (/quotes carousel preview ink)
        // `mid` and `light` were removed — no Tailwind consumers. Walnut-mid
        // #6b4f35 and walnut-light #8b6f4f still appear as hex literals in
        // CSS files (quoteDock.css markdown em, etc.) where the rule is
        // already self-contained.
        walnut: {
          DEFAULT: '#4a3423',
          dark: '#2a1d10',
        },
        // Stamp accent — oxblood. Used sparingly (≤10%) for punctuation:
        // reading-now dot, active tab, the house dingbat, link hover.
        // As of the warm-palette cleanup this is the ONLY accent color in
        // the system — the former cool-blue `secondary` token was removed
        // (every consumer now routes through oxblood for accent or walnut
        // for ink/border chrome). If a second accent is ever wanted (e.g.
        // old-gold sibling), add it here with an explicit semantic name.
        oxblood: {
          DEFAULT: '#9e3a2a',
          light: '#b54a37',
          dark: '#7a2b1e',
        },
        textPrimary: '#172331',  // navy ink on cream — unchanged, reads classic
        textSecondary: '#4a3d2a', // warm charcoal (walnut-ink) replacing cool slate
        textTertiary: '#7b6a50',  // warm muted — walnut.light territory
        background: '#f4ecd8',    // cream (was cool sky #edf2f8)
        // Note: `stone` (cool-gray scale) and `secondary` (cool-blue) were
        // both removed in the warm-palette cleanup. Any lingering grep hits
        // should be in comments only — see `rg -n "\b(secondary|stone)\b"`.
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Newsreader', 'IBM Plex Serif', 'ui-serif', 'Georgia'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
