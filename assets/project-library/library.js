(() => {
  "use strict";
  const root = document.getElementById("work-library");
  const designs = window.PROJECT_LIBRARY_DESIGNS;
  if (!root || !designs) return;
  const lang = () => (document.documentElement.lang === "ko" ? "ko" : "en");
  const text = (value) =>
    typeof value === "string" ? value : value?.[lang()] || value?.en || "";
  const pair = (en, ko) => ({ en, ko });
  const node = (tag, cls, content) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (content) el.textContent = text(content);
    return el;
  };
  const read = (source, selector) => {
    const el = selector ? source.querySelector(selector) : source;
    if (!el) return pair("", "");
    return Object.fromEntries(
      ["en", "ko"].map((language) => {
        const clone = el.cloneNode(true);
        clone
          .querySelectorAll(`[lang]:not([lang="${language}"])`)
          .forEach((n) => n.remove());
        clone
          .querySelectorAll('[aria-hidden="true"]')
          .forEach((n) => n.remove());
        return [language, clone.textContent.replace(/\s+/g, " ").trim()];
      }),
    );
  };
  const sources = {
    projects: [...document.querySelectorAll("#projects .items > .item")],
    publications: [...document.querySelectorAll("#pubItems .item")],
    awards: [...document.querySelectorAll("#awards .items > .item")],
  };
  const types = {
    projects: "project",
    publications: "publication",
    awards: "award",
  };
  const labels = {
    all: pair("All work", "전체 작업"),
    project: pair("Projects", "프로젝트"),
    publication: pair("Publications", "논문"),
    award: pair("Awards", "수상"),
  };
  const works = Object.entries(types).flatMap(([key, type]) =>
    designs[key]
      .map((design) => {
        const source = sources[key][design.sourceIndex];
        if (!source) return null;
        source.id ||= `cv-work-${design.slug}`;
        const title = read(
          source,
          type === "publication" ? ".paper-title" : ".item-title",
        );
        const meta = read(
          source,
          type === "publication" ? ".venue" : ".item-meta",
        );
        const year =
          source.dataset.year || meta.en.match(/\b20\d{2}\b/)?.[0] || "";
        const links = [...source.querySelectorAll("a[href]")]
          .filter(
            (el, i, all) => all.findIndex((a) => a.href === el.href) === i,
          )
          .map((el) => ({
            href: el.href,
            label: el.classList.contains("pub-link")
              ? el.textContent
              : "Source",
          }));
        const description = Object.fromEntries(
          ["en", "ko"].map((language) => [
            language,
            [...source.querySelectorAll(`.item-desc[lang="${language}"]`)]
              .map((el) => read(el)[language])
              .join("\n\n"),
          ]),
        );
        const citationNode = source
          .querySelector(".item-desc")
          ?.cloneNode(true);
        citationNode
          ?.querySelectorAll(".pub-n, .pub-link, .pub-role, .pub-tag")
          .forEach((el) => el.remove());
        const citation =
          type === "publication" && citationNode ? read(citationNode) : null;
        const partners = Object.fromEntries(
          ["en", "ko"].map((language) => [
            language,
            [...source.querySelectorAll(`.p-set[lang="${language}"] .p-chip`)]
              .map((el) => el.textContent.trim())
              .join(" · "),
          ]),
        );
        return {
          ...design,
          type,
          title,
          meta,
          year,
          links,
          description,
          citation,
          sourceId: source.id,
          role: read(source, ".pub-role"),
          takeaway: read(source, ".pub-value"),
          partners,
        };
      })
      .filter(Boolean),
  );
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor) return;
    if (anchor.getAttribute("href").startsWith("#")) return;
    const url = new URL(anchor.href);
    if (
      url.origin === location.origin &&
      (url.searchParams.get("view") === "cv" ||
        anchor.matches(".library-return"))
    ) {
      if (lang() === "ko") url.searchParams.set("lang", "ko");
      else url.searchParams.delete("lang");
      anchor.href = url.href;
    }
  });
  // CV deep links use the same stable record IDs even when the library is not mounted.
  if (document.documentElement.dataset.view === "cv") {
    const target = document.getElementById(
      decodeURIComponent(location.hash.slice(1)),
    );
    if (target) requestAnimationFrame(() => target.scrollIntoView());
    return;
  }

  root.className = "work-library catalog";
  root.replaceChildren();
  root.setAttribute("aria-labelledby", "site-title");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let category = "all";
  let query = "";
  let selected = null;
  let opener = null;
  let sequence = [];
  let closing = false;
  let ownedHistory = false;
  let pageAnimation = null;
  let listAnimation = null;
  let dialogAnimation = null;
  let transitionId = 0;
  let shelfObservers = [];
  let motionModule;
  let activeBookMotion;
  let motionEpoch = 0;
  let flyingBook;
  let flightPlaceholder;
  const loadBookMotion = () => {
    if (reduced.matches || document.body.classList.contains("reader"))
      return Promise.resolve(null);
    motionModule ||= import("./book-motion.js?v=111-20260908r2").catch(
      () => null,
    );
    return motionModule;
  };
  ["pointerover", "pointerdown", "focusin"].forEach((type) => {
    root.addEventListener(
      type,
      (event) => {
        if (event.target.closest("[data-pl-book]")) void loadBookMotion();
      },
      { passive: true },
    );
  });
  const arrivalAnimations = new Set();
  const arrivalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        arrivalObserver.unobserve(target);
        target.querySelectorAll(".catalog-row").forEach((book, index) => {
          const motion = animate(
            book,
            [
              { opacity: 0, transform: "translateY(22px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            420,
          );
          if (!motion) return;
          motion.effect.updateTiming({
            delay: Math.min(index * 24, 240),
            fill: "backwards",
          });
          arrivalAnimations.add(motion);
          motion.finished
            .catch(() => {})
            .finally(() => arrivalAnimations.delete(motion));
        });
      });
    },
    { threshold: 0.15 },
  );
  const stopArrival = () => {
    if (reduced.matches || document.body.classList.contains("reader")) {
      arrivalAnimations.forEach((motion) => motion.cancel());
    }
  };
  reduced.addEventListener("change", stopArrival);
  new MutationObserver(stopArrival).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  const animate = (el, frames, duration = 220) => {
    if (reduced.matches || document.body.classList.contains("reader"))
      return null;
    return el.animate(frames, { duration, easing: "cubic-bezier(.2,.7,.2,1)" });
  };
  const link = (label, href, cls = "") => {
    const el = node("a", cls, label);
    el.href = href;
    return el;
  };
  const button = (label, cls, action) => {
    const el = node("button", cls, label);
    el.type = "button";
    el.addEventListener("click", action);
    return el;
  };
  const shell = node("div", "catalog-shell");
  root.append(shell);
  const intro = node("section", "catalog-intro");
  const heading = node("h1", "", "Jihun Chae");
  heading.id = "site-title";
  const eyebrow = node("p", "catalog-eyebrow");
  const statement = node("p", "catalog-statement");
  const introMeta = node("div", "catalog-intro-meta");
  const affiliation = node("p");
  introMeta.append(affiliation);
  intro.append(eyebrow, heading, statement, introMeta);
  const archive = node("section", "catalog-archive");
  archive.id = "archive";
  const archiveHeading = node("div", "catalog-section-heading");
  const archiveTitle = node("h2");
  const count = node("span", "catalog-meta");
  count.setAttribute("role", "status");
  archiveHeading.append(archiveTitle, count);
  const toolbar = node("div", "catalog-toolbar");
  const filters = node("div", "catalog-filters");
  filters.setAttribute("role", "group");
  const searchLabel = node("label", "catalog-search");
  const search = node("input");
  search.type = "search";
  search.autocomplete = "off";
  searchLabel.append(search);
  toolbar.append(filters, searchLabel);
  const list = node("div", "catalog-list");
  const empty = node("div", "catalog-empty");
  empty.hidden = true;
  archive.append(archiveHeading, toolbar, list, empty);
  const footer = node("footer", "catalog-footer");
  const cvEntry = node("section", "catalog-cv-entry");
  shell.append(intro, archive, cvEntry, footer);
  const dialog = node("dialog", "catalog-reader");
  dialog.id = "work-detail";
  dialog.setAttribute("aria-label", text(pair("Work details", "작업 상세")));
  const readerHead = node("div", "catalog-reader-toolbar");
  const readerType = node("span", "catalog-meta");
  const readerControls = node("div", "catalog-reader-controls");
  const readerLanguage = button("한국어", "catalog-copy", () =>
    document.getElementById("langToggle").click(),
  );
  const close = button("×", "catalog-icon", () => closeReader());
  close.dataset.plAction = "close";
  readerControls.append(readerLanguage, close);
  readerHead.append(readerType, readerControls);
  const readerBody = node("div", "catalog-reader-body");
  const readerFooter = node("div", "catalog-reader-footer");
  const prev = button("←", "catalog-icon", () => step(-1));
  prev.dataset.plAction = "previous";
  const next = button("→", "catalog-icon", () => step(1));
  next.dataset.plAction = "next";
  const position = node("span", "catalog-meta");
  readerFooter.append(prev, position, next);
  dialog.append(readerHead, readerBody, readerFooter);
  const bookStage = node("div", "book-flight");
  const skipMotion = button(
    pair("Skip animation", "애니메이션 건너뛰기"),
    "book-flight-skip",
    () => stopBookMotion(true),
  );
  bookStage.append(skipMotion);
  dialog.append(bookStage);
  root.append(dialog);

  const stopBookMotion = (reveal = false) => {
    motionEpoch++;
    activeBookMotion?.cancel();
    activeBookMotion = null;
    flyingBook?.classList.remove("book-in-flight");
    flyingBook = null;
    flightPlaceholder?.remove();
    flightPlaceholder = null;
    const wasOpening = dialog.classList.contains("book-opening");
    dialog.classList.remove("book-opening", "book-handoff");
    dialog.style.removeProperty("--reader-reveal");
    delete bookStage.dataset.rendered;
    if (reveal && wasOpening && dialog.open) {
      close.focus({ preventScroll: true });
    }
  };
  const startBookMotion = async (work, trigger) => {
    const epoch = ++motionEpoch;
    const rect = trigger.getBoundingClientRect();
    const style = getComputedStyle(trigger);
    const color = style.backgroundColor,
      ink = style.color;
    flightPlaceholder = trigger.cloneNode(true);
    flightPlaceholder.className =
      trigger.className + " book-flight-placeholder";
    flightPlaceholder.removeAttribute("data-pl-book");
    flightPlaceholder.removeAttribute("title");
    flightPlaceholder.setAttribute("aria-hidden", "true");
    flightPlaceholder.tabIndex = -1;
    Object.assign(flightPlaceholder.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    bookStage.append(flightPlaceholder);
    flyingBook = trigger;
    flyingBook.classList.add("book-in-flight");
    let timeout;
    try {
      const module = await Promise.race([
        loadBookMotion(),
        new Promise((resolve) => {
          timeout = setTimeout(() => resolve(null), 1600);
        }),
      ]);
      if (epoch !== motionEpoch || !dialog.open) return;
      if (
        module &&
        !reduced.matches &&
        !document.body.classList.contains("reader")
      ) {
        const art = await module.prepareCoverArt(
          window.PROJECT_LIBRARY_ICONS?.create(work.icon)?.querySelector("svg"),
          ink,
        );
        if (epoch !== motionEpoch || !dialog.open) return;
        activeBookMotion = module.playBookOpening({
          container: bookStage,
          rect,
          color,
          ink,
          art,
          title: text(work.shortTitle || work.awardName || work.title),
          category: text(labels[work.type]),
          year: work.year,
          faceOut: trigger.classList.contains("catalog-face-out"),
          opening: readerBody.querySelector(".catalog-opening"),
          onHandoff: (progress) => {
            dialog.classList.add("book-handoff");
            dialog.style.setProperty("--reader-reveal", progress);
          },
          pages: fields(work)
            .slice(0, 4)
            .map(([title, body]) => ({ title: text(title), body: text(body) })),
        });
        flightPlaceholder?.remove();
        flightPlaceholder = null;
        await activeBookMotion.finished;
      }
    } catch {
      // Reading remains available when modules, shaders, or WebGL cannot start.
    } finally {
      clearTimeout(timeout);
      if (epoch === motionEpoch) stopBookMotion(true);
    }
  };
  reduced.addEventListener("change", () => {
    if (reduced.matches) stopBookMotion(true);
  });

  const urlFor = (slug) => {
    const url = new URL(location.href);
    url.searchParams.delete("view");
    if (slug) url.searchParams.set("work", slug);
    else url.searchParams.delete("work");
    return url;
  };
  const fields = (work) => {
    const e = work.editorial || {},
      s = work.story || {};
    if (work.type === "project")
      return [
        [pair("The question", "핵심 질문"), e.question],
        [pair("The problem", "문제"), e.problem || s.research],
        [pair("My responsibility", "나의 책임"), e.responsibility],
        [pair("What was built", "구축한 것"), e.build || s.artifact],
        [pair("Design decisions", "설계 결정"), e.decision || s.design],
        [pair("Evaluation", "평가"), e.validation || e.evaluation],
        [pair("Delivery", "구축 성과"), e.outcomeSystem],
        [
          pair("Research outcomes", "연구 성과"),
          e.outcomeEvidence || s.evidence,
        ],
        [pair("Collaboration", "협업"), e.outcomeValue || e.outcome],
        [pair("What I learned", "배운 점"), e.lesson],
        [pair("Project partners", "협력 기관"), work.partners],
      ];
    if (work.type === "publication")
      return [
        [pair("Authorship", "저자 역할"), work.role],
        [pair("Research question", "연구 질문"), e.question],
        [pair("Knowledge gap", "지식 공백"), e.gap],
        [pair("Contribution", "연구 기여"), e.contribution],
        [pair("Method", "방법"), e.method],
        [
          pair("Key finding", "핵심 결과"),
          e.takeaway || e.findings || s.evidence,
        ],
        [pair("Finding 01", "결과 01"), e.finding1],
        [pair("Finding 02", "결과 02"), e.finding2],
        [pair("Finding 03", "결과 03"), e.finding3],
        [pair("Implications", "시사점"), e.implication || e.implications],
        [pair("Scope", "범위"), e.scope],
        [pair("Full citation", "전체 인용"), work.citation],
      ];
    return [
      [
        pair("Recognition", "수상 및 선정"),
        e.verifiedResult || work.description,
      ],
      [pair("Selection context", "선발 과정"), e.selectionContext],
      [pair("The challenge", "과제"), e.challenge],
      [pair("My contribution", "나의 기여"), e.contribution || s.artifact],
      [pair("Selection criteria", "선발 기준"), e.criteria],
      [pair("What this recognizes", "인정받은 역량"), e.validates],
      [pair("Hosts and sponsors", "주최 및 후원"), work.partners],
    ];
  };
  const renderReader = () => {
    if (!selected) return;
    const w = selected;
    dialog.dataset.type = w.type;
    readerBody.replaceChildren();
    const title = node("h2", "", w.awardName || w.title);
    title.id = "catalog-reader-title";
    dialog.setAttribute("aria-labelledby", "catalog-reader-title");
    const meta = node("p", "catalog-reader-meta", w.meta);
    const summary = node(
      "p",
      "catalog-reader-summary",
      w.subtitle || w.takeaway,
    );
    const opening = node("div", "catalog-opening");
    const leftPage = node("div", "catalog-opening-index");
    const rightPage = node("div", "catalog-opening-page");
    leftPage.append(
      node(
        "p",
        "catalog-page-label",
        pair("Jihun Chae / Collected work", "채지훈 / 작업 모음"),
      ),
      node("p", "catalog-opening-name", w.shortTitle || w.awardName || w.title),
    );
    rightPage.append(
      node("p", "catalog-page-label", `${text(labels[w.type])} / ${w.year}`),
      title,
      meta,
      summary,
    );
    const sectionNav = node("nav", "catalog-contents");
    sectionNav.setAttribute("aria-label", text(pair("Contents", "목차")));
    const sections = fields(w).filter(([, value]) => text(value));
    sections.forEach(([label], i) =>
      sectionNav.append(link(label, `#reader-section-${i}`)),
    );
    leftPage.append(sectionNav);
    leftPage.append(node("p", "catalog-folio", "01"));
    rightPage.append(node("p", "catalog-folio", "02"));
    opening.append(leftPage, rightPage);
    readerBody.append(opening);
    const mobileContents = node("details", "catalog-mobile-contents");
    mobileContents.append(
      node("summary", "", pair("Contents", "목차")),
      sectionNav.cloneNode(true),
    );
    readerBody.append(mobileContents);
    const chapters = node("div", "catalog-chapters");
    sections.forEach(([label, value], i) => {
      const section = node("section", "catalog-reader-section");
      section.id = `reader-section-${i}`;
      section.append(node("h3", "", label), node("p", "", value));
      if (i === 0) rightPage.append(section);
      else chapters.append(section);
    });
    const actions = node("div", "catalog-reader-actions");
    w.links.forEach((source) => {
      const a = link(
        source.label === "Source"
          ? pair("Original source ↗", "원문 보기 ↗")
          : source.label,
        source.href,
      );
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      actions.append(a);
    });
    actions.append(
      link(
        pair("View in full CV", "전체 이력서에서 보기"),
        `?view=cv#${w.sourceId}`,
      ),
    );
    const copy = button(
      pair("Copy link", "링크 복사"),
      "catalog-copy",
      async () => {
        try {
          await navigator.clipboard.writeText(urlFor(w.slug).href);
          copy.textContent = text(pair("Link copied", "링크 복사됨"));
        } catch {
          copy.textContent = text(
            pair("Link is in the address bar", "주소창에서 링크를 확인하세요"),
          );
        }
      },
    );
    copy.setAttribute("aria-live", "polite");
    actions.append(copy);
    chapters.append(actions);
    readerBody.append(chapters);
    readerType.textContent = `${text(labels[w.type])} / ${w.year}`;
    const mark = window.PROJECT_LIBRARY_ICONS?.create(w.icon);
    if (mark) readerType.prepend(mark);
    readerLanguage.textContent = lang() === "ko" ? "English" : "한국어";
    readerLanguage.setAttribute(
      "aria-label",
      text(pair("Read in Korean", "영어로 읽기")),
    );
    close.setAttribute("aria-label", text(pair("Close work", "작업 닫기")));
    close.title = close.ariaLabel;
    prev.setAttribute("aria-label", text(pair("Previous work", "이전 작업")));
    prev.title = prev.ariaLabel;
    next.setAttribute("aria-label", text(pair("Next work", "다음 작업")));
    next.title = next.ariaLabel;
    const i = sequence.indexOf(w);
    prev.disabled = i <= 0;
    next.disabled = i >= sequence.length - 1;
    position.textContent = `${String(i + 1).padStart(2, "0")} / ${String(sequence.length).padStart(2, "0")}`;
    readerBody.scrollTop = 0;
  };
  const openReader = (work, trigger = null, fromHistory = false) => {
    transitionId++;
    stopBookMotion();
    dialogAnimation?.cancel();
    closing = false;
    selected = work;
    if (trigger) opener = trigger;
    sequence = visibleWorks();
    if (!sequence.includes(work))
      sequence = works.filter((w) => w.type === work.type);
    renderReader();
    if (!dialog.open) {
      const cinematic =
        trigger &&
        !reduced.matches &&
        !document.body.classList.contains("reader");
      if (cinematic) dialog.classList.add("book-opening");
      dialog.showModal();
      document.documentElement.classList.add("catalog-reading");
      if (cinematic) {
        skipMotion.textContent = text(
          pair("Skip animation", "애니메이션 건너뛰기"),
        );
        skipMotion.focus({ preventScroll: true });
        void startBookMotion(work, trigger);
      } else {
        if (trigger) {
          const source = trigger.getBoundingClientRect();
          const surface = dialog.getBoundingClientRect();
          dialog.style.transformOrigin = `${source.left + source.width / 2 - surface.left}px ${source.top + source.height / 2 - surface.top}px`;
        } else dialog.style.transformOrigin = "50% 75%";
        dialogAnimation = animate(
          dialog,
          [
            { opacity: 0, transform: "translateY(12px) scale(.96)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          280,
        );
      }
    }
    if (!fromHistory) {
      history.pushState({ catalog: true }, "", urlFor(work.slug));
      ownedHistory = true;
    }
  };
  const finishClose = () => {
    stopBookMotion();
    const fallback = opener?.dataset.plBook;
    const selector = opener?.matches(".catalog-record")
      ? ".catalog-record"
      : ".catalog-volume";
    dialog.close();
    selected = null;
    closing = false;
    document.documentElement.classList.remove("catalog-reading");
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    else
      (
        root.querySelector(`${selector}[data-pl-book="${fallback}"]`) || search
      ).focus({ preventScroll: true });
  };
  const closeReader = async (fromHistory = false) => {
    if (!dialog.open || closing) return;
    closing = true;
    const token = ++transitionId;
    const wasOpening = dialog.classList.contains("book-opening");
    stopBookMotion();
    dialogAnimation?.cancel();
    const a = (dialogAnimation = wasOpening
      ? null
      : animate(
          dialog,
          [
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(8px)" },
          ],
          140,
        ));
    if (a) await a.finished.catch(() => {});
    if (token !== transitionId) return;
    finishClose();
    if (!fromHistory) {
      if (ownedHistory) {
        ownedHistory = false;
        history.back();
      } else history.replaceState(null, "", urlFor(null));
    }
  };
  const step = (delta) => {
    if (closing || !selected) return;
    stopBookMotion();
    const work = sequence[sequence.indexOf(selected) + delta];
    if (!work) return;
    selected = work;
    renderReader();
    history.replaceState({ catalog: true }, "", urlFor(work.slug));
    pageAnimation?.cancel();
    pageAnimation = animate(
      readerBody,
      [
        { opacity: 0.25, transform: `translateX(${delta * 8}px)` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      180,
    );
  };
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReader();
  });
  dialog.addEventListener("click", (event) => {
    const r = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom)
    )
      closeReader();
  });
  dialog.addEventListener("keydown", (event) => {
    if (dialog.classList.contains("book-opening") && event.key === "Tab") {
      event.preventDefault();
      skipMotion.focus();
      return;
    }
    if (event.key === "Tab") {
      const controls = [
        ...dialog.querySelectorAll("button:not(:disabled),a[href],summary"),
      ].filter((el) => el.checkVisibility());
      const first = controls[0],
        last = controls.at(-1);
      if (event.shiftKey && event.target === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && event.target === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (
      event.target.matches("input,textarea") ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });
  dialog.addEventListener("click", (event) => {
    const anchor = event.target.closest(".catalog-contents a");
    if (!anchor) return;
    event.preventDefault();
    const target = dialog.querySelector(anchor.getAttribute("href"));
    target?.scrollIntoView({
      behavior:
        reduced.matches || document.body.classList.contains("reader")
          ? "instant"
          : "smooth",
      block: "start",
    });
  });
  window.addEventListener("popstate", (event) => {
    const params = new URLSearchParams(location.search);
    if ((params.get("lang") === "ko") !== (lang() === "ko"))
      document.getElementById("langToggle").click();
    const work = works.find((w) => w.slug === params.get("work"));
    ownedHistory = Boolean(event.state?.catalog);
    if (work) openReader(work, null, true);
    else {
      ownedHistory = false;
      closeReader(true);
    }
  });

  const visibleWorks = () =>
    works
      .filter(
        (w) =>
          (category === "all" || w.type === category) &&
          [
            w.title.en,
            w.title.ko,
            w.shortTitle?.en,
            w.shortTitle?.ko,
            w.meta.en,
            w.meta.ko,
            w.category?.en,
            w.category?.ko,
            w.year,
          ]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase().trim()),
      )
      .sort((a, b) => {
        if (a.slug === "inclusive-game-ai") return -1;
        if (b.slug === "inclusive-game-ai") return 1;
        return Number(b.year) - Number(a.year);
      });
  const renderList = (motion = false) => {
    listAnimation?.cancel();
    arrivalObserver.disconnect();
    arrivalAnimations.forEach((animation) => animation.cancel());
    shelfObservers.forEach((observer) => observer.disconnect());
    shelfObservers = [];
    const shown = visibleWorks();
    list.replaceChildren();
    for (let start = 0; start < shown.length; start += 13) {
      const group = shown.slice(start, start + 13);
      const displayBook = group.find((w) => w.type === "project");
      const shelf = node("section", "bookshelf");
      const shelfHead = node("div", "shelf-heading");
      const years = group.map((w) => Number(w.year));
      const newest = Math.max(...years),
        oldest = Math.min(...years);
      const title = node(
        "h3",
        "",
        `${String(start / 13 + 1).padStart(2, "0")} / ${newest}${oldest !== newest ? " - " + oldest : ""}`,
      );
      const controls = node("div", "shelf-controls");
      const viewport = node("div", "shelf-viewport");
      viewport.setAttribute("role", "region");
      viewport.setAttribute(
        "aria-label",
        text(pair(`Bookshelf ${start / 13 + 1}`, `책장 ${start / 13 + 1}`)),
      );
      const track = node("ol", "shelf-track");
      const caption = node("p", "shelf-caption");
      const describe = (w) => {
        caption.replaceChildren(
          node("span", "shelf-caption-type", labels[w.type]),
          node("span", "", w.awardName || w.title),
        );
      };
      describe(displayBook || group[0]);
      const back = button("←", "shelf-arrow", () =>
        viewport.scrollBy({
          left: -viewport.clientWidth * 0.8,
          behavior:
            reduced.matches || document.body.classList.contains("reader")
              ? "instant"
              : "smooth",
        }),
      );
      const forward = button("→", "shelf-arrow", () =>
        viewport.scrollBy({
          left: viewport.clientWidth * 0.8,
          behavior:
            reduced.matches || document.body.classList.contains("reader")
              ? "instant"
              : "smooth",
        }),
      );
      back.setAttribute(
        "aria-label",
        text(pair("Browse shelf left", "책장 왼쪽으로")),
      );
      forward.setAttribute(
        "aria-label",
        text(pair("Browse shelf right", "책장 오른쪽으로")),
      );
      back.title = back.ariaLabel;
      forward.title = forward.ariaLabel;
      const updateScroll = () => {
        back.disabled = viewport.scrollLeft <= 1;
        forward.disabled =
          viewport.scrollLeft + viewport.clientWidth >=
          viewport.scrollWidth - 2;
      };
      viewport.addEventListener("scroll", updateScroll, { passive: true });
      controls.append(back, forward);
      shelfHead.append(title, controls);
      group.forEach((w, i) => {
        const item = node("li", "catalog-row");
        item.dataset.type = w.type;
        const btn = button("", "catalog-record catalog-volume", () =>
          openReader(w, btn),
        );
        btn.dataset.plBook = w.slug;
        btn.dataset.palette = w.palette;
        btn.dataset.type = w.type;
        if (w === displayBook) btn.classList.add("catalog-face-out");
        btn.style.setProperty(
          "--book-height",
          `${w.type === "project" ? 246 : w.type === "award" ? 210 : 222 + (i % 3) * 8}px`,
        );
        btn.setAttribute(
          "aria-label",
          `${text(w.awardName || w.title)}. ${text(labels[w.type])}, ${w.year}`,
        );
        btn.title = text(w.awardName || w.title);
        const cover = node("span", "book-spine");
        cover.setAttribute("aria-hidden", "true");
        cover.append(
          node(
            "span",
            "book-number",
            String(works.indexOf(w) + 1).padStart(2, "0"),
          ),
          node("span", "book-title", w.shortTitle || w.awardName || w.title),
          node("span", "book-year", w.year),
        );
        if (w === displayBook) {
          const emblem = window.PROJECT_LIBRARY_ICONS?.create(w.icon, "cover");
          if (emblem)
            cover.insertBefore(emblem, cover.querySelector(".book-title"));
        }
        btn.append(cover);
        item.append(btn);
        track.append(item);
        btn.addEventListener("pointerenter", () => describe(w));
        btn.addEventListener("focus", () => describe(w));
      });
      track.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        const buttons = [...track.querySelectorAll("button")];
        const index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        event.preventDefault();
        const target =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : Math.max(
                  0,
                  Math.min(
                    buttons.length - 1,
                    index + (event.key === "ArrowRight" ? 1 : -1),
                  ),
                );
        buttons[target].focus({ preventScroll: true });
        buttons[target].scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior:
            reduced.matches || document.body.classList.contains("reader")
              ? "instant"
              : "smooth",
        });
      });
      viewport.append(track);
      shelf.append(shelfHead, viewport, caption);
      list.append(shelf);
      if (!motion) arrivalObserver.observe(track);
      requestAnimationFrame(updateScroll);
      const observer = new ResizeObserver(updateScroll);
      observer.observe(viewport);
      shelfObservers.push(observer);
    }
    count.textContent = text(
      pair(
        shown.length === works.length
          ? `${works.length} collected works`
          : `${shown.length} of ${works.length} works`,
        `${works.length}개 중 ${shown.length}개`,
      ),
    );
    empty.hidden = shown.length > 0;
    empty.replaceChildren(
      node("p", "", pair("No matching work.", "일치하는 작업이 없습니다.")),
      button(pair("Clear filters", "필터 초기화"), "catalog-copy", () => {
        category = "all";
        query = "";
        search.value = "";
        renderFilters();
        renderList(true);
      }),
    );
    if (motion)
      listAnimation = animate(
        list,
        [
          { opacity: 0.35, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        160,
      );
  };
  const renderFilters = () => {
    filters.replaceChildren();
    filters.setAttribute(
      "aria-label",
      text(pair("Filter work by type", "작업 유형별 필터")),
    );
    Object.entries(labels).forEach(([key, label]) => {
      const n =
        key === "all"
          ? works.length
          : works.filter((w) => w.type === key).length;
      const btn = button(label, "catalog-filter", () => {
        category = key;
        renderFilters();
        renderList(true);
        filters.querySelector(`[data-filter="${key}"]`).focus();
      });
      btn.dataset.filter = key;
      btn.setAttribute("aria-pressed", String(category === key));
      btn.append(node("span", "", String(n)));
      filters.append(btn);
    });
  };
  search.addEventListener("input", () => {
    query = search.value;
    renderList();
  });
  const localize = () => {
    const focused = document.activeElement;
    const focusSlug = focused?.dataset.plBook;
    const focusSelector = focused?.matches(".catalog-record")
      ? ".catalog-record"
      : ".catalog-volume";
    document.getElementById("ttsToggle").title = text(
      pair("Toggle reader mode", "읽기 모드 전환"),
    );
    document
      .getElementById("ttsToggle")
      .setAttribute(
        "aria-label",
        text(pair("Toggle reader mode", "읽기 모드 전환")),
      );
    eyebrow.textContent = text(
      pair("A personal collection", "생각과 작업을 모은 곳"),
    );
    statement.replaceChildren(
      document.createTextNode(
        text(
          pair(
            "I build and research interactive systems around ",
            "사람과 AI를 중심으로 ",
          ),
        ),
      ),
      node(
        "span",
        "catalog-statement-focus",
        pair("humans and AI.", "인터랙티브 시스템을 만들고 연구합니다."),
      ),
    );
    affiliation.textContent = text(
      pair(
        "Ph.D. researcher at KAIST · Daejeon, Korea",
        "KAIST 문화기술대학원 박사과정 · 대전",
      ),
    );
    archiveTitle.textContent = text(pair("The bookshelf", "나의 책장"));
    search.placeholder = text(
      pair("Find something on the shelf", "책장에서 찾기"),
    );
    search.setAttribute(
      "aria-label",
      text(pair("Search the work library", "작업 라이브러리 검색")),
    );
    footer.replaceChildren(
      link(
        pair("Say hello ↗", "안부 전하기 ↗"),
        "mailto:chaejihun@kaist.ac.kr",
      ),
    );
    cvEntry.replaceChildren(
      link(
        pair("See the full CV ↗", "전체 이력서 보기 ↗"),
        "?view=cv",
        "catalog-cv-link",
      ),
    );
    renderFilters();
    renderList();
    if (selected) renderReader();
    else if (focusSlug)
      root
        .querySelector(`${focusSelector}[data-pl-book="${focusSlug}"]`)
        ?.focus({ preventScroll: true });
  };
  let lastLanguage = lang();
  new MutationObserver(() => {
    if (lang() !== lastLanguage) {
      lastLanguage = lang();
      localize();
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  localize();
  animate(
    intro,
    [
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    360,
  );
  const initial = works.find(
    (w) => w.slug === new URLSearchParams(location.search).get("work"),
  );
  if (initial) openReader(initial, null, true);
  else if (new URLSearchParams(location.search).has("work")) {
    const notice = node(
      "p",
      "catalog-notice",
      pair(
        "This work is no longer in the library.",
        "이 작업은 현재 책장에 없습니다.",
      ),
    );
    notice.setAttribute("role", "status");
    notice.append(
      button(
        pair("Return to the bookshelf", "책장으로 돌아가기"),
        "catalog-copy",
        () => {
          history.replaceState(null, "", urlFor(null));
          notice.remove();
        },
      ),
    );
    archive.prepend(notice);
  }
})();
