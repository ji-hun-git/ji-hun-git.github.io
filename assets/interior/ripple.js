/* ============================================================================
   Ripple - touch feedback from the pointer origin
   assets/interior/ripple.js

   A vanilla port of the interior.dev Ripple component. The published component
   is React + Tailwind + motion, installed with `bunx shadcn add`; this site is
   static HTML/CSS/JS with no build step, so the behaviour is reimplemented
   rather than installed.

   Ported faithfully:
     max         4     ceiling on simultaneous blooms
     minVisible  220   ms a bloom is held before it may fade
     fade        320   ms fade-out
     released    bool  a bloom that has been let go and is fading
     origin            the bloom starts where the pointer went down

   Deliberate additions:
     - honours prefers-reduced-motion (the original does not)
     - keyboard activation blooms from the element's centre, so Enter/Space
       gets the same feedback as a tap
     - event delegation, so spines rendered later are covered automatically

   Usage:
     Ripple.attach('.pl-volume__trigger', { max: 2 });
   ========================================================================== */

(() => {
  "use strict";

  const DEFAULTS = {
    max: 4,
    minVisible: 220,
    fade: 320,
    bloom: 450,
    disabled: false,
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let seq = 0;
  const registry = [];

  const layerFor = (host) => {
    let layer = host.querySelector(":scope > .ripple-layer");
    if (!layer) {
      layer = document.createElement("span");
      layer.className = "ripple-layer";
      // Decorative: the bloom carries no information a screen reader needs.
      layer.setAttribute("aria-hidden", "true");
      host.appendChild(layer);
      host.classList.add("ripple-host");
    }
    return layer;
  };

  // Scale needed for a 40px bloom to cover the host from the press point:
  // the furthest corner sets the radius.
  const scaleToCover = (rect, x, y) => {
    const dx = Math.max(x, rect.width - x);
    const dy = Math.max(y, rect.height - y);
    return (2 * Math.hypot(dx, dy)) / 40;
  };

  const spawn = (host, opts, x, y) => {
    if (opts.disabled || reduceMotion.matches) return;
    if (host.hasAttribute("disabled") || host.getAttribute("aria-disabled") === "true") return;

    const layer = layerFor(host);
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Retire the oldest blooms past the cap rather than refusing new ones, so a
    // fast tapper always gets feedback at the point they actually pressed.
    const live = layer.querySelectorAll(".ripple");
    for (let i = 0; i <= live.length - opts.max; i += 1) live[i].remove();

    const node = document.createElement("span");
    node.className = "ripple";
    node.dataset.rippleId = String((seq += 1));
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.setProperty("--ripple-scale", scaleToCover(rect, x, y).toFixed(3));
    node.style.setProperty("--ripple-bloom", `${opts.bloom}ms`);
    node.style.setProperty("--ripple-fade", `${opts.fade}ms`);
    layer.appendChild(node);

    // Commit the scale(0) start state, then bloom. A forced reflow is used
    // rather than requestAnimationFrame because rAF is paused in a backgrounded
    // or non-compositing tab, which would strand the bloom at scale(0).
    void node.offsetWidth;
    node.classList.add("is-blooming");

    const born = performance.now();
    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      const held = performance.now() - born;
      const wait = Math.max(0, opts.minVisible - held);
      window.setTimeout(() => {
        node.classList.add("is-released");
        window.setTimeout(() => node.remove(), opts.fade + 60);
      }, wait);
    };

    return release;
  };

  const bind = (host, opts) => {
    if (host.dataset.rippleBound === "1") return;
    host.dataset.rippleBound = "1";

    // A set, not a single handle: a fast tapper can put several blooms in
    // flight before the first pointerup, and tracking only the newest would
    // strand the earlier ones un-faded until the cap evicted them.
    const pending = new Set();

    host.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        const rect = host.getBoundingClientRect();
        const release = spawn(host, opts, event.clientX - rect.left, event.clientY - rect.top);
        if (release) pending.add(release);
      },
      { passive: true }
    );

    const letGo = () => {
      for (const release of pending) release();
      pending.clear();
    };
    host.addEventListener("pointerup", letGo, { passive: true });
    host.addEventListener("pointercancel", letGo, { passive: true });
    host.addEventListener("pointerleave", letGo, { passive: true });
    host.addEventListener("blur", letGo, { passive: true });

    // Keyboard activation blooms from the centre and releases on its own.
    host.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (event.repeat) return;
        const rect = host.getBoundingClientRect();
        const r = spawn(host, opts, rect.width / 2, rect.height / 2);
        if (r) r();
      },
      { passive: true }
    );
  };

  const sweep = () => {
    for (const entry of registry) {
      document.querySelectorAll(entry.selector).forEach((el) => bind(el, entry.opts));
    }
  };

  const Ripple = {
    attach(selector, options = {}) {
      const opts = { ...DEFAULTS, ...options };
      registry.push({ selector, opts });
      sweep();
      return Ripple;
    },
    // Re-scan after new nodes are rendered. Binding is idempotent.
    refresh: sweep,
  };

  window.Ripple = Ripple;

  // Late-rendered spines and buttons get bound without every caller having to
  // remember to refresh.
  if (window.MutationObserver) {
    const mo = new MutationObserver((records) => {
      if (!registry.length) return;
      for (const rec of records) {
        if (rec.addedNodes.length) {
          sweep();
          return;
        }
      }
    });
    const start = () => mo.observe(document.body, { childList: true, subtree: true });
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start, { once: true });
  }
})();
