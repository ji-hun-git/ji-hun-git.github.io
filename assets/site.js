(() => {
  "use strict";
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const script = document.currentScript;
  // index.html picks the view before first paint (see BOOKSHELF_ENABLED).
  const cvView = root.dataset.view === "cv";
  const bookshelfOn = root.dataset.bookshelf === "on";
  if (cvView && bookshelfOn) {
    // With the bookshelf at the page URL, the CV lives at ?view=cv. While the
    // bookshelf is off, each page keeps the static canonical URL in its head.
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(canonical.href);
      url.searchParams.set("view", "cv");
      canonical.href = url.href;
    }
  }
  // One page per language: index.html (English, at /) and ko.html (Korean,
  // generated from index.html by tools/build_ko_page.py). The raw <html lang>
  // says which page this is. The language control is a link to the other
  // page. index.html carries both languages, so there the link switches in
  // place and then rewrites the address, so a reload or a shared link opens
  // the same language. ko.html is Korean only: its link loads the English
  // page, keeping ?query and #section.
  const pageLang = root.lang === "ko" ? "ko" : "en";
  const bilingual = pageLang === "en";
  // Tab titles come from the pages' own <title>s: this page's is the document
  // title; the other page's is in the head-strings block (#ko-head in
  // index.html, #en-head in ko.html).
  const titles = { [pageLang]: document.title };
  try {
    const other = pageLang === "ko" ? "en" : "ko";
    const strings = JSON.parse(
      document.getElementById(other + "-head")?.textContent || "{}",
    );
    if (strings.title) titles[other] = strings.title;
  } catch {}
  const addressFor = (ko) => {
    const url = new URL(location.href);
    const file = url.pathname.slice(url.pathname.lastIndexOf("/") + 1);
    // GitHub Pages also serves these pages as /index and /ko (no .html).
    const known = ["", "index", "index.html", "ko", "ko.html"].includes(file);
    if (known)
      url.pathname =
        url.pathname.slice(0, url.pathname.length - file.length) +
        (ko
          ? "ko.html"
          : file === "index.html" || url.protocol === "file:"
            ? "index.html"
            : "");
    // While the bookshelf is off, ?view=library means nothing: do not carry it.
    if (!bookshelfOn && url.searchParams.get("view") === "library")
      url.searchParams.delete("view");
    // library.js (the bookshelf) still reads ?lang=ko when it restores history.
    if (ko && (bookshelfOn || !known)) url.searchParams.set("lang", "ko");
    else if (url.searchParams.has("lang")) url.searchParams.delete("lang");
    return url;
  };
  const writeAddress = (ko) => {
    const url = addressFor(ko);
    if (url.href === location.href) return;
    try {
      history.replaceState(history.state, "", url);
    } catch {
      // A file:// page cannot change its path: keep the language in the query.
      try {
        const same = new URL(location.href);
        if (ko !== (pageLang === "ko"))
          same.searchParams.set("lang", ko ? "ko" : "en");
        else same.searchParams.delete("lang");
        history.replaceState(history.state, "", same);
      } catch {}
    }
  };
  const language = document.getElementById("langToggle");
  const reader = document.getElementById("ttsToggle");
  // Screen-reader text for links that open a new tab (see markNewTabLinks).
  const newTab = { en: " (new tab)", ko: " (새 탭)" };
  // The link always points at the other language, with this page's query and
  // #section, so opening it in a new tab lands in the same place.
  const pointLink = () => {
    const ko = root.lang === "ko";
    language.href = addressFor(!ko).href;
    language.hreflang = ko ? "en" : "ko";
  };
  const setLanguage = (ko) => {
    document.body.classList.toggle("ko", ko);
    root.lang = ko ? "ko" : "en";
    document.getElementById("langLabel").textContent = ko
      ? "English"
      : "한국어";
    // The link names the other language, so it is spoken in that language.
    // Region subtags on purpose: site.css hides [lang="en"] or [lang="ko"].
    language.lang = ko ? "en-US" : "ko-KR";
    language.setAttribute(
      "aria-label",
      ko ? "Read in English" : "한국어로 읽기",
    );
    const title = titles[ko ? "ko" : "en"];
    if (title) document.title = title;
    [
      [".sidebar", "Profile", "프로필"],
      [".site-brand", "Jihun Chae home", "채지훈 홈"],
      [".site-navigation", "Main navigation", "주 메뉴"],
      [".mobile-nav", "Sections", "이력서 항목"],
      ["#pubFilter", "Filter publications by year", "연도별 논문 필터"],
      ["#ttsToggle", "Reader mode", "읽기 모드"],
    ].forEach(([selector, en, korean]) => {
      document
        .querySelector(selector)
        ?.setAttribute("aria-label", ko ? korean : en);
    });
    reader?.setAttribute("title", ko ? "읽기 모드" : "Reader mode");
    // Home is this language's page (ko.html is written that way already).
    if (!bookshelfOn)
      document
        .querySelector(".site-brand")
        ?.setAttribute("href", ko ? "ko.html" : "./");
    // The Simulations page is in English; ?from=ko sends its CV links back to
    // the Korean page (tools/build_ko_page.py writes the same into ko.html).
    document
      .querySelector(".lab-link")
      ?.setAttribute("href", ko ? "laboratory.html?from=ko" : "laboratory.html");
    document.querySelectorAll(".new-tab").forEach((cue) => {
      cue.textContent = newTab[ko ? "ko" : "en"];
    });
    writeAddress(ko);
    pointLink();
  };
  // Old links carry ?lang=; the head script already sent them to the page in
  // that language, except on file:// (a page cannot change its path there).
  const asked = params.get("lang");
  const wanted = asked === "ko" || asked === "en" ? asked : pageLang;
  if (!bilingual && wanted !== pageLang) location.replace(addressFor(false));
  else setLanguage(wanted === "ko");
  addEventListener("hashchange", pointLink);
  language.addEventListener("click", (event) => {
    // A new tab or window (modifier keys, middle click) follows the href.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (!bilingual) {
      pointLink(); // the current #section, then a normal page load
      return;
    }
    event.preventDefault();
    setLanguage(root.lang !== "ko");
  });
  const setReader = (on) => {
    document.body.classList.toggle("reader", on);
    reader.setAttribute("aria-pressed", String(on));
    try {
      localStorage.setItem("reader-mode", on ? "1" : "0");
    } catch {}
  };
  try {
    setReader(localStorage.getItem("reader-mode") === "1");
  } catch {}
  reader.addEventListener("click", () =>
    setReader(!document.body.classList.contains("reader")),
  );
  // The CV opens on its overview: each numbered section folds to its heading,
  // whose button shows or hides the section's body. index.html ships them
  // open, so the page is whole without scripts. hidden="until-found" lets the
  // browser's find in page and #fragment links open a section themselves
  // (beforematch); a browser that does not know the value hides it outright,
  // and the link handling below opens the section instead.
  const folds = [
    ...document.querySelectorAll(".section-toggle[aria-controls]"),
  ]
    .map((button) => ({
      button,
      body: document.getElementById(button.getAttribute("aria-controls")),
      section: button.closest("section"),
    }))
    .filter((fold) => fold.body && fold.section);
  const isOpen = (fold) =>
    fold.button.getAttribute("aria-expanded") === "true";
  const setOpen = (fold, open) => {
    fold.button.setAttribute("aria-expanded", String(open));
    if (open) fold.body.removeAttribute("hidden");
    else fold.body.setAttribute("hidden", "until-found");
  };
  const elementFor = (hash) => {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null; // a malformed #% fragment names nothing
    }
  };
  // Opens the section that holds `target` (an entry, a heading or the section
  // itself). True when it was folded, so the caller knows the layout moved.
  const openFor = (target) => {
    const fold = target && folds.find((f) => f.section.contains(target));
    if (!fold || isOpen(fold)) return false;
    setOpen(fold, true);
    return true;
  };
  // The section nav marks the current section; a fold moves the sections
  // without scrolling, so it asks for a fresh look (set further down).
  let refreshNav = () => {};
  {
    // A link such as ?view=cv#publications or #cv-work-<slug> (?work=<slug>
    // arrives as one) opens its section before the page lands on it below.
    const target = elementFor(location.hash);
    folds.forEach((fold) =>
      setOpen(fold, Boolean(target && fold.section.contains(target))),
    );
  }
  // The headings work as disclosures from here on: cv.css draws their
  // chevrons, pointer and hover for html.cv-folds (and while the <head>
  // script has them folded), not on a page whose site.js never ran.
  if (folds.length) root.classList.add("cv-folds");
  root.classList.remove("cv-folding", "cv-landing"); // see the <head> script
  folds.forEach((fold) => {
    fold.button.addEventListener("click", () => {
      setOpen(fold, !isOpen(fold));
      refreshNav();
    });
    // Find in page or a fragment reached a folded entry: the browser removes
    // hidden itself; the button follows.
    fold.body.addEventListener("beforematch", () => {
      fold.button.setAttribute("aria-expanded", "true");
      refreshNav();
    });
  });
  // An in-page link (the section nav, a #cv-work-<slug> link) opens the
  // section it points into before the browser follows it, so it lands as it
  // always has. A section already open just scrolls.
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link =
      event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (
      !link?.hash ||
      link.origin !== location.origin ||
      link.pathname !== location.pathname ||
      link.search !== location.search
    )
      return;
    if (openFor(elementFor(link.hash))) refreshNav();
  });
  // Any other change of #fragment (typed, history): where the browser did not
  // open the section itself (a section heading's own id, or no until-found),
  // open it and land again.
  addEventListener("hashchange", () => {
    const target = elementFor(location.hash);
    if (!openFor(target)) return;
    target.scrollIntoView({ behavior: "instant" });
    refreshNav();
  });
  document
    .getElementById("printCV")
    ?.addEventListener("click", () => window.print());
  // On paper the CV is whole: the toolkit and every section open for printing
  // (the button or Ctrl+P) and return to how the reader left them afterwards.
  // cv.css also prints folded sections, for a print that sends no events.
  const toolkit = document.querySelector("details.caps");
  let beforePrint = null;
  window.addEventListener("beforeprint", () => {
    if (beforePrint) return;
    beforePrint = { toolkit: toolkit?.open, folds: folds.map(isOpen) };
    if (toolkit) toolkit.open = true;
    folds.forEach((fold) => setOpen(fold, true));
  });
  window.addEventListener("afterprint", () => {
    if (!beforePrint) return;
    if (toolkit) toolkit.open = beforePrint.toolkit;
    folds.forEach((fold, i) => setOpen(fold, beforePrint.folds[i]));
    beforePrint = null;
    refreshNav();
  });
  // A link that opens a new tab says so to screen readers, and its "↗" (a
  // visual cue) is not read as part of its name. Only while the bookshelf is
  // off: library.js reads these links' text for its own labels.
  function markNewTabLinks(scope) {
    scope?.querySelectorAll('a[target="_blank"]').forEach((link) => {
      if (link.querySelector(".new-tab")) return;
      const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
      const arrows = [];
      while (walker.nextNode())
        if (/↗\s*$/.test(walker.currentNode.nodeValue))
          arrows.push(walker.currentNode);
      arrows.forEach((node) => {
        const at = node.nodeValue.lastIndexOf("↗");
        const glyph = document.createElement("span");
        glyph.setAttribute("aria-hidden", "true");
        glyph.textContent = "↗";
        node.after(glyph, node.nodeValue.slice(at + 1));
        node.nodeValue = node.nodeValue.slice(0, at);
      });
      const cue = document.createElement("span");
      cue.className = "pl-sr-only new-tab";
      cue.textContent = newTab[root.lang === "ko" ? "ko" : "en"];
      link.append(cue);
    });
  }
  // The authored citations remain the library's source of truth. On the CV,
  // present the same nodes in a title-first reading order after extraction.
  document.addEventListener("DOMContentLoaded", () => {
    if (!cvView) return;
    document.querySelectorAll(".item-meta > span[lang]").forEach((meta) => {
      const parts = meta.textContent.split("|").map((part) => part.trim());
      if (parts.length < 2) return;
      meta.classList.add("cv-meta-row");
      meta.replaceChildren(
        ...parts.map((part, index) => {
          const span = document.createElement("span");
          // Only a leading date is styled as one ("Certification | Microsoft"
          // is two plain parts).
          span.className =
            index === 0 && /^\d{4}/.test(part) ? "cv-date" : "cv-meta-part";
          span.textContent = part;
          return span;
        }),
      );
    });
    document.querySelectorAll("#pubItems .item-desc").forEach((citation) => {
      const title = citation.querySelector(".paper-title");
      if (!title) return;
      const titleNode = title.closest("a") || title;
      const number = citation.querySelector(".pub-n");
      number?.remove();
      const authors = document.createElement("p");
      authors.className = "cv-authors";
      const range = document.createRange();
      range.setStart(citation, 0);
      range.setEndBefore(titleNode);
      authors.append(range.extractContents());
      // h4: each paper sits under its year's h3.
      const heading = document.createElement("h4");
      heading.className = "cv-paper-heading";
      heading.append(titleNode);
      const links = document.createElement("div");
      links.className = "cv-publication-links";
      citation
        .querySelectorAll(".pub-role, .pub-tag, .pub-link")
        .forEach((el) => links.append(el));
      const detail = document.createElement("p");
      detail.className = "cv-citation-detail";
      detail.append(...citation.childNodes);
      const surface = document.createElement("div");
      surface.className = "item-desc cv-citation";
      // Citations are English on both pages (lang="en-US" in the markup), so
      // a Korean screen reader voice does not read them.
      if (citation.lang) surface.lang = citation.lang;
      if (number) surface.append(number);
      surface.append(heading, authors, detail, links);
      citation.replaceWith(surface);
    });
    if (!bookshelfOn) markNewTabLinks(document.getElementById("cv-start"));
    // Land links such as ?view=cv#publications or #cv-work-<slug> on their
    // entry once the reflow above has settled the layout. An instant jump, as
    // the browser does for a fragment: a long smooth scroll can end in the
    // wrong place when lazy images above the entry load on the way.
    let target = null;
    try {
      target = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
    } catch {}
    if (target) {
      let landed = null;
      const land = () => {
        target.scrollIntoView({ behavior: "instant" });
        landed = scrollY;
      };
      requestAnimationFrame(land);
      // This jump replaces the browser's own fragment anchor, which would have
      // kept the entry in place while the web fonts arrive and rewrap the text
      // above it. Land once more when the page and its fonts have loaded,
      // unless the reader has scrolled since.
      const pageLoaded = new Promise((resolve) => {
        if (document.readyState === "complete") resolve();
        else addEventListener("load", resolve, { once: true });
      });
      Promise.all([pageLoaded, document.fonts?.ready]).then(() =>
        requestAnimationFrame(() => {
          if (landed !== null && Math.abs(scrollY - landed) < 2) land();
        }),
      );
    }
  });
  // A section is the current one once its top crosses this line.
  const currentLine = () => Math.max(100, innerHeight * 0.25);
  document.querySelectorAll("#pubFilter button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.year === "all"));
    button.addEventListener("click", () => {
      document.querySelectorAll("#pubFilter button").forEach((b) => {
        b.classList.toggle("active", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      document
        .querySelectorAll("#pubItems .item")
        .forEach((item) =>
          item.classList.toggle(
            "hidden",
            button.dataset.year !== "all" &&
              item.dataset.year !== button.dataset.year,
          ),
        );
      // Keep the heading in view when filtering interrupts a long anchor scroll.
      // (Leaving the page still when the heading is already near the top was
      // tried: a section link's scroll still under way, or late web fonts, can
      // then leave the list below the fold.)
      document
        .getElementById("publications")
        ?.scrollIntoView({ behavior: "instant", block: "start" });
      // Say what the filter did: the button's pressed state alone is silent.
      const status = document.getElementById("pubStatus");
      if (status) {
        const year = button.dataset.year;
        const shown = [...document.querySelectorAll("#pubItems .item")].filter(
          (item) => !item.classList.contains("hidden"),
        ).length;
        const total = document.querySelectorAll("#pubItems .item").length;
        status.textContent =
          year === "all"
            ? ""
            : root.lang === "ko"
              ? `전체 ${total}편 중 ${year}년 논문 ${shown}편`
              : `${shown} of ${total} publications from ${year}`;
      }
    });
  });
  const nav = document.querySelector(".mobile-nav");
  if (nav) {
    const sections = [
      ...document.querySelectorAll("#cv-content > section[id]"),
    ];
    let pending = false;
    const updateCurrent = () => {
      pending = false;
      // At the very end of the page the last section is current, even when it
      // is too short to reach the line the others cross (Patents), while it
      // is open. A page short enough not to scroll has no such end.
      const atEnd =
        scrollY > 0 &&
        !sections.at(-1)?.querySelector(".section-body[hidden]") &&
        innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      const crossed = atEnd
        ? sections.at(-1)
        : sections
            .filter(
              (section) => section.getBoundingClientRect().top <= currentLine(),
            )
            .at(-1);
      // A folded section is not where the reader is: only an open one is
      // current.
      const current = folds.some(
        (fold) => fold.section === crossed && !isOpen(fold),
      )
        ? null
        : crossed;
      nav.querySelectorAll("a").forEach((a) => {
        if (current && a.hash === "#" + current.id)
          a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    };
    const schedule = () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(updateCurrent);
      }
    };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    nav.addEventListener("click", schedule);
    refreshNav = schedule;
    schedule();
  }
  document.querySelectorAll("img").forEach((img) => {
    const failed = () => {
      img.hidden = true;
      if (img.closest(".profile-image"))
        img.closest(".profile-image").classList.add("image-unavailable");
      // A partner mark that does not load gives way to the chip's monogram,
      // the circle cv.css draws from data-m (its first letter if it has none),
      // instead of a broken-image icon.
      const chip = img.closest(".p-chip");
      if (chip) {
        chip.dataset.m ||= chip.textContent.trim().charAt(0);
        img.remove();
      }
    };
    img.addEventListener("error", failed);
    if (img.complete && !img.naturalWidth) failed();
  });
  // The KF-21 flyby over the CV entry of that project, on mouse hover or
  // keyboard focus. With the bookshelf on, library.js runs this same
  // interaction for the book and the entry, so here it only runs while the
  // bookshelf is off. jet-flyby.js (and the Three.js it imports) loads on the
  // first qualifying interaction only, never under reduced motion.
  if (!bookshelfOn) {
    const flightTarget = "#cv-work-camouflage-effectiveness";
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let jetModule,
      jetFlight,
      jetTimer,
      jetEpoch = 0,
      lastFlight = -Infinity;
    const flightAllowed = () =>
      !motion.matches &&
      !document.body.classList.contains("reader") &&
      !document.hidden;
    const stopFlyby = () => {
      jetEpoch++;
      clearTimeout(jetTimer);
      jetFlight?.cancel();
      jetFlight = null;
    };
    const requestFlyby = (target) => {
      if (!flightAllowed() || performance.now() - lastFlight < 7000) return;
      stopFlyby();
      const epoch = jetEpoch;
      jetTimer = setTimeout(async () => {
        jetModule ||= import(
          new URL(
            "project-library/jet-flyby.js?v=112-20260908r2",
            script?.src || location.href,
          ).href
        ).catch(() => null);
        const module = await jetModule;
        if (
          !module ||
          epoch !== jetEpoch ||
          !flightAllowed() ||
          !target.isConnected ||
          document.querySelector("dialog[open]")
        )
          return;
        try {
          const rect = target.getBoundingClientRect();
          jetFlight = module.playJetFlyby(
            document.body,
            rect.top + rect.height / 2,
          );
          lastFlight = performance.now();
          // The canvas rules live in the bookshelf's stylesheet, which is not
          // loaded while it is off: place the overlay here.
          const canvas = [...document.querySelectorAll(".kf21-flyby")].at(-1);
          if (canvas)
            Object.assign(canvas.style, {
              position: "fixed",
              inset: "0",
              zIndex: "100",
              pointerEvents: "none",
              contain: "strict",
            });
        } catch {
          // The CV reads the same without WebGL.
        }
      }, 180);
    };
    const flightEntry = (event) =>
      event.target instanceof Element ? event.target.closest(flightTarget) : null;
    // Only a mouse that really moves onto the entry starts the flyby. When the
    // page scrolls under a resting pointer, the browser reports the entry as
    // hovered although the pointer has not moved: the screen position of the
    // pointer is then unchanged, and that is not a request for the flyby.
    let lastPointer = null;
    let hovered = null;
    document.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        const moved =
          !lastPointer ||
          lastPointer.x !== event.screenX ||
          lastPointer.y !== event.screenY;
        lastPointer = { x: event.screenX, y: event.screenY };
        const target = flightEntry(event);
        if (!target) {
          hovered = null;
          return;
        }
        if (!moved || target === hovered) return;
        hovered = target;
        requestFlyby(target);
      },
      { passive: true },
    );
    document.addEventListener("pointerout", (event) => {
      const target = flightEntry(event);
      if (!target || target.contains(event.relatedTarget)) return;
      hovered = null;
      if (!jetFlight) stopFlyby();
    });
    // Only focus the reader moves with the keyboard: a link to
    // #cv-work-camouflage-effectiveness also focuses the entry while the page
    // loads, and that is not a request for the flyby.
    let lastKey = -Infinity;
    document.addEventListener(
      "keydown",
      () => {
        lastKey = performance.now();
      },
      { capture: true, passive: true },
    );
    document.addEventListener("focusin", (event) => {
      const target = flightEntry(event);
      if (
        target &&
        target.matches(":focus-visible") &&
        performance.now() - lastKey < 1000
      )
        requestFlyby(target);
    });
    document.addEventListener("focusout", (event) => {
      if (flightEntry(event) && !jetFlight) stopFlyby();
    });
    document.addEventListener("pointerdown", stopFlyby, { passive: true });
    document.addEventListener("visibilitychange", stopFlyby);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") stopFlyby();
    });
    addEventListener("pagehide", stopFlyby);
    addEventListener("beforeprint", stopFlyby);
    motion.addEventListener("change", stopFlyby);
    new MutationObserver(() => {
      if (!flightAllowed()) stopFlyby();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
})();
