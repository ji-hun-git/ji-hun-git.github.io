/* ══════════════════════════════════════════════════════════════════════
   SHELF FIELD — the page the shelf is standing on
   ══════════════════════════════════════════════════════════════════════
   A one-pass character field: the CV's own vocabulary, set in monospace at
   ~5% ink, running behind the library as ground texture. At reading distance
   it is paper tooth. Lean in and it resolves into the words the shelf in
   front of it is already saying.

   WHY THIS REPLACED THE GHOST BOOKCASE THIS FILE USED TO DRAW
   -----------------------------------------------------------------------
   The previous pass drew a second bookcase — uprights, boards, spine runs —
   behind the real one. Two problems, both visible once it was magnified:

   1. It repeated the signature element. The shelf is the thing the page is
      for; putting a low-contrast copy of it behind itself is competition,
      not depth. The ghost boards also landed near-but-not-on the real shelf
      lines, which reads as misalignment rather than as a room.
   2. Its strongest features were long horizontal board rules running the
      full width. A rule is structure. Structure in a background is exactly
      what "recede" rules out, and it sat oddly with a site that deliberately
      removed the boxes around its chips and capabilities.

   Words have no silhouette and draw no rules. They are the one thing that
   can carry this much of the page and still read as surface.

   WHAT WAS KEPT
   -----------------------------------------------------------------------
   Everything structural, because it was right: one canvas, one z-index gap
   inside the section's own stacking context, one draw with a fixed seed, no
   animation loop, suppressed for reader mode and print. Only the drawing
   changed.

   NO MOTION AT ALL
   -----------------------------------------------------------------------
   Nothing here animates, so there is no prefers-reduced-motion branch to
   write and nothing that can collide with animateStableBookOpen or with
   book-motion.css's rotate/translate split. The field is painted once and
   then it is a still image. A background that moves while a book is opening
   is two things asking for the same attention.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var section = document.getElementById('work-library');
  if (!section) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'pl-shelf-field';
  canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;
  section.insertBefore(canvas, section.firstChild);

  /* Fixed seed: the field is a drawing, not a random draw. Same words in the
     same places on every load, on every device, at every window size. A
     background that reshuffles when you tilt your laptop reads as a bug. */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── The vocabulary ───────────────────────────────────────────────────
     Every term below is already on this page: the spine labels and venue
     codes on the shelf, plus the three phrases in the lede. Nothing is
     invented and nothing is aspirational — if a word leaves the CV it
     should leave this list, which is why they are written out rather than
     generated. Latin only: the field is a monospace grid and Hangul is
     double-width, so mixing them would tear the columns apart. */
  var TERMS = [
    'HUMAN-CENTERED AI', 'PRODUCT STRATEGY', 'HUMAN AGENCY',
    'ACCESSIBILITY', 'ACCESSIBLE AI', 'GAME ACCESS', 'ASSISTIVE AI',
    'AI AGENT', 'AI ASSISTANT', 'AI CHARACTERS', 'AI CHATBOT',
    'AI DESIGN', 'AI ETHICS', 'AI EVALUATION', 'USER RESEARCH',
    'COMPUTER VISION', 'OBJECT TRACKING', 'DATA QUALITY', 'GAZE',
    'MEDIA ANALYSIS', 'IMMERSIVE TECH', 'VR LEARN', 'HERITAGE',
    'EDUCATION', 'CLIMATE', 'FORECAST', 'PREDICTION', 'EXPOSURE',
    'BEHAVIOR', 'HEALTH', 'STRATEGY', 'MEDIA',
    'EXPLAINER', 'READER', 'SURROGATE', 'RAG',
    'KAIST', 'IUI', 'CHI', 'HCI', 'XR', 'GAIA', 'KGS', 'KCGS'
  ];

  var FONT_PX = 13;         // small enough to read as grain, not as copy
  var LINE_H  = 21;         // baseline rhythm of the field
  var CHUNK   = 10;         // characters per fillText — see fadeX
  var INK     = '23,24,27'; // --text (#17181b), the ground's own ink
  var PEAK    = 0.024;      /* strongest ink anywhere in the field.

                               Set by looking, at 1:1, with the field on
                               screen — and that qualifier is the whole
                               story. The first attempt at this number was
                               0.072, chosen because the page "looked almost
                               empty" in a screenshot. It was empty: reader
                               mode was left switched on in that browser
                               profile (it persists in localStorage), the
                               rule below had the canvas at display:none, and
                               the screenshot being tuned against contained
                               none of the thing being tuned. At 0.072 with
                               reader off, the vocabulary is plainly readable
                               behind the books and the page turns into a
                               word-search.

                               Ladder that was actually looked at, reader off,
                               768px, 1:1: 7.1% legible · 3.1% still resolves
                               into words in the bottom band · 2.4% reads as
                               grain with language in it. Hence 0.024, which
                               composites to rgb(242,241,238) against the
                               #f6f5f2 ground — about 4/255 at the darkest
                               stroke on the page. */

  /* One long ribbon of vocabulary, reshuffled each time it is exhausted so
     the sequence never visibly repeats. Rows slice into it at random
     offsets, which is what stops the terms stacking into columns. */
  function buildRibbon(rand, minLen) {
    var parts = [];
    var len = 0;
    while (len < minLen) {
      var pool = TERMS.slice();
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      for (var k = 0; k < pool.length; k++) { parts.push(pool[k]); len += pool[k].length + 3; }
    }
    return parts.join(' · ');
  }

  function smooth(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }

  /* ── Keep-out: the AA guarantee ───────────────────────────────────────
     The hard limit on this feature is that it must not pull any text below
     AA. Rather than trust a percentage constant to stay clear of the header
     forever, the field measures which text actually has no opaque backdrop
     of its own and refuses to paint a glyph anywhere near it.

     On this page that resolves to the wordmark and the lede: every other
     string in the section sits on a book object (.pl-volume__object paints
     an opaque rgb(38,58,78)), so the field is already behind an opaque
     surface and cannot affect it at all. If a future layout puts exposed
     text lower down, the field yields there automatically. */
  function isHidden(el) {
    var n = el;
    while (n && n !== document.body) {
      var cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return true;
      /* The standard screen-reader-only pattern: a 1px clipped box. Its
         children still report full layout rects, so without this the
         invisible "All works are visible…" line would carve an 800px
         hole in the field. */
      if (cs.clipPath === 'inset(50%)') return true;
      if (cs.clip === 'rect(0px, 0px, 0px, 0px)') return true;
      if (cs.overflow === 'hidden' && (n.clientWidth <= 1 || n.clientHeight <= 1)) return true;
      n = n.parentElement;
    }
    return false;
  }

  function hasOpaqueBackdrop(el) {
    var n = el;
    while (n && n !== document.body) {
      var m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
      if (m && (m.length < 4 || parseFloat(m[3]) > 0.9)) return true;
      n = n.parentElement;
    }
    return false;
  }

  var KEEP_PAD = 12;

  function exposedTextRects() {
    var sec = section.getBoundingClientRect();
    var ox = sec.left + section.clientLeft;
    var oy = sec.top + section.clientTop;
    var rects = [];
    var walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      var el = node.parentElement;
      if (!el || hasOpaqueBackdrop(el) || isHidden(el)) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      rects.push({
        x0: r.left - ox - KEEP_PAD, y0: r.top - oy - KEEP_PAD,
        x1: r.right - ox + KEEP_PAD, y1: r.bottom - oy + KEEP_PAD
      });
    }
    return rects;
  }

  function draw() {
    /* Reader mode hides this canvas outright (see shelf-field.css), and it
       persists in localStorage — so this branch is not an edge case, it is
       a setting a real visitor can be sitting in for months. Measuring the
       keep-out over the whole section and painting thirty rows of texture
       into a display:none element is work the accessibility path should
       never pay for. */
    if (!canvas.getClientRects().length) return;

    var w = section.clientWidth;
    var h = section.clientHeight;
    if (!w || !h) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.font = FONT_PX + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    var keep = exposedTextRects();

    /* The ramp is the aesthetic half of the same idea: the field does not
       merely avoid the header lockup, it stays away from it. Anchored to
       where the lede actually ends rather than to a fraction that was true
       at one window size. Clamped so an odd measurement can only make the
       field smaller, never let it climb into the wordmark. */
    var headerBottom = 0;
    for (var q = 0; q < keep.length; q++) {
      if (keep[q].y0 < h * 0.40 && keep[q].y1 > headerBottom) headerBottom = keep[q].y1;
    }
    headerBottom = Math.max(h * 0.18, Math.min(h * 0.42, headerBottom));

    var top0 = headerBottom + 26;
    var top1 = top0 + 110;
    /* The field is the ground the shelf stands on, so it should be gone by
       the time the shelf is. The last stretch of the section holds the
       "Explore the full CV" control and nothing else; texture crowding the
       one call to action on the page is the definition of competing. */
    var bot0 = h - Math.max(110, h * 0.16);

    function fadeY(y) {
      var a = smooth((y - top0) / (top1 - top0));
      var b = smooth((h - y) / (h - bot0));
      return a * b;
    }

    /* The shelf is centred and the margins are wide (at 1280px it runs
       347→919 of 1265). Easing the field down through the middle keeps it
       quietest exactly where the books are and lets it settle into the
       margins, which is the only place it has the page to itself. */
    function fadeX(x) {
      var d = Math.abs(x / w - 0.5) / 0.34;
      return 0.62 + 0.38 * smooth(d);
    }

    function blocked(x, y, segW) {
      var y0 = y - LINE_H / 2, y1 = y + LINE_H / 2, x1 = x + segW;
      for (var i = 0; i < keep.length; i++) {
        var k = keep[i];
        if (x < k.x1 && x1 > k.x0 && y0 < k.y1 && y1 > k.y0) return true;
      }
      return false;
    }

    var rand = rng(20260814);
    var adv = ctx.measureText('0').width || FONT_PX * 0.6;
    var cols = Math.ceil(w / adv) + 2;
    var rows = Math.ceil(h / LINE_H);
    var ribbon = buildRibbon(rand, cols * 6 + 400);

    for (var r = 0; r < rows; r++) {
      var y = r * LINE_H + LINE_H / 2;
      var fy = fadeY(y);
      if (fy <= 0.002) continue;

      /* Per-row weight, indent and early stop. Without these the field is a
         justified block of text — a rectangle, which is the one shape this
         site does not put around things. With them the edges stay ragged
         and it reads as surface. */
      var rowA = PEAK * fy * (0.55 + rand() * 0.45);
      var indent = Math.floor(rand() * 14);
      var trim = Math.floor(rand() * 20);
      var take = cols - indent - trim;
      if (take < 8) continue;

      var start = Math.floor(rand() * (ribbon.length - take - 2));
      var line = ribbon.substr(start, take);

      for (var c = 0; c < line.length; c += CHUNK) {
        var seg = line.substr(c, CHUNK);
        if (!seg.trim()) continue;
        var x = (indent + c) * adv;
        var segW = seg.length * adv;
        var a = rowA * fadeX(x + segW / 2);
        if (a < 0.004) continue;
        if (blocked(x, y, segW)) continue;
        ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(4) + ')';
        ctx.fillText(seg, x, y);
      }
    }
  }

  /* Deliberately not requestAnimationFrame: rAF does not fire in a tab that
     is not compositing, which would leave the field blank on a background
     load until the tab was focused. A one-shot drawing has no reason to wait
     for a frame at all. */
  /* 520ms, and the number is load-bearing.

     Opening a book grows this section — measured 1120px -> 2428px at 1200px
     wide — which trips the ResizeObserver below. At the old 120ms the redraw
     landed about a fifth of the way into an open that book-motion.css
     documents as settling at ~470ms, and the redraw is not free: with a book
     open the canvas is 11.5 megapixels, and one pass costs ~11ms on the main
     thread (6ms measuring the keep-out across 515 text nodes, 4.8ms
     painting). That is a whole frame's budget spent in the middle of the one
     animation on this page anybody looks at closely.

     520ms clears the settle with margin, so the field repaints once the book
     is at rest. Nothing here animates, so a late repaint costs nothing: the
     field is a still image either way, and for the half second it is stale
     it is a 2%-ink texture at the wrong height behind an opaque reader
     card. */
  var pending = null;
  function schedule() {
    clearTimeout(pending);
    pending = setTimeout(draw, 520);
  }

  draw();

  if (window.ResizeObserver) {
    new ResizeObserver(schedule).observe(section);
  } else {
    window.addEventListener('resize', schedule, { passive: true });
  }

  /* The shelf renders after its data loads and the section grows; redraw
     once the library has settled so the field covers the final height and
     measures the keep-out against the finished layout. */
  window.addEventListener('load', schedule, { once: true });
})();
