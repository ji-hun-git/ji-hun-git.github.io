/* Runtime harness for ji-hun-git.github.io.
 *
 * Static checks cannot see this site. Almost everything on the page is built
 * at runtime by project-library.js from work-content.js, the bilingual copy is
 * swapped by toggling `display` on 317 span pairs, and the CV and library are
 * two states of one document. So the checks that matter -- contrast, overflow,
 * heading order, focus -- have to run against a live DOM, once per state.
 *
 * Self-contained, no dependencies, no build step. Three ways to run it:
 *
 *   1. DevTools console: paste the whole file, press Enter.
 *   2. Playwright:       python tools/harness/run_browser.py
 *   3. Any MCP/CDP evaluate() hook: send the file as the expression.
 *
 * Returns a plain object, safe to JSON.stringify.
 *
 * A note on the contrast check, because getting it wrong is the default:
 * backgrounds on this page are layered translucent colours
 * (rgba(23,24,27,0.03) over #f6f5f2) and Chrome reports some of them in
 * `color(srgb r g b / a)` notation with 0..1 channels. Parsing that with a
 * naive /\d+/ scan reads `color(srgb 1 1 1 / .94)` as rgb(1,1,1) -- near black --
 * and invents contrast failures that do not exist. This implementation parses
 * both notations and composites the alpha stack down to an opaque colour before
 * measuring. Verified against the page: 0 failures, where the naive version
 * reported 8.
 */
