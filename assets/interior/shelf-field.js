/* ══════════════════════════════════════════════════════════════════════
   SHELF FIELD — draws the ghost bookcase described in shelf-field.css
   ══════════════════════════════════════════════════════════════════════
   Box-drawing characters, one pass, no animation loop. The whole thing
   costs a couple of milliseconds at load and nothing afterwards; a
   portfolio landing page should not hold a rAF open to render wallpaper.

   The drawing is a bookcase: irregular uprights, irregular shelf boards,
   proper corner glyphs where they meet, and runs of spines leaning in
   some of the cells. Random noise would have been cheaper and would have
   looked like noise — the structure is what makes it read as a room the
   real shelf is standing in.
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

  /* Fixed seed: the bookcase is a drawing, not a random draw. Same shape
     on every load, on every device, at every window size. */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var CELL_W = 13;          // one character column
  var CELL_H = 21;          // one character row
  var INK = '23,24,27';     // --text, as rgb parts
  var BASE_ALPHA = 0.075;   /* ~8% ink at its strongest, on a cream ground */

  /* Spine glyphs, lightest first. Weighting toward the thin ones keeps the
     field from turning into a picket fence. */
  var SPINES = ['│', '│', '┊', '┆', '▏', '▕', '┃', '║'];

  function draw() {
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
    ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    var cols = Math.ceil(w / CELL_W);
    var rows = Math.ceil(h / CELL_H);
    var rand = rng(20260814);

    /* The header lockup measures 4–19% of the section and the real shelf
       starts at ~23%, so the field ramps in across 20–34%: nothing under the
       wordmark, full strength only once there are books in front of it. A
       texture running under a 2.8rem headline is a texture fighting the
       headline. */
    function fade(row) {
      var t = row / rows;
      var top = Math.min(1, Math.max(0, (t - 0.20) / 0.14));
      var bottom = Math.min(1, Math.max(0, (1 - t) / 0.10));
      return top * bottom;
    }

    function put(col, row, ch, strength) {
      var a = BASE_ALPHA * strength * fade(row);
      if (a < 0.004) return;
      ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(4) + ')';
      ctx.fillText(ch, col * CELL_W + CELL_W / 2, row * CELL_H + CELL_H / 2);
    }

    /* ── Uprights: irregular, 9–17 columns apart ── */
    var uprights = [];
    for (var c = 0; c < cols; c += 9 + Math.floor(rand() * 9)) uprights.push(c);
    uprights.push(cols);

    /* ── Boards: irregular, 4–7 rows apart ── */
    var boards = [];
    for (var r = 2; r < rows; r += 4 + Math.floor(rand() * 4)) boards.push(r);

    var isUpright = {};
    uprights.forEach(function (c) { isUpright[c] = true; });

    /* Boards first, so the corner glyphs written with the uprights sit on
       top of the horizontal run rather than under it. */
    boards.forEach(function (row) {
      for (var c = 0; c < cols; c++) {
        if (isUpright[c]) continue;
        put(c, row, '─', 0.85);
      }
    });

    uprights.forEach(function (col) {
      if (col >= cols) return;
      for (var r = 0; r < rows; r++) {
        var onBoard = boards.indexOf(r) !== -1;
        put(col, r, onBoard ? '┼' : '│', onBoard ? 1 : 0.7);
      }
    });

    /* ── Spines: runs of books leaning inside some cells ── */
    for (var b = 0; b < boards.length; b++) {
      var top = boards[b];
      var bottom = b + 1 < boards.length ? boards[b + 1] : rows;
      var mid = Math.round((top + bottom) / 2);
      if (bottom - top < 3) continue;

      for (var u = 0; u < uprights.length - 1; u++) {
        var from = uprights[u] + 1;
        var to = uprights[u + 1];
        if (to - from < 3) continue;
        /* Not every cell is full — the gaps are what make it a bookcase
           somebody uses rather than a graphic of one. */
        if (rand() < 0.28) continue;

        var run = from + Math.floor(rand() * 2);
        var end = to - Math.floor(rand() * ((to - from) * 0.5));
        for (var x = run; x < end; x++) {
          if (rand() < 0.16) continue;                    // a missing volume
          var glyph = SPINES[Math.floor(rand() * SPINES.length)];
          var tall = rand() < 0.35;                        // a taller book
          var yTop = tall ? top + 1 : mid - 1;
          for (var y = yTop; y < bottom; y++) {
            put(x, y, glyph, 0.55 + rand() * 0.25);
          }
        }
      }
    }
  }

  /* Deliberately not requestAnimationFrame: rAF does not fire in a tab that
     is not compositing, which would leave the field blank on a background
     load until the tab was focused. A one-shot drawing has no reason to wait
     for a frame at all. */
  var pending = null;
  function schedule() {
    clearTimeout(pending);
    pending = setTimeout(draw, 120);
  }

  draw();

  if (window.ResizeObserver) {
    new ResizeObserver(schedule).observe(section);
  } else {
    window.addEventListener('resize', schedule, { passive: true });
  }

  /* The shelf renders after its data loads and the section grows; redraw
     once the library has settled so the field covers the final height. */
  window.addEventListener('load', schedule, { once: true });
})();
