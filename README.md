# Data Skills Academy — landing page redesign

Static, self-contained redesign of the Data Skills Academy landing page.
No build step and no framework — open `index.html` in a browser.

    index.html        the page
    index-dark.html   earlier dark variant, kept for reference only
    assets/dsa.css    all styles (tokens at the top)
    assets/dsa.js     header, scroll reveal, counters, live-lab demo

## Brand

Every brand value is taken straight from the live site's own `:root` block,
so this drops into the existing theme without a palette change:

| token           | value     | used for                        |
|-----------------|-----------|---------------------------------|
| `--blue`        | `#0D6EFD` | header, primary fills, accents  |
| `--blue-light`  | `#4D9BFF` | accents on dark surfaces        |
| `--blue-dark`   | `#0847C0` | deep blue fills                 |
| `--ink`         | `#05192D` | hero, institutions block, footer|
| `--ink-mid`     | `#1E3A5F` | body copy                       |
| `--muted`       | `#6B8CAD` | secondary copy                  |
| `--surface`     | `#F0F5FF` | tinted sections                 |
| `--orange`      | `#FF9013` | the Register / primary CTA      |

Radii (`8 / 16 / 28 / 48`), `--shadow-blue`, `--shadow-card` and `--transition`
are the site's existing values. Typeface is DM Sans, as on the live site, with
JetBrains Mono for code.

Three extra tokens are added — `--blue-text`, `--orange-text`, `--muted-text`.
The brand colours are used as *fills*; these are slightly darkened partners used
only where the same colour has to be small *text*, so 11–13px labels clear the
4.5:1 contrast minimum instead of sitting at 2.7:1. No brand fill was changed.

## Porting to Django

* `assets/dsa.css` → `static/css/dsa.css`
* `assets/dsa.js`  → `static/js/dsa.js`
* `index.html`     → split into `base.html` (header + footer) and `home.html`
  (everything inside `<main>`), then swap the hard-coded cards for
  `{% for %}` loops over the existing course / specialization / post querysets.

Every link already points at the real URL patterns on the live site
(`/course/<slug>/`, `/course-detail/<slug>/`, `/program/<slug>/specialization/`,
`/interview/start-choice/`, `/institutional/contact/`, `/all_courses/`, …).

## Note on the live code demo

The Run button in the "Live practice" section plays a scripted output for the
Python, SQL and Algorithms tabs — it is not executing code. Swapping it for a
real runtime is a one-function change in `dsa.js` (`run()`): point it at Pyodide
in-browser, or at a sandboxed exec endpoint on the server.

## Verified

* No horizontal scroll at 390 / 820 / 1280 / 1600px
* No console errors
* All three lab tabs execute and render their output
* Text contrast measured against real painted pixels, not assumed backgrounds —
  every text/background pair clears WCAG AA
* `prefers-reduced-motion` respected