(() => {
  'use strict';

  // ---------- colour ----------
  function parseColor(c) {
    if (!c) return null;
    let m = c.match(/^color\(srgb\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s+([\d.eE+-]+)(?:\s*\/\s*([\d.eE+-]+))?\s*\)$/);
    if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255, m[4] === undefined ? 1 : +m[4]];
    m = c.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      if (p.length < 3 || p.some(Number.isNaN)) return null;
      return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
    }
    if (c === 'transparent') return [0, 0, 0, 0];
    return null;
  }
  const composite = (fg, bg) => {
    const a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
  };
  const luminance = (c) => {
    const [r, g, b] = c.slice(0, 3).map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  // ---------- visibility ----------
  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest('[hidden]')) return false;
    let e = el;
    while (e && e.nodeType === 1) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      e = e.parentElement;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  const ownText = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const label = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : cls ? '.' + cls : '');
  };

  function pageBackground() {
    for (const el of [document.body, document.documentElement]) {
      const c = parseColor(getComputedStyle(el).backgroundColor);
      if (c && c[3] > 0) return c[3] === 1 ? c : composite(c, [255, 255, 255, 1]);
    }
    return [255, 255, 255, 1];
  }

  function effectiveBackground(el, root) {
    const stack = [];
    let e = el;
    while (e && e.nodeType === 1) {
      const c = parseColor(getComputedStyle(e).backgroundColor);
      if (c && c[3] > 0) {
        stack.push(c);
        if (c[3] === 1) break;
      }
      e = e.parentElement;
    }
    let base = root;
    for (let i = stack.length - 1; i >= 0; i--) base = composite(stack[i], base);
    return base;
  }

  // ---------- checks ----------
  const audit = (opts) => {
    opts = opts || {};
    const R = {
      state: opts.state || 'unnamed',
      url: location.href,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      counts: {},
      findings: [],
    };
    const add = (level, check, message, detail) =>
      R.findings.push({ level, check, message, detail: detail || '' });

    // -- duplicate ids ------------------------------------------------------
    const idSeen = new Map();
    document.querySelectorAll('[id]').forEach((el) => {
      idSeen.set(el.id, (idSeen.get(el.id) || 0) + 1);
    });
    idSeen.forEach((n, id) => {
      if (n > 1) add('ERROR', 'duplicate-id', `id "${id}" appears ${n} times`,
        'getElementById and every aria pointer silently resolve to the first one');
    });

    // -- dangling references ------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const h = a.getAttribute('href');
      if (h.length > 1 && !document.getElementById(h.slice(1)))
        add('ERROR', 'dangling-anchor', `href="${h}" has no target`, label(a));
    });
    ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns'].forEach((attr) => {
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        el.getAttribute(attr).split(/\s+/).filter(Boolean).forEach((id) => {
          if (!document.getElementById(id))
            add('ERROR', 'dangling-aria', `${attr}="${id}" points at a missing id`, label(el));
        });
      });
    });

    // -- contrast (WCAG 2.2 AA: 4.5 body, 3.0 large) -------------------------
    const root = pageBackground();
    const seen = new Set();
    let measured = 0;
    document.querySelectorAll('*').forEach((el) => {
      const txt = ownText(el);
      if (txt.length < 2) return;
      if (el.closest('[aria-hidden="true"]')) return;
      if (!isVisible(el)) return;
      const cs = getComputedStyle(el);
      const fg0 = parseColor(cs.color);
      if (!fg0) return;
      const bg = effectiveBackground(el, root);
      const fg = composite(fg0, bg);
      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      const ratio = contrast(fg, bg);
      measured++;
      if (ratio < need) {
        const key = cs.color + '|' + size + '|' + txt.slice(0, 24);
        if (seen.has(key)) return;
        seen.add(key);
        add('ERROR', 'contrast',
          `${ratio.toFixed(2)}:1 (needs ${need}:1) on "${txt.slice(0, 42)}"`,
          `${label(el)}  color:${cs.color}  bg:rgb(${bg.slice(0, 3).map(Math.round).join(',')})  ${size}px/${weight}`);
      }
    });
    R.counts.textNodesMeasured = measured;

    // -- horizontal overflow -------------------------------------------------
    const docW = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > docW + 1) {
      const culprits = [];
      document.querySelectorAll('*').forEach((el) => {
        if (!isVisible(el)) return;
        const r = el.getBoundingClientRect();
        if (r.right > docW + 1 || r.left < -1) {
          if (!culprits.some((c) => c.el.contains(el))) culprits.push({ el, r });
        }
      });
      add('ERROR', 'overflow-x',
        `page scrolls horizontally: ${document.documentElement.scrollWidth}px content in ${docW}px viewport`,
        culprits.slice(0, 6).map((c) => `${label(c.el)} @ ${Math.round(c.r.left)}..${Math.round(c.r.right)}`).join(' | '));
    }

    // -- headings ------------------------------------------------------------
    const visHeads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(isVisible);
    const h1s = visHeads.filter((h) => h.tagName === 'H1');
    R.counts.visibleH1 = h1s.length;
    if (h1s.length === 0) add('ERROR', 'heading', 'no visible <h1> on this page', '');
    if (h1s.length > 1)
      add('WARN', 'heading', `${h1s.length} visible <h1> elements`,
        h1s.map((h) => '"' + h.textContent.trim().slice(0, 30) + '"').join(' | '));
    let prev = 0;
    visHeads.forEach((h) => {
      const lvl = +h.tagName[1];
      if (prev && lvl > prev + 1)
        add('WARN', 'heading', `h${lvl} follows h${prev}, skipping a level`,
          '"' + h.textContent.trim().slice(0, 40) + '"');
      prev = lvl;
    });

    // -- landmarks -----------------------------------------------------------
    const mains = [...document.querySelectorAll('main,[role="main"]')].filter(isVisible);
    R.counts.visibleMain = mains.length;
    if (mains.length === 0)
      add('WARN', 'landmark', 'no visible <main> landmark',
        'screen-reader users lose the "skip to content" jump');
    if (mains.length > 1)
      add('ERROR', 'landmark', `${mains.length} visible <main> landmarks`, 'only one is allowed');

    // -- images --------------------------------------------------------------
    const imgs = [...document.querySelectorAll('img')];
    R.counts.images = imgs.length;
    imgs.forEach((img) => {
      if (!img.hasAttribute('alt'))
        add('ERROR', 'img-alt', `<img> without alt: ${img.getAttribute('src')}`, label(img));
      const src = img.getAttribute('src') || '';
      // An SVG's naturalWidth is just its viewBox: it rasterises at whatever
      // size it is drawn and costs the same bytes either way, so "too big for
      // its slot" is meaningless for one. Only raster formats waste bandwidth.
      const isVector = /\.svg(\?|$)/i.test(src) || /^data:image\/svg/i.test(src);
      if (isVisible(img) && !isVector) {
        const r = img.getBoundingClientRect();
        // Budget for a 2x display even when this run is at 1x, then allow 2x
        // headroom again before complaining. A 64px mark in a 20px slot is
        // correctly sized for retina, not waste; flagging it buried the two
        // assets that really are oversized under twenty that are not.
        const needed = r.width * Math.max(2, window.devicePixelRatio || 1);
        if (img.naturalWidth && r.width && img.naturalWidth > needed * 2)
          add('WARN', 'img-oversized',
            `${img.getAttribute('src')} is ${img.naturalWidth}px wide for a ${Math.round(r.width)}px slot`,
            `~${Math.round(needed)}px would cover a 2x display; the rest is downloaded and discarded`);
      }
      if (!img.hasAttribute('width') || !img.hasAttribute('height'))
        add('INFO', 'img-dimensions', `no width/height on ${img.getAttribute('src')}`,
          'the row reflows when it loads (cumulative layout shift)');
    });

    // -- accessible names ----------------------------------------------------
    const named = (el) =>
      (el.textContent || '').trim() ||
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      (el.getAttribute('aria-labelledby') &&
        [...document.querySelectorAll('#' + CSS.escape(el.getAttribute('aria-labelledby').split(' ')[0]))]
          .map((n) => n.textContent.trim()).join(' ')) ||
      (el.querySelector('img[alt]') && el.querySelector('img[alt]').getAttribute('alt'));
    [...document.querySelectorAll('a[href],button')].filter(isVisible).forEach((el) => {
      if (!named(el))
        add('ERROR', 'accessible-name', `<${el.tagName.toLowerCase()}> has no accessible name`, label(el));
    });
    [...document.querySelectorAll('input,select,textarea')].filter(isVisible).forEach((el) => {
      const hasLabel = el.labels && el.labels.length ||
        el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title');
      if (!hasLabel && el.type !== 'hidden')
        add('ERROR', 'accessible-name', `<${el.tagName.toLowerCase()} type=${el.type}> has no label`, label(el));
    });

    // -- link hygiene --------------------------------------------------------
    [...document.querySelectorAll('a[target="_blank"]')].forEach((a) => {
      if (!/noopener/.test(a.getAttribute('rel') || ''))
        add('WARN', 'link-rel', `target=_blank without rel=noopener: ${a.href}`, label(a));
    });
    [...document.querySelectorAll('a[href]')].filter(isVisible).forEach((a) => {
      const t = a.textContent.trim().toLowerCase();
      if (['here', 'click here', 'link', 'more', 'read more', '이곳', '여기'].includes(t))
        add('WARN', 'link-text', `non-descriptive link text "${a.textContent.trim()}"`,
          'a screen reader listing all links reads this out of context');
    });

    // -- target size (WCAG 2.2 AA 2.5.8: 24x24 CSS px) -----------------------
    [...document.querySelectorAll('a[href],button,[role="button"],input,select')]
      .filter(isVisible)
      .forEach((el) => {
        // inline links inside a paragraph are explicitly exempt
        const p = el.parentElement;
        if (el.tagName === 'A' && p && /^(P|LI|SPAN|EM|STRONG|TD)$/.test(p.tagName) &&
            getComputedStyle(el).display.startsWith('inline')) return;
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 24)
          add('WARN', 'target-size',
            `${Math.round(r.width)}x${Math.round(r.height)}px tap target (min 24x24)`,
            label(el) + ' "' + el.textContent.trim().slice(0, 24) + '"');
      });

    // -- tiny text -----------------------------------------------------------
    const tiny = new Map();
    document.querySelectorAll('*').forEach((el) => {
      if (ownText(el).length < 3 || !isVisible(el)) return;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size && size < 12) {
        const k = label(el) + '@' + size;
        if (!tiny.has(k)) tiny.set(k, { size, sample: ownText(el).slice(0, 30), sel: label(el) });
      }
    });
    tiny.forEach((v) => add('WARN', 'tiny-text', `${v.size}px text: "${v.sample}"`, v.sel));

    // -- bilingual pairing ---------------------------------------------------
    // Every [lang=en] span should have a [lang=ko] sibling and vice versa, or a
    // language toggle leaves a hole. <html lang> is not a pair member.
    const pairParents = new Map();
    document.querySelectorAll('[lang="en"],[lang="ko"]').forEach((el) => {
      if (el === document.documentElement) return;
      const p = el.parentElement;
      if (!p) return;
      if (!pairParents.has(p)) pairParents.set(p, { en: 0, ko: 0 });
      pairParents.get(p)[el.getAttribute('lang')]++;
    });
    let unbalanced = 0;
    pairParents.forEach((v, p) => {
      if (v.en !== v.ko) {
        unbalanced++;
        add('ERROR', 'lang-pair',
          `${v.en} English vs ${v.ko} Korean children under ${label(p)}`,
          'one language shows a gap here: ' + (p.textContent || '').trim().slice(0, 50));
      }
    });
    R.counts.langPairParents = pairParents.size;
    R.counts.langPairUnbalanced = unbalanced;

    // -- reduced motion ------------------------------------------------------
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let moving = 0;
      document.querySelectorAll('*').forEach((el) => {
        if (!isVisible(el)) return;
        const cs = getComputedStyle(el);
        const dur = parseFloat(cs.animationDuration) || 0;
        const iter = cs.animationIterationCount;
        if (dur > 0 && (iter === 'infinite' || parseFloat(iter) > 1)) moving++;
      });
      if (moving)
        add('WARN', 'reduced-motion',
          `${moving} element(s) still run a looping animation under prefers-reduced-motion: reduce`,
          'vestibular-sensitive visitors asked the OS to stop this');
      R.counts.animatedUnderReducedMotion = moving;
    }

    // -- focus visibility ----------------------------------------------------
    // `*:focus { outline: none }` paired with `*:focus-visible { outline: ... }`
    // is the correct modern pattern, not a defect -- it hides the ring for mouse
    // users and keeps it for keyboard users. So collect the :focus-visible base
    // selectors first, and only complain about an outline kill that nothing
    // restores.
    const focusVisibleBases = [];
    const killed = [];
    const focusRings = [];
    let focusVisible = 0;
    // Chrome gives EVERY CSSStyleRule a (usually empty) .cssRules list so that
    // CSS nesting works. Recursing on truthy .cssRules therefore skips all 1512
    // style rules on this page and silently finds nothing. Dispatch on
    // selectorText instead, and recurse only into non-empty children.
    const walk = (rules) => {
      for (const rule of rules) {
        const sel = rule.selectorText;
        if (sel === undefined) {
          if (rule.cssRules) walk(rule.cssRules);
          continue;
        }
        if (rule.cssRules && rule.cssRules.length) walk(rule.cssRules);
        const t = rule.cssText || '';
        if (sel.includes(':focus-visible')) {
          if (rule.style) {
            const decl = rule.style.getPropertyValue('outline') ||
              rule.style.getPropertyValue('outline-color');
            if (decl) focusRings.push({ sel, decl });
          }
          focusVisible++;
          sel.split(',').forEach((s) => {
            // `*:focus-visible` serialises to `:focus-visible`, so an empty base
            // means the universal selector, not "no selector".
            focusVisibleBases.push(s.split(':focus-visible')[0].trim() || '*');
          });
        } else if (/:focus\b/.test(sel) && /outline\s*:\s*(?:none|0)\b/.test(t)) {
          sel.split(',').forEach((s) => {
            if (!/:focus\b/.test(s)) return;
            killed.push({ base: s.split(':focus')[0].trim() || '*', text: t.slice(0, 110) });
          });
        }
      }
    };
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { continue; }
      if (rules) walk(rules);
    }
    R.counts.focusVisibleRules = focusVisible;
    const restored = (base) =>
      focusVisibleBases.some((b) => b === base || b === '*' || b.startsWith(base + ' ') || base.startsWith(b));
    const unrestored = killed.filter((k) => !restored(k.base));
    unrestored.slice(0, 5).forEach((k) =>
      add('ERROR', 'focus-visible',
        `outline removed for "${k.base}:focus" and no :focus-visible rule restores it`,
        k.text));
    R.counts.focusOutlineUnrestored = unrestored.length;

    // -- focus ring contrast (WCAG 2.2 1.4.11, 3:1 against what it sits on) ---
    // A focus ring the keyboard user cannot see is the same as no focus ring.
    const ringSeen = new Set();
    focusRings.forEach(({ sel, decl }) => {
      const cm = decl.match(/(rgba?\([^)]*\)|color\(srgb[^)]*\)|#[0-9a-f]{3,8})/i);
      if (!cm) return;
      let col = parseColor(cm[1]);
      if (!col && cm[1].startsWith('#')) {
        const hex = cm[1].slice(1);
        const n = hex.length === 3
          ? hex.split('').map((c) => parseInt(c + c, 16))
          : [0, 2, 4].map((i) => parseInt(hex.substr(i, 2), 16));
        col = [n[0], n[1], n[2], hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1];
      }
      if (!col) return;
      const ratio = contrast(composite(col, root), root);
      const key = cm[1];
      if (ringSeen.has(key)) return;
      ringSeen.add(key);
      if (ratio < 3)
        add('ERROR', 'focus-ring-contrast',
          `focus ring ${cm[1]} is ${ratio.toFixed(2)}:1 against the page ground (needs 3:1)`,
          `${sel.slice(0, 70)} -- a keyboard user cannot see where they are`);
    });
    R.counts.focusRingsChecked = ringSeen.size;

    // -- third-party origins -------------------------------------------------
    const origins = [...new Set(performance.getEntriesByType('resource').map((r) => {
      try { return new URL(r.name).origin; } catch (e) { return null; }
    }).filter((o) => o && o !== location.origin))];
    R.counts.thirdPartyOrigins = origins.length;
    R.thirdPartyOrigins = origins;
    origins.forEach((o) =>
      add('INFO', 'third-party', `page loads assets from ${o}`,
        'this origin sees every visitor IP on every page load'));

    // -- summary -------------------------------------------------------------
    R.counts.errors = R.findings.filter((f) => f.level === 'ERROR').length;
    R.counts.warnings = R.findings.filter((f) => f.level === 'WARN').length;
    R.counts.info = R.findings.filter((f) => f.level === 'INFO').length;
    return R;
  };

  // ---------- settle ----------
  // Most of this page starts at opacity:0 and fades in on scroll, so auditing a
  // freshly loaded document measures ~25 of its ~1030 text elements and calls
  // the rest invisible. Walking the scroll position lets the IntersectionObserver
  // callbacks fire, which is exactly what a real visitor's scroll does. Nothing
  // is forced or faked -- anything still transparent afterwards genuinely is.
  // Fast-forward every finite animation to its end state.
  //
  // This is what makes the harness deterministic. Two things otherwise break it:
  //   - `html { scroll-behavior: smooth }` means scrollTo() animates, so a timed
  //     scroll loop never actually reaches the bottom.
  //   - A tab that is not compositing frames (headless, backgrounded, or a
  //     hidden preview pane) never advances CSS animations at all. The CV's
  //     `page-in` keyframe sits at currentTime 0 with fill:both, which computes
  //     to opacity 0 -- so a naive audit concludes the entire CV is invisible
  //     and measures 4 of its ~1000 text elements. That is an artefact of the
  //     runner, not a defect in the page, and reporting it would be a lie.
  // finish() lands each animation on its last keyframe regardless of whether a
  // frame was ever painted. Infinite animations are left alone: they have no end.
  const finishAnimations = () => {
    if (!document.getAnimations) return 0;
    let n = 0;
    for (const a of document.getAnimations()) {
      try {
        const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
        if (t && t.iterations === Infinity) continue;
        a.finish();
        n++;
      } catch (e) { /* not finishable (infinite or already idle) */ }
    }
    return n;
  };

  // Put the scroll-reveal blocks into their end state.
  //
  // index.html:2308 observes `.reveal` with an IntersectionObserver and adds
  // `.visible`; when prefers-reduced-motion is set it skips the observer and
  // adds `.visible` to all of them at once (index.html:2321). This calls that
  // same fallback. It is the page's own code path for "show everything now",
  // not an override invented by the harness -- which matters, because without
  // it only 33 of the CV's 317 English spans are measurable and a clean
  // contrast report would be covering 10% of the page.
  const forceReveal = () => {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    els.forEach((el) => el.classList.add('visible'));
    return els.length;
  };

  const settle = async (opts) => {
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const dwell = opts.settleStep || 90;
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto'; // defeat scroll-behavior: smooth
    const step = Math.max(200, Math.round(window.innerHeight * 0.75));
    const height = () => root.scrollHeight;
    let y = 0, guard = 0;
    let finished = 0;
    while (y < height() && guard++ < 300) {
      window.scrollTo(0, y);
      await pause(dwell);
      finished += finishAnimations();
      y += step;
    }
    window.scrollTo(0, height());
    await pause(dwell);
    finished += finishAnimations();
    window.scrollTo(0, 0);
    await pause(opts.settleFinal || 250);
    // reveals triggered on the way back up
    finished += finishAnimations();
    if (opts.forceReveal !== false) {
      const forced = forceReveal();
      if (forced) {
        await pause(80);
        finished += finishAnimations();
      }
    }
    root.style.scrollBehavior = prevBehavior;
    return finished;
  };

  const auditSettled = async (opts) => {
    opts = opts || {};
    const finished = await settle(opts);
    const report = audit(opts);
    report.counts.animationsFinished = finished;
    const stillHidden = [...document.querySelectorAll('*')]
      .filter((el) => +getComputedStyle(el).opacity === 0 && ownText(el).length > 2).length;
    report.counts.stillTransparentAfterSettle = stillHidden;
    report.settled = true;
    return report;
  };

  if (typeof window !== 'undefined') {
    window.__domAudit = audit;
    window.__domAuditSettled = auditSettled;
  }
  const o = (typeof window !== 'undefined' && window.__domAuditOpts) || {};
  return o.settle === false ? audit(o) : auditSettled(o);
})()
