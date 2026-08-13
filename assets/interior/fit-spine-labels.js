/* ============================================================================
   Fit the shelf's category labels to the spine
   assets/interior/fit-spine-labels.js

   The spine mark is capped at roughly the volume height minus its end caps, and
   16 of the 37 labels are longer than that at the authored size, so they were
   ellipsised mid-word ("BEHAVIOR CHA…"). Widening the cap is not available: a
   sweep of every reserve from 36px down to 20px showed collisions with the
   spine's other elements appear before the truncation clears.

   So shrink only the labels that actually overflow, one step at a time, down to
   a floor. Labels that already fit are never touched, and nothing here changes
   the label text - the taxonomy stays the author's.

   Anything still over the floor is left ellipsised rather than rendered
   illegibly small, and reported on `window.__spineLabelOverflow` so it can be
   shortened deliberately in project-library.js.
   ========================================================================== */

(() => {
  "use strict";

  const AUTHORED_PX = 10.25;
  const FLOOR_PX = 9;
  const STEP = 0.25;

  const fit = () => {
    const marks = document.querySelectorAll(".pl-volume__spine-mark");
    if (!marks.length) return;
    const stubborn = [];

    marks.forEach((mark) => {
      if (!mark.offsetParent) return;

      // Always re-measure from the authored size so a resize can give size back.
      mark.style.removeProperty("font-size");
      mark.style.removeProperty("letter-spacing");
      if (mark.scrollWidth <= mark.clientWidth + 1) return;

      // The version layers set `font-size: 10px !important` on this element, so
      // a plain inline style is ignored - these have to be important too.
      mark.style.setProperty("letter-spacing", "0", "important");

      let px = AUTHORED_PX;
      while (mark.scrollWidth > mark.clientWidth + 1 && px > FLOOR_PX) {
        px = Math.max(FLOOR_PX, px - STEP);
        mark.style.setProperty("font-size", px + "px", "important");
      }

      if (mark.scrollWidth > mark.clientWidth + 1) {
        stubborn.push({
          text: (mark.textContent || "").trim(),
          needs: mark.scrollWidth,
          has: mark.clientWidth,
        });
      }
    });

    window.__spineLabelOverflow = stubborn;
  };

  const schedule = (() => {
    let queued = false;
    return () => {
      if (queued) return;
      queued = true;
      setTimeout(() => { queued = false; fit(); }, 60);
    };
  })();

  const start = () => {
    fit();
    const shelf = document.getElementById("plShelf");
    if (shelf && window.MutationObserver) {
      new MutationObserver(schedule).observe(shelf, { childList: true, subtree: true });
    }
    window.addEventListener("resize", schedule, { passive: true });
    // The shelf is rendered by project-library.js after its own data pass.
    window.addEventListener("load", schedule, { once: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
