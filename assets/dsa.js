/* ==========================================================================
   Data Skills Academy — redesign
   assets/dsa.js   (maps to static/js/dsa.js in Django)
   No dependencies. Progressive enhancement only — the page works without it.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- sticky header ---------------------------------------------------- */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("stuck", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- mobile drawer ---------------------------------------------------- */
  var burger = document.querySelector("[data-burger]");
  var drawer = document.querySelector("[data-drawer]");
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = drawer.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---- scroll reveal ---------------------------------------------------- */
  var revealables = document.querySelectorAll(".rv");
  if (!revealables.length) { /* nothing */ }
  else if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- pointer-follow glow on cards ------------------------------------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    });
  });

  /* ---- count-up stats --------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var dp = (el.dataset.dp | 0);
    if (reduce) { el.textContent = target.toFixed(dp) + suffix; return; }
    var start = performance.now(), dur = 1100;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) { counters.forEach(countUp); }
    else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ======================================================================
     Live lab — tabbed code demo
     Output is a scripted playback, not a real interpreter. Swap `runners`
     for a Pyodide / server-exec call to make it genuinely live.
     ====================================================================== */
  var LAB = {
    python: {
      file: "sales_analysis.py",
      lang: "Python 3.12 · pandas",
      code: [
        ['<span class="k">import</span> pandas <span class="k">as</span> pd'],
        [''],
        ['<span class="c"># Q1 orders exported from the warehouse</span>'],
        ['df = pd.<span class="f">read_csv</span>(<span class="s">"orders_q1.csv"</span>, parse_dates=[<span class="s">"placed_at"</span>])'],
        [''],
        ['<span class="v">revenue</span> = (df'],
        ['    .<span class="f">assign</span>(line_total=df.qty * df.unit_price)'],
        ['    .<span class="f">groupby</span>(df.placed_at.dt.<span class="f">to_period</span>(<span class="s">"M"</span>))'],
        ['    .<span class="f">agg</span>(orders=(<span class="s">"order_id"</span>, <span class="s">"nunique"</span>),'],
        ['         revenue=(<span class="s">"line_total"</span>, <span class="s">"sum"</span>)))'],
        [''],
        ['<span class="f">print</span>(<span class="v">revenue</span>.<span class="f">round</span>(<span class="n">2</span>))']
      ],
      out: [
        '<span class="dim">$ python sales_analysis.py</span>',
        '',
        '            orders     revenue',
        'placed_at                     ',
        '2026-01       1240   184320.50',
        '2026-02       1388   211964.75',
        '2026-03       1602   258811.20',
        '',
        '<span class="ok">✓ finished in 0.42s — 4230 rows scanned</span>'
      ]
    },
    sql: {
      file: "top_customers.sql",
      lang: "PostgreSQL 16",
      code: [
        ['<span class="c">-- Top 5 customers by lifetime value</span>'],
        ['<span class="k">SELECT</span>  c.name,'],
        ['        <span class="f">COUNT</span>(<span class="k">DISTINCT</span> o.id)      <span class="k">AS</span> orders,'],
        ['        <span class="f">ROUND</span>(<span class="f">SUM</span>(l.qty * l.price), <span class="n">2</span>) <span class="k">AS</span> lifetime_value'],
        ['<span class="k">FROM</span>    customers  c'],
        ['<span class="k">JOIN</span>    orders     o <span class="k">ON</span> o.customer_id = c.id'],
        ['<span class="k">JOIN</span>    order_lines l <span class="k">ON</span> l.order_id   = o.id'],
        ['<span class="k">WHERE</span>   o.placed_at &gt;= <span class="s">\'2026-01-01\'</span>'],
        ['<span class="k">GROUP BY</span> c.name'],
        ['<span class="k">HAVING</span>  <span class="f">COUNT</span>(<span class="k">DISTINCT</span> o.id) &gt; <span class="n">3</span>'],
        ['<span class="k">ORDER BY</span> lifetime_value <span class="k">DESC</span>'],
        ['<span class="k">LIMIT</span>   <span class="n">5</span>;']
      ],
      out: [
        '<span class="dim">$ psql -f top_customers.sql</span>',
        '',
        ' name              | orders | lifetime_value',
        '-------------------+--------+---------------',
        ' Meridian Labs     |     31 |       48210.00',
        ' Halcyon Retail    |     27 |       41905.60',
        ' Northwind Co.     |     22 |       37440.15',
        ' Ardent Analytics  |     19 |       29118.80',
        ' Blue Harbor Ltd   |     14 |       22730.45',
        '',
        '<span class="ok">✓ 5 rows · 18 ms</span>'
      ]
    },
    dsa: {
      file: "two_sum.py",
      lang: "Playgram · judge",
      code: [
        ['<span class="c"># LeetCode-style: return indices summing to target</span>'],
        ['<span class="k">def</span> <span class="f">two_sum</span>(nums, target):'],
        ['    <span class="v">seen</span> = {}                      <span class="c"># value -&gt; index</span>'],
        ['    <span class="k">for</span> i, n <span class="k">in</span> <span class="f">enumerate</span>(nums):'],
        ['        <span class="v">need</span> = target - n'],
        ['        <span class="k">if</span> <span class="v">need</span> <span class="k">in</span> <span class="v">seen</span>:'],
        ['            <span class="k">return</span> [<span class="v">seen</span>[<span class="v">need</span>], i]'],
        ['        <span class="v">seen</span>[n] = i'],
        ['    <span class="k">return</span> []'],
        [''],
        ['<span class="c"># O(n) time, O(n) space — one pass</span>']
      ],
      out: [
        '<span class="dim">$ playgram submit two_sum.py</span>',
        '',
        'Test  1/24  [2,7,11,15] t=9   → [0,1]   <span class="ok">PASS</span>',
        'Test  2/24  [3,2,4]     t=6   → [1,2]   <span class="ok">PASS</span>',
        'Test  3/24  [3,3]       t=6   → [0,1]   <span class="ok">PASS</span>',
        '<span class="dim">…21 more hidden tests</span>',
        '',
        '<span class="ok">✓ Accepted — 24/24 · 41 ms · beats 96% of Python</span>'
      ]
    }
  };

  var tabs    = document.querySelectorAll("[data-tab]");
  var codeEl  = document.querySelector("[data-code]");
  var outEl   = document.querySelector("[data-out]");
  var fileEl  = document.querySelector("[data-file]");
  var langEl  = document.querySelector("[data-lang]");
  var runBtn  = document.querySelector("[data-run]");
  var typer   = null;

  function renderCode(key) {
    var d = LAB[key];
    if (!d || !codeEl) return;
    if (fileEl) fileEl.textContent = d.file;
    if (langEl) langEl.textContent = d.lang;
    codeEl.innerHTML = d.code.map(function (l) {
      return '<span class="ln">' + (l[0] || "") + "</span>";
    }).join("");
    if (outEl) outEl.innerHTML = '<span class="dim">Press Run to execute.</span>';
  }

  function run(key) {
    var d = LAB[key];
    if (!d || !outEl) return;
    clearTimeout(typer);
    outEl.innerHTML = "";
    if (reduce) { outEl.innerHTML = d.out.join("\n"); return; }
    var i = 0;
    (function next() {
      if (i >= d.out.length) return;
      outEl.innerHTML = d.out.slice(0, i + 1).join("\n");
      i++;
      typer = setTimeout(next, i === 1 ? 260 : 110);
    })();
  }

  if (tabs.length) {
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.setAttribute("aria-selected", "false"); });
        t.setAttribute("aria-selected", "true");
        renderCode(t.dataset.tab);
      });
    });
    renderCode(document.querySelector('[data-tab][aria-selected="true"]').dataset.tab);
  }
  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var active = document.querySelector('[data-tab][aria-selected="true"]');
      run(active ? active.dataset.tab : "python");
    });
  }

  /* ---- hero editor: type the code in on load ---------------------------- */
  var heroOut = document.querySelector("[data-hero-out]");
  if (heroOut && !reduce) {
    var lines = [
      '<span class="dim">$ python quickstart.py</span>',
      '',
      'Loaded 12,480 rows from titanic.csv',
      'Survival rate by class:',
      '  1st  62.9%   2nd  47.3%   3rd  24.2%',
      '',
      '<span class="ok">✓ Ready — your first model in 4 minutes</span>'
    ];
    var started = false;
    var play = function () {
      if (started) return; started = true;
      var i = 0;
      (function next() {
        if (i >= lines.length) return;
        heroOut.innerHTML = lines.slice(0, i + 1).join("\n");
        i++;
        setTimeout(next, i === 1 ? 700 : 240);
      })();
    };
    if ("IntersectionObserver" in window) {
      var hio = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { play(); hio.disconnect(); } }, { threshold: .3 });
      hio.observe(heroOut);
    } else { play(); }
  }

  /* ---- accordion (curriculum / FAQ) ------------------------------------- */
  document.querySelectorAll("[data-acc]").forEach(function (acc) {
    var btn = acc.querySelector("[data-acc-btn]");
    var pnl = acc.querySelector("[data-acc-panel]");
    if (!btn || !pnl) return;
    btn.addEventListener("click", function () {
      var open = acc.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      pnl.style.maxHeight = open ? pnl.scrollHeight + "px" : "0px";
    });
    if (acc.classList.contains("open")) {
      btn.setAttribute("aria-expanded", "true");
      pnl.style.maxHeight = pnl.scrollHeight + "px";
    }
  });

  /* ---- lesson page: scroll-spy on the table of contents ----------------- */
  var spyLinks = document.querySelectorAll("[data-spy] a");
  if (spyLinks.length && "IntersectionObserver" in window) {
    var map = {};
    var targets = [];
    spyLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var t = document.getElementById(id);
      if (t) { map[id] = a; targets.push(t); }
    });
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        spyLinks.forEach(function (a) { a.classList.remove("active"); });
        if (map[e.target.id]) map[e.target.id].classList.add("active");
      });
    }, { rootMargin: "-72px 0px -68% 0px", threshold: 0 });
    targets.forEach(function (t) { sio.observe(t); });
  }

  /* ---- lesson page: reading progress bar -------------------------------- */
  var prog = document.querySelector("[data-progress]");
  var article = document.querySelector("[data-article]");
  if (prog && article) {
    var tick = function () {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var done = total > 0 ? Math.min(Math.max(-r.top / total, 0), 1) : 1;
      prog.style.transform = "scaleX(" + done + ")";
    };
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
  }

  /* ---- copy-to-clipboard on code blocks --------------------------------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = btn.closest(".cbox") && btn.closest(".cbox").querySelector("pre");
      if (!pre || !navigator.clipboard) return;
      navigator.clipboard.writeText(pre.innerText).then(function () {
        var was = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = was; }, 1400);
      });
    });
  });
})();
