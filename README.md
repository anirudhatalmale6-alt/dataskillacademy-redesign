# Data Skills Academy — landing page redesign

Static, self-contained redesign of the Data Skills Academy landing page.
No build step and no framework — open `index.html` in a browser.

    index.html        the page
    assets/dsa.css    all styles (tokens at the top)
    assets/dsa.js     header, scroll reveal, counters, live-lab demo

## Porting to Django

* `assets/dsa.css` → `static/css/dsa.css`
* `assets/dsa.js`  → `static/js/dsa.js`
* `index.html`     → split into `base.html` (header + footer) and `home.html`
  (everything inside `<main>`), then swap the hard-coded cards for
  `{% for %}` loops over the existing course / specialization / post querysets.

Every link already points at the real URL patterns on the live site
(`/course/<slug>/`, `/program/<slug>/specialization/`, `/interview/start-choice/`,
`/institutional/contact/`, …).

## Note on the live code demo

The Run button in the "Live practice" section plays a scripted output for the
Python, SQL and Algorithms tabs — it is not executing code. Swapping it for a
real runtime is a one-function change in `dsa.js` (`run()`): point it at Pyodide
in-browser, or at a sandboxed exec endpoint on the server.
