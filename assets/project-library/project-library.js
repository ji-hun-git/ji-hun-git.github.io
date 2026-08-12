(() => {
  "use strict";

  const root = document.getElementById("work-library");
  const shelf = document.getElementById("plShelf");
  const viewport = document.getElementById("plShelfViewport");
  const readingDock = document.getElementById("plReadingDock");
  const shell = root?.querySelector(".pl-shell");
  const stage = root?.querySelector(".pl-stage");
  const status = document.getElementById("plStatus");
  const caption = document.getElementById("plBookCaption");
  const designs = window.PROJECT_LIBRARY_DESIGNS;

  if (!root || !shelf || !viewport || !readingDock || !stage || !designs) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forcedColors = window.matchMedia("(forced-colors: active)");
  const compactLayout = window.matchMedia("(max-width: 980px)");
  const embeddedLayout = root.classList.contains("pl-embedded");
  const scrollButtons = [...root.querySelectorAll("[data-pl-scroll]")];
  const sourceNodes = {
    projects: [...document.querySelectorAll("#projects .items > .item")],
    publications: [...document.querySelectorAll("#pubItems .item")],
    awards: [...document.querySelectorAll("#awards .items > .item")]
  };

  let currentWork = null;
  let currentTrigger = null;
  let scrollUpdateFrame = 0;
  let captionLayoutFrame = 0;
  let historyOwned = false;
  let historyClosePending = false;
  let transitionPhase = "closed";
  let transitionEpoch = 0;
  let transitionController = null;
  let queuedIntent = null;
  let drainingQueuedIntent = false;
  let heldDockHeight = 0;
  let boundedOpeningTurn = null;
  let currentSourceRect = null;
  let activeFlightCover = null;
  let activePageFan = null;
  let shelfFocusProxy = null;
  let shelfFocusProxyTrigger = null;
  let shelfFocusProxyFrame = 0;
  let captionModality = "pointer";
  let anchorUpdateFrame = 0;
  let anchorRefreshPending = false;
  let readerAnchorTrigger = null;
  let viewTransitionEpoch = 0;
  let popstateEpoch = 0;
  let viewTransitionController = null;
  let activeNativeViewTransition = null;
  let activeViewAnimations = [];
  let compactKeywordState = root.clientWidth <= 760;

  root.dataset.inputModality = "pointer";
  document.addEventListener("pointerdown", () => {
    captionModality = "pointer";
    root.dataset.inputModality = "pointer";
    clearShelfFocusProxy();
  }, true);
  document.addEventListener("keydown", () => {
    captionModality = "keyboard";
    root.dataset.inputModality = "keyboard";
  }, true);

  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

  // Plain-language subject labels let a non-specialist understand the shelf at
  // a glance. They are presentation labels only; each trigger still exposes the
  // full authored title through its accessible name and interaction caption.
  const mainKeywords = Object.freeze({
    "inclusive-game-ai": { en: "AI AGENT", ko: "AI 에이전트" },
    "data-quality-engine": { en: "DATA QUALITY", ko: "데이터 품질" },
    "haenyeo-legacy": { en: "HERITAGE", ko: "문화유산" },
    "adaptive-xr": { en: "IMMERSIVE TECH", ko: "몰입형 기술" },
    "camouflage-effectiveness": { en: "COMPUTER VISION", ko: "컴퓨터 비전" },
    "smart-city-tracking": { en: "OBJECT TRACKING", ko: "객체 추적" },
    "ai-assistant-disabilities-thesis": { en: "ACCESSIBLE AI", ko: "접근성 AI" },
    "toward-ludic-ai": { en: "AI EVALUATION", ko: "AI 평가" },
    "game-accessibility-preferences": { en: "USER RESEARCH", ko: "사용자 연구" },
    "gaia-design-principles": { en: "AI DESIGN", ko: "AI 설계" },
    "game-ai-assistant-barriers": { en: "ACCESSIBILITY", ko: "접근성" },
    "press-start-to-continue": { en: "ACCESSIBLE GAMES", ko: "게임 접근성" },
    "game-npc-identity": { en: "AI CHARACTERS", ko: "AI 캐릭터" },
    "rag-enhanced-gaia": { en: "AI CHATBOT", ko: "AI 챗봇" },
    "pleth-ethical-llm": { en: "AI ETHICS", ko: "AI 윤리" },
    "gaia-service-framework": { en: "AI ASSISTANT", ko: "AI 지원" },
    "llm-npc-scoping-review": { en: "AI CHARACTERS", ko: "AI 캐릭터" },
    "hybe-multilabel-review": { en: "STRATEGY", ko: "경영 전략" },
    "bighit-to-hybe": { en: "MEDIA ANALYSIS", ko: "미디어 분석" },
    "vr-environmental-awareness": { en: "VR LEARNING", ko: "VR 학습" },
    "ml-demand-forecasting": { en: "FORECASTING", ko: "수요 예측" },
    "recycling-gamification": { en: "BEHAVIOR CHANGE", ko: "행동 변화" },
    "diplopia-rehabilitation": { en: "DIGITAL HEALTH", ko: "디지털 헬스" },
    "eye-tracking-vr-games": { en: "EYE TRACKING", ko: "시선 추적" },
    "cynophobia-vr-exposure": { en: "VR EXPOSURE", ko: "VR 노출" },
    "clustering-prediction": { en: "PREDICTION", ko: "예측 모델" },
    "regression-clustering": { en: "FORECASTING", ko: "수요 예측" },
    "krafton-fde-challenge": { en: "AI AGENT", ko: "AI 에이전트" },
    "game-society-best-presentation": { en: "ACCESSIBLE AI", ko: "접근성 AI" },
    "edu40-ta-excellence": { en: "EDUCATION", ko: "교육" },
    "asan-climate-tech-team": { en: "CLIMATE TECH", ko: "기후 기술" },
    "pohang-media-facade-camp": { en: "MEDIA ART", ko: "미디어 아트" },
    "eye-tracking-vr-research-award": { en: "EYE TRACKING", ko: "시선 추적" },
    "watchers-metaverse-excellence": { en: "DIGITAL HEALTH", ko: "디지털 헬스" },
    "esg-ar-encouragement-prize": { en: "CLIMATE TECH", ko: "기후 기술" },
    "cynophobia-vr-research-award": { en: "VR EXPOSURE", ko: "VR 노출" },
    "db-snubiz-startup-challenge": { en: "STARTUP", ko: "스타트업" }
  });

  const compactMainKeywords = mainKeywords;

  const localizedText = (node, lang) => {
    if (!node) return "";
    const direct = node.matches?.(`[lang="${lang}"]`)
      ? node
      : node.querySelector?.(`[lang="${lang}"]`);
    if (direct) return clean(direct.textContent);

    const clone = node.cloneNode(true);
    clone.querySelectorAll(`[lang]:not([lang="${lang}"])`).forEach((child) => child.remove());
    return clean(clone.textContent);
  };

  const pairFrom = (node) => {
    const en = localizedText(node, "en") || clean(node?.textContent);
    const ko = localizedText(node, "ko") || en;
    return { en, ko };
  };

  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  // A cover needs four independently projected edges to read as a rigid
  // object while it is close to edge-on. Pseudo-elements only provide two
  // planes and disappear at the exact moment the board's thickness matters.
  const appendRigidEdges = (node) => {
    ["spine", "fore", "top", "bottom"].forEach((edge) => {
      node.append(create("span", `pl-rigid-edge pl-rigid-edge--${edge}`));
    });
    return node;
  };

  const snapshotRect = (node) => {
    const rect = node?.getBoundingClientRect?.();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  };

  const appendPair = (parent, pair, tag = "span") => {
    const en = create(tag, "", pair?.en || "");
    en.lang = "en";
    const ko = create(tag, "", pair?.ko || pair?.en || "");
    ko.lang = "ko";
    parent.append(en, ko);
    return parent;
  };

  const getLinks = (source, publication) => {
    const candidates = publication
      ? [...source.querySelectorAll(".pub-link[href], .paper-title.closest-link")]
      : [...source.querySelectorAll("a[href]")];
    if (publication && !candidates.length) {
      candidates.push(...source.querySelectorAll("a[href]"));
    }
    const seen = new Set();
    return candidates
      .filter((link) => link?.href && !seen.has(link.href) && seen.add(link.href))
      .slice(0, 3)
      .map((link) => ({
        href: link.href,
        label: clean(link.textContent) || "Open record"
      }));
  };

  const descriptionsFor = (source, lang) => [...source.querySelectorAll(`.item-desc[lang="${lang}"]`)]
    .flatMap((node) => node.matches("ul")
      ? [...node.querySelectorAll("li")].map((item) => clean(item.textContent))
      : [clean(node.textContent)])
    .filter(Boolean);

  const partnersFor = (source, lang) => [...source.querySelectorAll(`.p-set[lang="${lang}"] .p-chip`)]
    .map((node) => clean(node.textContent))
    .filter(Boolean);

  const latestYearFrom = (value) => {
    const years = [...String(value || "").matchAll(/20\d{2}/g)].map((match) => Number(match[0]));
    return years.length ? Math.max(...years) : 0;
  };

  const extractProject = (design) => {
    const source = sourceNodes.projects[design.sourceIndex];
    if (!source) return null;
    source.id = source.id || `cv-work-${design.slug}`;
    source.dataset.libraryWork = design.slug;

    const title = pairFrom(source.querySelector(".item-title"));
    const meta = pairFrom(source.querySelector(".item-meta"));
    const descriptions = {
      en: descriptionsFor(source, "en"),
      ko: descriptionsFor(source, "ko")
    };
    const partners = {
      en: partnersFor(source, "en"),
      ko: partnersFor(source, "ko")
    };
    const latestYear = latestYearFrom(meta.en);

    return {
      ...design,
      type: "project",
      title,
      meta,
      descriptions,
      partners,
      links: getLinks(source, false),
      year: latestYear ? String(latestYear) : "Not dated",
      sortYear: latestYear,
      source,
      sourceId: source.id
    };
  };

  const extractPublication = (design) => {
    const source = sourceNodes.publications[design.sourceIndex];
    if (!source) return null;
    source.id = source.id || `cv-work-${design.slug}`;
    source.dataset.libraryWork = design.slug;

    const paragraph = source.querySelector(".item-desc") || source;
    const titleNode = source.querySelector(".paper-title");
    const title = pairFrom(titleNode || paragraph);
    const citationClone = paragraph.cloneNode(true);
    citationClone.querySelectorAll(".pub-n, .pub-link, .pub-role, .pub-tag").forEach((node) => node.remove());
    const citation = pairFrom(citationClone);
    const venue = pairFrom(source.querySelector(".venue"));
    const role = pairFrom(source.querySelector(".pub-role"));
    const year = source.dataset.year || clean(source.closest(".pub-group")?.querySelector(".pub-group-title")?.firstChild?.textContent);

    return {
      ...design,
      type: "publication",
      title,
      meta: venue.en ? venue : { en: year, ko: year },
      citation,
      role,
      descriptions: { en: [], ko: [] },
      partners: { en: [], ko: [] },
      links: getLinks(source, true),
      year,
      sortYear: Number.parseInt(year, 10) || 0,
      source,
      sourceId: source.id
    };
  };

  const extractAward = (design) => {
    const source = sourceNodes.awards[design.sourceIndex];
    if (!source) return null;
    source.id = source.id || `cv-work-${design.slug}`;
    source.dataset.libraryWork = design.slug;

    const title = pairFrom(source.querySelector(".item-title"));
    const meta = pairFrom(source.querySelector(".item-meta"));
    const descriptions = {
      en: descriptionsFor(source, "en"),
      ko: descriptionsFor(source, "ko")
    };
    const partners = {
      en: partnersFor(source, "en"),
      ko: partnersFor(source, "ko")
    };
    const latestYear = latestYearFrom(meta.en);

    return {
      ...design,
      type: "award",
      title,
      meta,
      descriptions,
      partners,
      links: getLinks(source, false),
      year: latestYear ? String(latestYear) : "Not dated",
      sortYear: latestYear,
      source,
      sourceId: source.id
    };
  };

  const works = {
    projects: (designs.projects || []).map(extractProject).filter(Boolean),
    publications: (designs.publications || []).map(extractPublication).filter(Boolean),
    awards: (designs.awards || []).map(extractAward).filter(Boolean)
  };
  const typeRank = { project: 0, publication: 1, award: 2 };
  const allWorks = [...works.projects, ...works.publications, ...works.awards].sort((a, b) => {
    const byYear = b.sortYear - a.sortYear;
    if (byYear) return byYear;
    if (a.type !== b.type) return typeRank[a.type] - typeRank[b.type];
    return a.sourceIndex - b.sourceIndex;
  });
  allWorks.forEach((work) => {
    work.mainKeyword = mainKeywords[work.slug] || work.shortTitle;
  });

  const detail = create("article", "pl-detail");
  detail.id = "work-detail";
  detail.tabIndex = -1;
  detail.hidden = true;
  readingDock.append(detail);
  readingDock.dataset.state = "closed";
  readingDock.hidden = true;
  root.dataset.motionState = "closed";

  const currentLanguage = () => document.documentElement.lang?.toLowerCase().startsWith("ko") || document.body.classList.contains("ko") ? "ko" : "en";

  const typeLabels = {
    project: { en: "Project", ko: "프로젝트" },
    publication: { en: "Publication", ko: "출판물" },
    award: { en: "Award", ko: "수상" }
  };

  const typeLabelFor = (work, lang = currentLanguage()) => typeLabels[work.type]?.[lang] || typeLabels[work.type]?.en || work.type;
  const labelFor = (work, lang = currentLanguage()) => work.shortTitle?.[lang] || work.shortTitle?.en || work.title?.[lang] || work.title?.en;
  const mainKeywordFor = (work, lang = currentLanguage()) => {
    const keyword = compactKeywordState ? compactMainKeywords[work.slug] : work.mainKeyword;
    return keyword?.[lang] || keyword?.en || work.mainKeyword?.[lang] || work.mainKeyword?.en || labelFor(work, lang);
  };
  const spineKeywordFor = (work, lang = currentLanguage()) => {
    const keyword = mainKeywordFor(work, lang);
    return compactKeywordState && lang === "en" ? keyword.replace(/\s+/g, "\n") : keyword;
  };
  const fullLabelFor = (work, lang = currentLanguage()) => {
    const authoredTitle = work.type === "award" ? work.awardName : null;
    return authoredTitle?.[lang] || authoredTitle?.en || work.title?.[lang] || work.title?.en || labelFor(work, lang);
  };

  const controlLabel = (work, index, lang = currentLanguage()) => lang === "ko"
    ? `${typeLabelFor(work, lang)}, ${work.year}, ${fullLabelFor(work, lang)} 열기. ${index + 1}/${allWorks.length}`
    : `Open ${typeLabelFor(work, lang).toLowerCase()}, ${work.year}: ${fullLabelFor(work, lang)}. ${index + 1} of ${allWorks.length}`;

  const setCaption = (work) => {
    if (!caption || !work) return;
    const index = allWorks.findIndex((candidate) => candidate.slug === work.slug);
    const lang = currentLanguage();
    caption.textContent = `${typeLabelFor(work, lang)} · ${fullLabelFor(work, lang)} · ${mainKeywordFor(work, lang)} / ${work.year}`;
    caption.dataset.type = work.type;
    const stage = caption.closest(".pl-stage");
    const trigger = [...shelf.querySelectorAll(".pl-volume__trigger")]
      .find((book) => book.dataset.plBook === work.slug);
    if (stage && trigger) {
      const stageRect = stage.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const objectRect = trigger.querySelector(".pl-volume__object")?.getBoundingClientRect();
      const captionHeight = caption.getBoundingClientRect().height;
      const cardWidth = Math.min(470, Math.max(0, stageRect.width - 24));
      const halfCard = cardWidth / 2;
      const desired = triggerRect.left + (triggerRect.width / 2) - stageRect.left;
      const inset = Math.min(12, Math.max(0, (stageRect.width - cardWidth) / 2));
      const position = Math.min(
        stageRect.width - halfCard - inset,
        Math.max(halfCard + inset, desired)
      );
      const objectTop = objectRect ? objectRect.top - stageRect.top : captionHeight + 18;
      const captionTop = Math.max(
        0,
        Math.min(stageRect.height - captionHeight - 10, objectTop - captionHeight - 10)
      );
      const connector = Math.max(8, Math.min(180, objectTop - captionTop - captionHeight));
      // Keep all geometry reads above and all style writes below. Hover used to
      // invalidate layout midway through this block, forcing a second sync
      // layout before every caption appeared.
      stage.style.setProperty("--pl-caption-x", `${position}px`);
      stage.style.setProperty("--pl-caption-anchor-offset", `${desired - position}px`);
      stage.style.setProperty("--pl-caption-y", `${captionTop}px`);
      stage.style.setProperty("--pl-caption-connector", `${connector}px`);
      stage.style.setProperty("--pl-caption-connector-bottom", `${-connector}px`);
    }
    caption.classList.add("is-visible");
  };

  const clearCaption = () => {
    if (!caption) return;
    caption.textContent = "";
    delete caption.dataset.type;
    caption.classList.remove("is-visible");
    const stage = caption.closest(".pl-stage");
    [
      "--pl-caption-x",
      "--pl-caption-y",
      "--pl-caption-anchor-offset",
      "--pl-caption-connector",
      "--pl-caption-connector-bottom"
    ].forEach((property) => stage?.style.removeProperty(property));
  };

  const scheduleCaptionLayout = () => {
    if (captionLayoutFrame) return;
    captionLayoutFrame = window.requestAnimationFrame(() => {
      captionLayoutFrame = 0;
      const hovered = shelf.querySelector(".pl-volume__trigger:hover");
      const focused = captionModality === "keyboard" && document.activeElement?.matches?.(".pl-volume__trigger")
        ? document.activeElement
        : null;
      const trigger = hovered || focused;
      const work = allWorks.find((candidate) => candidate.slug === trigger?.dataset?.plBook);
      if (work) setCaption(work);
    });
  };

  const setTurningCoverLabels = (work, front = detail.querySelector(".pl-page-turn__front")) => {
    if (!work || !front) return;
    const lang = currentLanguage();
    front.dataset.coverTitle = labelFor(work, lang);
    front.dataset.coverMeta = `${lang === "ko" ? "채지훈" : "JIHUN CHAE"} · ${mainKeywordFor(work, lang)} · ${work.year}`;
  };

  const setStatus = (message) => {
    status.textContent = message || "";
  };

  const announceOpen = (work) => {
    const lang = currentLanguage();
    setStatus(lang === "ko"
      ? `${labelFor(work, lang)} 책을 펼쳤습니다.`
      : `${labelFor(work, lang)} is open.`);
  };

  const announceClosed = () => {
    const lang = currentLanguage();
    setStatus(lang === "ko" ? "책을 책장에 돌려놓았습니다." : "The volume was returned to the shelf.");
  };

  const buildBookFace = (work, inside = false) => {
    const face = create("span", inside ? "pl-volume__cover-inside" : "pl-volume__cover-face");
    const mark = create("span", "pl-volume__cover-mark pl-cover-mark", work.mark);
    const title = create("span", "pl-volume__cover-title pl-cover-title");
    appendPair(title, inside ? { en: work.mark, ko: work.mark } : work.shortTitle);
    const category = create("span", "pl-volume__cover-category pl-cover-category");
    appendPair(category, inside ? work.shortTitle : work.category);
    face.append(mark, title, category);
    return face;
  };

  const buildBook = (work, index) => {
    const binding = work.type === "project" ? "binder" : work.type === "publication" ? "journal" : "folio";
    const item = create(
      "li",
      `pl-volume pl-volume--${work.type}`
    );
    item.dataset.slug = work.slug;
    item.dataset.index = String(index);
    item.dataset.palette = work.palette;
    item.dataset.pattern = work.pattern;
    item.dataset.height = work.height;
    item.dataset.width = work.width;
    item.dataset.type = work.type;
    item.dataset.year = work.year;
    item.dataset.binding = binding;
    item.dataset.cover = work.slug;
    item.dataset.mainKeyword = mainKeywordFor(work);

    const trigger = create("button", "pl-volume__trigger");
    trigger.type = "button";
    trigger.dataset.plBook = work.slug;
    trigger.tabIndex = index === 0 ? 0 : -1;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", detail.id);
    trigger.setAttribute("aria-label", controlLabel(work, index));
    if (index === 0) trigger.setAttribute("aria-describedby", "plShelfHint");

    const object = create("span", "pl-volume__object");
    object.setAttribute("aria-hidden", "true");
    const back = create("span", "pl-volume__back-cover");
    const pages = create("span", "pl-volume__page-block");
    const cover = create("span", "pl-volume__front-cover");
    cover.append(buildBookFace(work, false), buildBookFace(work, true));

    const spine = create("span", "pl-volume__spine");
    spine.dataset.mainKeyword = mainKeywordFor(work);
    const spineMark = create("span", "pl-volume__spine-mark", spineKeywordFor(work));
    const spineMeta = create("span", "pl-volume__spine-meta", work.year);
    spine.append(spineMark, spineMeta);
    object.append(back, pages, cover, spine);
    trigger.append(object);

    const mount = create("div", "pl-volume__mount");
    item.append(trigger, mount);

    trigger.addEventListener("click", (event) => {
      const activation = event.detail === 0 ? "keyboard" : "pointer";
      captionModality = activation;
      handleShelfActivation(work, trigger, activation);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        trigger.click();
        return;
      }
      const triggers = [...shelf.querySelectorAll(".pl-volume__trigger")];
      const position = triggers.indexOf(trigger);
      const columns = Math.max(1, getComputedStyle(shelf).gridTemplateColumns.split(" ").filter(Boolean).length);
      let target = -1;
      if (event.key === "ArrowRight") target = Math.min(triggers.length - 1, position + 1);
      if (event.key === "ArrowLeft") target = Math.max(0, position - 1);
      if (event.key === "ArrowDown") target = Math.min(triggers.length - 1, position + columns);
      if (event.key === "ArrowUp") target = Math.max(0, position - columns);
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = triggers.length - 1;
      if (target >= 0 && target !== position) {
        event.preventDefault();
        triggers.forEach((book) => { book.tabIndex = -1; });
        triggers[target].tabIndex = 0;
        triggers[target].focus();
        triggers[target].scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "nearest", inline: "nearest" });
      }
    });

    trigger.addEventListener("focus", () => {
      shelf.querySelectorAll(".pl-volume__trigger").forEach((book) => { book.tabIndex = book === trigger ? 0 : -1; });
      if (captionModality === "keyboard" || trigger.matches(":hover")) {
        setCaption(work);
        syncShelfFocusProxy(trigger);
      } else {
        clearCaption();
        clearShelfFocusProxy();
      }
    });
    trigger.addEventListener("pointerenter", () => {
      captionModality = "pointer";
      clearShelfFocusProxy();
      setCaption(work);
    });
    trigger.addEventListener("blur", () => {
      clearCaption();
      clearShelfFocusProxy();
    });
    trigger.addEventListener("pointerleave", () => {
      const focusedWork = allWorks.find((candidate) => candidate.slug === document.activeElement?.dataset?.plBook);
      if (focusedWork && captionModality === "keyboard") setCaption(focusedWork);
      else clearCaption();
    });

    return item;
  };

  const updateScrollButtons = () => {
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    scrollButtons.forEach((button) => {
      const previous = button.dataset.plScroll === "previous";
      button.disabled = previous ? viewport.scrollLeft <= 2 : viewport.scrollLeft >= max - 2;
    });
  };

  const scheduleScrollButtons = () => {
    if (scrollUpdateFrame) return;
    scrollUpdateFrame = window.requestAnimationFrame(() => {
      scrollUpdateFrame = 0;
      updateScrollButtons();
    });
  };

  const renderShelf = () => {
    shelf.replaceChildren(...allWorks.map(buildBook));
    shelf.dataset.collection = "all";
    viewport.setAttribute("aria-label", "Chronological project, publication, and award bookcase");
    viewport.scrollLeft = 0;
    scheduleScrollButtons();
    window.dispatchEvent(new CustomEvent("site:layoutchange"));
    clearCaption();
  };

  const updateLocalizedLabels = () => {
    const lang = currentLanguage();
    shelf.querySelectorAll(".pl-volume__trigger").forEach((trigger, index) => {
      const work = allWorks.find((candidate) => candidate.slug === trigger.dataset.plBook);
      if (!work) return;
      trigger.setAttribute("aria-label", controlLabel(work, index, lang));
      const item = trigger.closest(".pl-volume");
      const spine = trigger.querySelector(".pl-volume__spine");
      const keyword = mainKeywordFor(work, lang);
      if (item) item.dataset.mainKeyword = keyword;
      if (spine) spine.dataset.mainKeyword = keyword;
      const spineMark = trigger.querySelector(".pl-volume__spine-mark");
      if (spineMark) spineMark.textContent = spineKeywordFor(work, lang);
    });
    viewport.setAttribute("aria-label", lang === "ko" ? "프로젝트·출판물·수상 연대기 책장" : "Chronological project, publication, and award bookcase");
    scrollButtons.forEach((button) => {
      const previous = button.dataset.plScroll === "previous";
      button.setAttribute("aria-label", lang === "ko"
        ? (previous ? "이전 책으로 스크롤" : "다음 책으로 스크롤")
        : (previous ? "Scroll to previous books" : "Scroll to next books"));
    });
    detail.querySelector('[data-pl-action="close"]')?.setAttribute("aria-label", lang === "ko" ? "책 닫기" : "Close book");
    detail.querySelector(".pl-detail__title")?.setAttribute(
      "aria-label",
      currentWork ? (currentWork.title[lang] || currentWork.title.en) : ""
    );
    detail.querySelector('[data-pl-action="previous"]')?.setAttribute("aria-label", currentWork
      ? (lang === "ko" ? `이전 ${typeLabelFor(currentWork, lang)}` : `Previous ${typeLabelFor(currentWork, lang).toLowerCase()}`)
      : (lang === "ko" ? "이전 작업" : "Previous work"));
    detail.querySelector('[data-pl-action="next"]')?.setAttribute("aria-label", currentWork
      ? (lang === "ko" ? `다음 ${typeLabelFor(currentWork, lang)}` : `Next ${typeLabelFor(currentWork, lang).toLowerCase()}`)
      : (lang === "ko" ? "다음 작업" : "Next work"));
    detail.querySelector(".pl-detail__page--right")?.setAttribute(
      "aria-label",
      lang === "ko" ? "작업 세부 정보 · 더 읽으려면 스크롤하세요" : "Work details · scroll for more"
    );
    const hoveredTrigger = shelf.querySelector(".pl-volume__trigger:hover");
    const captionTrigger = hoveredTrigger || (
      captionModality === "keyboard" && document.activeElement?.matches?.(".pl-volume__trigger")
        ? document.activeElement
        : null
    );
    const captionWork = allWorks.find((candidate) => candidate.slug === captionTrigger?.dataset?.plBook);
    if (captionWork) setCaption(captionWork);
    else clearCaption();
    if (currentWork) setTurningCoverLabels(currentWork);
  };

  const appendLink = (container, href, label, external = false) => {
    const link = create("a", "", label);
    link.href = href;
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    container.append(link);
    return link;
  };

  const makeVisualClone = (source, className) => {
    if (!source) return null;
    const clone = source.cloneNode(true);
    clone.classList.add(className);
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clone.querySelectorAll("a, button, [tabindex]").forEach((node) => {
      node.removeAttribute("href");
      node.tabIndex = -1;
    });
    return clone;
  };

  const clearShelfFocusProxy = () => {
    if (shelfFocusProxyFrame) window.cancelAnimationFrame(shelfFocusProxyFrame);
    shelfFocusProxyFrame = 0;
    shelfFocusProxyTrigger = null;
    shelfFocusProxy?.remove();
    shelfFocusProxy = null;
  };

  const positionShelfFocusProxy = () => {
    if (!shelfFocusProxy || !shelfFocusProxyTrigger) return;
    const object = shelfFocusProxyTrigger.querySelector(".pl-volume__object");
    const rect = snapshotRect(object);
    if (!rect) {
      clearShelfFocusProxy();
      return;
    }
    shelfFocusProxy.style.setProperty("--pl-focus-left", `${rect.left}px`);
    shelfFocusProxy.style.setProperty("--pl-focus-top", `${rect.top}px`);
    shelfFocusProxy.style.setProperty("--pl-focus-width", `${rect.width}px`);
    shelfFocusProxy.style.setProperty("--pl-focus-height", `${rect.height}px`);
  };

  const scheduleShelfFocusProxyLayout = () => {
    if (shelfFocusProxyFrame || !shelfFocusProxy) return;
    shelfFocusProxyFrame = window.requestAnimationFrame(() => {
      shelfFocusProxyFrame = 0;
      positionShelfFocusProxy();
    });
  };

  const syncShelfFocusProxy = (trigger) => {
    clearShelfFocusProxy();
    if (
      !currentWork
      || transitionPhase !== "open"
      || captionModality !== "keyboard"
      || readingDock.dataset.readerLayout !== "anchored"
      || !trigger?.matches?.(".pl-volume__trigger")
    ) return;

    const item = trigger.closest(".pl-volume");
    const object = trigger.querySelector(".pl-volume__object");
    const rect = snapshotRect(object);
    if (!item || !object || !rect) return;

    const proxy = create("span", `pl-volume pl-volume--${item.dataset.type || "publication"} pl-shelf-focus-proxy`);
    ["type", "palette", "pattern", "width", "height"].forEach((key) => {
      if (item.dataset[key]) proxy.dataset[key] = item.dataset[key];
    });
    proxy.setAttribute("aria-hidden", "true");
    proxy.setAttribute("inert", "");
    proxy.style.setProperty("--pl-focus-left", `${rect.left}px`);
    proxy.style.setProperty("--pl-focus-top", `${rect.top}px`);
    proxy.style.setProperty("--pl-focus-width", `${rect.width}px`);
    proxy.style.setProperty("--pl-focus-height", `${rect.height}px`);
    proxy.append(makeVisualClone(object, "pl-volume__object--focus-proxy"));
    root.append(proxy);
    shelfFocusProxy = proxy;
    shelfFocusProxyTrigger = trigger;
  };

  const collectionFor = (work) => work.type === "project"
    ? works.projects
    : work.type === "publication"
      ? works.publications
      : works.awards;

  const metaPartsFor = (work, lang) => String(work.meta?.[lang] || work.meta?.en || "")
    .split("|")
    .map(clean)
    .filter(Boolean);

  const recordHeaderFor = (work, lang) => {
    const parts = metaPartsFor(work, lang);
    const date = work.type === "publication" ? work.year : (parts[0] || work.year);
    const owner = lang === "ko" ? "채지훈" : "JIHUN CHAE";
    return `${owner} / ${mainKeywordFor(work, lang).toUpperCase()} / ${date}`;
  };

  const appendEditorialItem = (container, key, label, value) => {
    if (!value?.en && !value?.ko) return;
    const item = create("div", "pl-editorial__item");
    item.dataset.section = key;
    const term = create("dt", "pl-editorial__label");
    appendPair(term, label);
    const description = create("dd", "pl-editorial__claim");
    appendPair(description, value);
    item.append(term, description);
    container.append(item);
  };

  const projectEditorial = (work) => [
    ["official-program", { en: "Official program", ko: "공식 과제명" }, work.title],
    ["problem", { en: "The problem", ko: "문제" }, work.editorial?.problem || work.story?.research],
    ["responsibility", { en: "My responsibility", ko: "나의 책임" }, work.editorial?.responsibility],
    ["build", { en: "What we built", ko: "구축한 것" }, work.editorial?.build || work.story?.artifact],
    ["decision", { en: "Key decision", ko: "핵심 의사결정" }, work.editorial?.decision || work.story?.design],
    ["validation", { en: "Validation", ko: "검증" }, work.editorial?.validation || work.editorial?.evaluation],
    ["outcome-system", { en: "Outcome / System & delivery", ko: "성과 / 시스템·납품" }, work.editorial?.outcomeSystem],
    ["outcome-evidence", { en: "Outcome / Evidence & research", ko: "성과 / 근거·연구" }, work.editorial?.outcomeEvidence],
    ["outcome-value", { en: "Outcome / Collaboration & value", ko: "성과 / 협업·가치" }, work.editorial?.outcomeValue || work.editorial?.outcome],
    ["lesson", { en: "Core lesson", ko: "핵심 교훈" }, work.editorial?.lesson]
  ];

  const authorshipSummaryFor = (work) => {
    if (work.slug === "rag-enhanced-gaia") {
      return {
        en: "Jihun shared responsibility for building and evaluating the accessible AI chatbot.",
        ko: "채지훈이 접근성 AI 챗봇의 구축과 평가를 함께 책임졌습니다."
      };
    }
    if (work.slug === "gaia-service-framework") {
      return {
        en: "Jihun was one of the first three equal contributors to the AI assistant architecture.",
        ko: "채지훈이 AI 어시스턴트 아키텍처의 앞의 세 동등기여자 중 한 명으로 참여했습니다."
      };
    }
    const role = clean(work.role?.en).replace(/^\(|\)$/g, "").toLowerCase();
    const summaries = {
      "sole author": {
        en: "Jihun led and authored this work independently.",
        ko: "채지훈이 이 연구를 독립적으로 주도하고 집필했습니다."
      },
      "first author": {
        en: "Jihun led the research and writing as first author.",
        ko: "채지훈이 제1저자로 연구와 집필을 주도했습니다."
      },
      "second author": {
        en: "Jihun contributed to the research and writing as second author.",
        ko: "채지훈이 제2저자로 연구와 집필에 기여했습니다."
      },
      "co-first author": {
        en: "Jihun shared first-author responsibility for the research and writing.",
        ko: "채지훈이 공동 제1저자로 연구와 집필 책임을 함께 맡았습니다."
      },
      "equal-contribution co-author": {
        en: "Jihun shared equal responsibility for the research contribution.",
        ko: "채지훈이 동등기여 공저자로 연구 기여를 함께 책임졌습니다."
      },
      "second-listed author": {
        en: "Jihun contributed to the work as the second-listed author.",
        ko: "채지훈이 두 번째 기재 저자로 연구에 기여했습니다."
      },
      "corresponding author": {
        en: "Jihun served as corresponding author and contributed to the research.",
        ko: "채지훈이 교신저자로 연구에 기여했습니다."
      },
      "fourth author": {
        en: "Jihun contributed to the research and writing as fourth author.",
        ko: "채지훈이 제4저자로 연구와 집필에 기여했습니다."
      }
    };
    return summaries[role] || work.role;
  };

  const publicationEditorial = (work) => [
    ["jihun-role", { en: "Jihun's role", ko: "채지훈의 역할" }, authorshipSummaryFor(work)],
    ["question", { en: "Research question", ko: "연구 질문" }, work.editorial?.question],
    ["gap", { en: "Knowledge gap", ko: "지식 공백" }, work.editorial?.gap],
    ["contribution", { en: "Research contribution", ko: "연구 기여" }, work.editorial?.contribution],
    ["method", { en: "Method", ko: "방법" }, work.editorial?.method],
    ["takeaway", { en: "Central takeaway", ko: "핵심 메시지" }, work.editorial?.takeaway],
    ["finding-01", { en: "Finding 01", ko: "결과 01" }, work.editorial?.finding1],
    ["finding-02", { en: "Finding 02", ko: "결과 02" }, work.editorial?.finding2],
    ["finding-03", { en: "Finding 03", ko: "결과 03" }, work.editorial?.finding3 || work.editorial?.findings],
    ["implication", { en: "Implication", ko: "시사점" }, work.editorial?.implication || work.editorial?.implications],
    ["scope", { en: "Scope note", ko: "범위 주석" }, work.editorial?.scope]
  ];

  const awardClaimAt = (work, index) => {
    const en = work.descriptions?.en?.[index] || "";
    const ko = work.descriptions?.ko?.[index] || en;
    return en || ko ? { en, ko } : null;
  };

  const awardEditorial = (work) => {
    if (work.editorial?.verifiedResult) {
      return [
        ["result", { en: "Verified result", ko: "검증된 결과" }, work.editorial.verifiedResult],
        ["selection-context", { en: "Selection context", ko: "선발 맥락" }, work.editorial.selectionContext],
        ["challenge", { en: "The challenge", ko: "도전 과제" }, work.editorial.challenge],
        ["contribution", { en: "My contribution", ko: "나의 기여" }, work.editorial.contribution],
        ["criteria", { en: "What was evaluated", ko: "평가 항목" }, work.editorial.criteria],
        ["validates", { en: "What it validates", ko: "검증하는 역량" }, work.editorial.validates]
      ];
    }
    const hasExpandedEvidence = (work.descriptions?.en?.length || 0) > 1;
    return [
      ["result", { en: "Result", ko: "결과" }, work.title],
      ["selection-context", { en: "Selection context", ko: "선발 맥락" }, hasExpandedEvidence ? awardClaimAt(work, 0) : work.meta],
      ["criteria", { en: "Criteria", ko: "평가 기준" }, hasExpandedEvidence ? awardClaimAt(work, 1) : null],
      ["contribution", { en: "Contribution", ko: "기여" }, hasExpandedEvidence ? awardClaimAt(work, 2) : awardClaimAt(work, 0)],
      ["significance", { en: "Significance", ko: "의미" }, hasExpandedEvidence ? awardClaimAt(work, 3) : null]
    ];
  };

  const renderDetail = (work) => {
    detail.replaceChildren();
    detail.dataset.slug = work.slug;
    detail.dataset.cover = work.slug;
    detail.dataset.palette = work.palette;
    detail.dataset.type = work.type;

    const top = create("div", "pl-detail__top pl-detail__header");
    const headingGroup = create("div", "");
    const kicker = create("p", "pl-detail__kicker");
    appendPair(kicker, {
      en: recordHeaderFor(work, "en"),
      ko: recordHeaderFor(work, "ko")
    });
    const title = create("h3", "pl-detail__title");
    title.id = "work-detail-title";
    title.tabIndex = -1;
    const authoredTitle = work.type === "award" ? work.awardName : null;
    appendPair(title, authoredTitle || work.shortTitle || work.title);
    title.setAttribute("aria-label", fullLabelFor(work, currentLanguage()));
    headingGroup.append(kicker, title);
    let projectSubtitle = null;
    if (work.type === "project") {
      projectSubtitle = create("p", "pl-detail__subtitle");
      appendPair(projectSubtitle, work.subtitle || work.title);
    }

    const close = create("button", "pl-detail__close", "×");
    close.type = "button";
    close.dataset.plAction = "close";
    close.setAttribute("aria-label", currentLanguage() === "ko" ? "책 닫기" : "Close book");
    top.append(headingGroup, close);

    const meta = create("p", "pl-detail__meta");
    appendPair(meta, work.meta);
    const body = create("div", "pl-detail__body");
    body.append(meta);

    if (work.type === "project") {
      if (projectSubtitle) body.append(projectSubtitle);
      if (work.editorial?.question) {
        const question = create("blockquote", "pl-detail__question");
        const questionLabel = create("span", "pl-detail__question-label");
        appendPair(questionLabel, { en: "Core question", ko: "핵심 질문" });
        const questionText = create("p", "");
        appendPair(questionText, work.editorial.question);
        question.append(questionLabel, questionText);
        body.append(question);
      }
      const editorial = create("dl", "pl-editorial pl-editorial--project");
      projectEditorial(work).forEach(([key, label, value]) => appendEditorialItem(editorial, key, label, value));
      body.append(editorial);
    } else if (work.type === "publication") {
      const authored = publicationEditorial(work).filter(([, , value]) => value?.en || value?.ko);
      if (authored.length) {
        const editorial = create("dl", "pl-editorial pl-editorial--publication");
        authored.forEach(([key, label, value]) => appendEditorialItem(editorial, key, label, value));
        body.append(editorial);
      }
      const recordLabel = create("p", "pl-detail__section-label");
      appendPair(recordLabel, { en: "Full citation", ko: "전체 인용" });
      const enCitation = create("p", "pl-detail__citation", work.citation.en);
      enCitation.lang = "en";
      const koCitation = create("p", "pl-detail__citation", work.citation.ko || work.citation.en);
      koCitation.lang = "ko";
      body.append(recordLabel, enCitation, koCitation);
    } else {
      const result = create("dl", "pl-editorial pl-editorial--award");
      awardEditorial(work).forEach(([key, label, value]) => appendEditorialItem(result, key, label, value));
      body.append(result);
    }

    const partnerText = work.partners.en.length ? work.partners : null;
    let partnersNode = null;
    if (partnerText) {
      partnersNode = create("p", "pl-detail__partners");
      appendPair(partnersNode, {
        en: `With · ${partnerText.en.join(" · ")}`,
        ko: `협력 · ${(partnerText.ko.length ? partnerText.ko : partnerText.en).join(" · ")}`
      });
      body.append(partnersNode);
    }

    const actions = create("div", "pl-detail__actions");
    work.links.forEach((link) => appendLink(actions, link.href, link.label.includes("↗") ? link.label : `${link.label} ↗`, true));
    const cvLink = create("a", "");
    const cvUrl = new URL(window.location.href);
    cvUrl.searchParams.delete("work");
    cvUrl.searchParams.set("view", "cv");
    cvUrl.hash = work.sourceId;
    cvLink.href = cvUrl.href;
    cvLink.dataset.plAction = "view-cv";
    appendPair(cvLink, { en: "View in CV ↓", ko: "이력서에서 보기 ↓" });
    actions.append(cvLink);

    const nav = create("div", "pl-detail__nav");
    const previous = create("button", "");
    previous.type = "button";
    previous.dataset.plAction = "previous";
    previous.setAttribute("aria-label", currentLanguage() === "ko"
      ? `이전 ${typeLabelFor(work, "ko")}`
      : `Previous ${typeLabelFor(work, "en").toLowerCase()}`);
    appendPair(previous, { en: "← Previous", ko: "← 이전" });
    const next = create("button", "");
    next.type = "button";
    next.dataset.plAction = "next";
    next.setAttribute("aria-label", currentLanguage() === "ko"
      ? `다음 ${typeLabelFor(work, "ko")}`
      : `Next ${typeLabelFor(work, "en").toLowerCase()}`);
    appendPair(next, { en: "Next →", ko: "다음 →" });
    nav.append(previous, next);

    const spread = create("div", "pl-detail__spread");
    const leftPage = create("div", "pl-detail__page pl-detail__page--left");
    const rightPage = create("div", "pl-detail__page pl-detail__page--right");
    rightPage.tabIndex = 0;
    rightPage.setAttribute("role", "region");
    rightPage.setAttribute(
      "aria-label",
      currentLanguage() === "ko" ? "작업 세부 정보 · 더 읽으려면 스크롤하세요" : "Work details · scroll for more"
    );
    rightPage.addEventListener("keydown", (event) => {
      const scrollKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);
      if (!scrollKeys.has(event.key) || rightPage.scrollHeight <= rightPage.clientHeight + 1) return;
      const pageStep = Math.max(48, rightPage.clientHeight * 0.82);
      const target = event.key === "Home"
        ? 0
        : event.key === "End"
          ? rightPage.scrollHeight
          : rightPage.scrollTop + ({
            ArrowUp: -48,
            ArrowDown: 48,
            PageUp: -pageStep,
            PageDown: pageStep
          }[event.key] || 0);
      event.preventDefault();
      rightPage.scrollTo({ top: target, behavior: "auto" });
    });
    const collection = collectionFor(work);
    const pageIndex = collection.findIndex((candidate) => candidate.slug === work.slug);
    const leftFolio = create("span", "pl-detail__folio", work.spineVenue || work.mark);
    const rightFolio = create("span", "pl-detail__folio", `${String(pageIndex + 1).padStart(2, "0")} / ${collection.length}`);
    leftFolio.setAttribute("aria-hidden", "true");
    rightFolio.setAttribute("aria-hidden", "true");
    close.remove();
    leftPage.append(top);
    leftPage.append(leftFolio);
    rightPage.append(body, actions, nav, rightFolio);
    spread.append(leftPage, rightPage);

    const turningPage = create("span", "pl-page-turn");
    turningPage.setAttribute("aria-hidden", "true");
    const turningFront = create("span", "pl-page-turn__front");
    setTurningCoverLabels(work, turningFront);
    turningPage.append(turningFront, create("span", "pl-page-turn__back"));
    appendRigidEdges(turningPage);

    detail.append(close, spread, turningPage);
    detail.setAttribute("aria-labelledby", title.id);
  };

  const moveDetail = () => {
    if (!currentWork) {
      if (detail.parentElement !== readingDock) readingDock.append(detail);
      return;
    }
    const activeItem = shelf.querySelector(`.pl-volume[data-slug="${CSS.escape(currentWork.slug)}"]`);
    const destination = embeddedLayout || compactLayout.matches
      ? readingDock
      : activeItem?.querySelector(".pl-volume__mount");
    if (destination && detail.parentElement !== destination) destination.append(detail);
  };

  const setWorkUrl = (slug, mode = "replace") => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("work", slug);
    else url.searchParams.delete("work");
    history[mode === "push" ? "pushState" : "replaceState"]({ projectLibrary: Boolean(slug) }, "", url);
  };

  const syncDocumentView = (url = new URL(window.location.href)) => {
    document.documentElement.dataset.view = url.searchParams.get("view") === "cv" ? "cv" : "library";
  };

  const documentViewFor = (url = new URL(window.location.href)) => (
    url.searchParams.get("view") === "cv" ? "cv" : "library"
  );

  const isUnmodifiedPrimaryClick = (event) => Boolean(
    event
    && (event.button === undefined || event.button === 0)
    && !event.metaKey
    && !event.ctrlKey
    && !event.shiftKey
    && !event.altKey
  );

  const viewSurface = (view) => view === "cv"
    ? document.getElementById("cv-start")
    : root;

  const cvRiseTargets = () => [
    document.querySelector("#cv-start .mobile-nav"),
    document.querySelector("#cv-start .sidebar"),
    document.querySelector("#cv-start .caps"),
    ...document.querySelectorAll("#cv-start .content > .section, #cv-start .content > .site-footer")
  ].filter(Boolean);

  const clearCvRise = () => {
    document.documentElement.classList.remove("is-cv-entering");
    cvRiseTargets().forEach((target) => {
      target.removeAttribute("data-cv-rise");
      target.style.removeProperty("--cv-rise-index");
    });
  };

  const playCvRise = (epoch, signal) => {
    clearCvRise();
    if (motionDisabled() || signal.aborted || epoch !== viewTransitionEpoch) return;
    cvRiseTargets().forEach((target, index) => {
      target.setAttribute("data-cv-rise", "");
      target.style.setProperty("--cv-rise-index", String(index));
    });
    requestAnimationFrame(() => {
      if (signal.aborted || epoch !== viewTransitionEpoch || documentViewFor() !== "cv") return;
      document.documentElement.classList.add("is-cv-entering");
      window.setTimeout(() => {
        if (epoch === viewTransitionEpoch) clearCvRise();
      }, 1080);
    });
  };

  const cancelDocumentViewTransition = () => {
    viewTransitionController?.abort();
    viewTransitionController = null;
    activeNativeViewTransition?.skipTransition?.();
    activeNativeViewTransition = null;
    activeViewAnimations.forEach((animation) => animation?.cancel?.());
    activeViewAnimations = [];
    document.documentElement.classList.remove("is-view-transitioning");
    document.documentElement.removeAttribute("aria-busy");
    clearCvRise();
  };

  const focusDocumentViewTarget = async (url, view, epoch) => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (epoch !== viewTransitionEpoch || documentViewFor() !== view) return;
    const targetId = decodeURIComponent(url.hash.slice(1));
    let target = targetId ? document.getElementById(targetId) : null;
    if (!target || target.closest('[hidden], .hidden')) {
      target = view === "cv"
        ? document.getElementById("cv-start")
        : (currentTrigger?.isConnected ? currentTrigger : document.getElementById("site-title"));
    }
    if (!target) return;
    if (!target.matches('a, button, input, select, textarea, [tabindex]')) target.tabIndex = -1;
    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
    target.scrollIntoView({ behavior: "auto", block: view === "cv" ? "nearest" : "start", inline: "nearest" });
  };

  const animateViewSurface = async (surface, keyframes, options, signal) => {
    if (!surface || typeof surface.animate !== "function" || signal.aborted) return;
    const animation = surface.animate(keyframes, { ...options, fill: "both" });
    activeViewAnimations.push(animation);
    const abort = () => animation.cancel();
    signal.addEventListener("abort", abort, { once: true });
    try {
      await animation.finished.catch(() => undefined);
    } finally {
      signal.removeEventListener("abort", abort);
      activeViewAnimations = activeViewAnimations.filter((candidate) => candidate !== animation);
      animation.cancel();
    }
  };

  const transitionDocumentView = async (targetUrl, options = {}) => {
    const url = targetUrl instanceof URL ? targetUrl : new URL(targetUrl, window.location.href);
    const {
      historyMode = "push",
      focus = true
    } = options;
    const nextView = documentViewFor(url);
    const previousView = document.documentElement.dataset.view === "cv" ? "cv" : "library";
    cancelDocumentViewTransition();
    const epoch = ++viewTransitionEpoch;
    const controller = new AbortController();
    viewTransitionController = controller;
    const { signal } = controller;
    const commit = () => {
      if (signal.aborted || epoch !== viewTransitionEpoch) return;
      if (historyMode !== "none") {
        history[historyMode === "replace" ? "replaceState" : "pushState"](
          { view: nextView },
          "",
          url
        );
      }
      syncDocumentView(url);
      window.dispatchEvent(new CustomEvent("site:layoutchange"));
    };
    const finish = async () => {
      if (signal.aborted || epoch !== viewTransitionEpoch) return;
      document.documentElement.classList.remove("is-view-transitioning");
      document.documentElement.removeAttribute("aria-busy");
      if (viewTransitionController === controller) viewTransitionController = null;
      activeNativeViewTransition = null;
      activeViewAnimations = [];
      if (focus) await focusDocumentViewTarget(url, nextView, epoch);
      if (nextView === "cv" && previousView !== "cv") playCvRise(epoch, signal);
    };

    document.documentElement.classList.add("is-view-transitioning");
    document.documentElement.setAttribute("aria-busy", "true");

    if (previousView === nextView || motionDisabled()) {
      commit();
      await finish();
      return;
    }

    if (typeof document.startViewTransition === "function") {
      try {
        activeNativeViewTransition = document.startViewTransition(commit);
        await activeNativeViewTransition.finished.catch(() => undefined);
      } catch {
        commit();
      }
      await finish();
      return;
    }

    const outgoing = viewSurface(previousView);
    await animateViewSurface(outgoing, [
      { opacity: 1, transform: "translate3d(0,0,0)" },
      { opacity: 0, transform: previousView === "library" ? "translate3d(0,-10px,0)" : "translate3d(0,8px,0)" }
    ], {
      duration: 170,
      easing: "cubic-bezier(.4,0,.8,.2)"
    }, signal);
    if (signal.aborted || epoch !== viewTransitionEpoch) return;
    commit();
    const incoming = viewSurface(nextView);
    await animateViewSurface(incoming, [
      { opacity: 0, transform: nextView === "cv" ? "translate3d(0,14px,0)" : "translate3d(0,-8px,0)" },
      { opacity: 1, transform: "translate3d(0,0,0)" }
    ], {
      duration: 300,
      easing: "cubic-bezier(.2,.8,.2,1)"
    }, signal);
    await finish();
  };

  const busyPhases = new Set([
    "preparing-open",
    "extracting",
    "arriving",
    "opening",
    "flicking",
    "turning-forward",
    "turning-backward",
    "closing",
    "closing-cover",
    "returning"
  ]);

  const closingPhases = new Set(["closing", "closing-cover", "returning"]);

  const motionDisabled = () => reducedMotion.matches || forcedColors.matches;

  const setTransitionPhase = (phase) => {
    transitionPhase = phase;
    readingDock.dataset.state = phase;
    root.dataset.motionState = phase;
    const isBusy = busyPhases.has(phase);
    root.classList.toggle("is-book-transitioning", isBusy);
    root.classList.toggle("is-book-open", phase === "open");

    // The reader is positioned over part of the shelf before the extraction
    // and page-turn sequence has committed. While it is moving, letting that
    // visual layer receive pointer hits makes rapid spine selections land on
    // the reader instead, so the latest-intent queue never sees them. Keep the
    // moving reader click-through; restore its controls as soon as it is open.
    readingDock.style.pointerEvents = isBusy ? "none" : "";
  };

  const ANCHORED_READER_MIN_WIDTH = 840;
  const ANCHORED_READER_MIN_AVAILABLE_HEIGHT = 560;
  const anchorStyleProperties = [
    "--pl-anchor-x",
    "--pl-anchor-y",
    "--pl-anchor-row-top",
    "--pl-anchor-row-bottom",
    "--pl-dock-origin-x",
    "--pl-dock-origin-y",
    "--pl-reader-left",
    "--pl-reader-top",
    "--pl-reader-width",
    "--pl-reader-height"
  ];

  const setAnchorProperty = (property, value) => {
    [root, readingDock].forEach((node) => {
      if (node.style.getPropertyValue(property) !== value) {
        node.style.setProperty(property, value);
      }
    });
  };

  const readerUsesAnchoredLayout = () => Boolean(
    root.dataset.readerLayout === "anchored"
    && (shell?.getBoundingClientRect().width || 0) >= ANCHORED_READER_MIN_WIDTH
    && window.innerHeight - 32 >= ANCHORED_READER_MIN_AVAILABLE_HEIGHT
  );

  const clearReaderAnchor = () => {
    if (anchorUpdateFrame) {
      cancelAnimationFrame(anchorUpdateFrame);
      anchorUpdateFrame = 0;
    }
    anchorRefreshPending = false;
    [root, readingDock].forEach((node) => {
      delete node.dataset.readerLayout;
      delete node.dataset.anchorSide;
      delete node.dataset.anchorSlug;
      delete node.dataset.anchorType;
      delete node.dataset.readerPlacement;
      anchorStyleProperties.forEach((property) => node.style.removeProperty(property));
    });
    root.classList.remove("is-reader-anchored");
    shelf.querySelectorAll(".pl-volume.is-anchor-source")
      .forEach((item) => item.classList.remove("is-anchor-source"));
    readerAnchorTrigger = null;
  };

  const setReaderAnchorSource = (work, sourceItem) => {
    shelf.querySelectorAll(".pl-volume.is-anchor-source")
      .forEach((item) => item.classList.toggle("is-anchor-source", item === sourceItem));
    sourceItem?.classList.add("is-anchor-source");
    [root, readingDock].forEach((node) => {
      if (work?.slug) node.dataset.anchorSlug = work.slug;
      if (work?.type) node.dataset.anchorType = work.type;
    });
  };

  const configureReaderAnchor = (work, sourceRect, sourceItem, options = {}) => {
    const rootRect = snapshotRect(root);
    const shellRect = snapshotRect(shell) || rootRect;
    const stageRect = snapshotRect(stage) || shellRect;
    const shelfRect = snapshotRect(shelf) || stageRect;
    const rowRect = snapshotRect(sourceItem) || sourceRect;
    const valid = Boolean(rootRect && shellRect && sourceRect && rowRect);
    const viewportInset = 16;
    const shellInset = 10;
    const availableHeight = Math.max(1, window.innerHeight - (viewportInset * 2));
    const availableWidth = Math.max(1, Math.min(
      Math.max(1, (shellRect?.width || 1) - (shellInset * 2)),
      window.innerWidth - (viewportInset * 2)
    ));
    const candidateWidth = Math.min(
      920,
      Math.max(860, availableWidth * 0.96),
      availableWidth
    );
    const candidateHeight = Math.min(
      500,
      Math.max(440, window.innerHeight * 0.64),
      availableHeight
    );
    const compositionBottom = valid
      ? Math.min(shellRect.height - shellInset, shelfRect.bottom - shellRect.top)
      : 0;
    const preferredTop = compositionBottom - candidateHeight - shellInset;
    const minimumTop = valid
      ? Math.max(shellInset, viewportInset - shellRect.top)
      : 0;
    const maximumTop = valid
      ? Math.min(
        shellRect.height - candidateHeight + 96,
        window.innerHeight - viewportInset - candidateHeight - shellRect.top
      )
      : -1;
    const anchored = valid
      && shellRect.width >= ANCHORED_READER_MIN_WIDTH
      && availableHeight >= ANCHORED_READER_MIN_AVAILABLE_HEIGHT
      && maximumTop >= minimumTop;
    const layout = anchored ? "anchored" : "stacked";

    if (!options.preserveSource) setReaderAnchorSource(work, sourceItem);

    [root, readingDock].forEach((node) => {
      node.dataset.readerLayout = layout;
      node.dataset.readerPlacement = anchored ? "low" : "flow";
    });
    root.classList.toggle("is-reader-anchored", anchored);

    if (!valid) {
      [root, readingDock].forEach((node) => { node.dataset.anchorSide = "center"; });
      return;
    }

    const sourceCenterX = sourceRect.left + (sourceRect.width / 2);
    const sourceCenterY = sourceRect.top + (sourceRect.height / 2);
    const readerWidth = anchored
      ? candidateWidth
      : availableWidth;
    const readerHeight = anchored
      ? candidateHeight
      : Math.min(520, availableHeight);
    const maximumLeft = Math.max(shellInset, shellRect.width - readerWidth - shellInset);
    const readerLeft = Math.min(
      Math.max(shellInset, sourceCenterX - shellRect.left - (readerWidth / 2)),
      maximumLeft
    );
    const readerTop = anchored
      ? Math.min(Math.max(minimumTop, preferredTop), maximumTop)
      : 0;
    const px = (value) => `${Math.round(value * 100) / 100}px`;

    setAnchorProperty("--pl-anchor-x", px(sourceCenterX - rootRect.left));
    setAnchorProperty("--pl-anchor-y", px(sourceCenterY - rootRect.top));
    setAnchorProperty("--pl-anchor-row-top", px(rowRect.top - rootRect.top));
    setAnchorProperty("--pl-anchor-row-bottom", px(rowRect.bottom - rootRect.top));
    setAnchorProperty("--pl-dock-origin-x", px(sourceCenterX - shellRect.left));
    setAnchorProperty("--pl-dock-origin-y", px(sourceCenterY - shellRect.top));
    setAnchorProperty("--pl-reader-left", px(readerLeft));
    setAnchorProperty("--pl-reader-top", px(readerTop));
    setAnchorProperty("--pl-reader-width", px(readerWidth));
    setAnchorProperty("--pl-reader-height", px(readerHeight));
    [root, readingDock].forEach((node) => { node.dataset.anchorSide = anchored ? "low" : "center"; });
  };

  const scheduleReaderAnchor = () => {
    if (anchorUpdateFrame || !currentWork || !currentTrigger) return;
    if (transitionIsBusy()) {
      anchorRefreshPending = true;
      return;
    }
    anchorRefreshPending = false;
    anchorUpdateFrame = requestAnimationFrame(() => {
      anchorUpdateFrame = 0;
      if (!currentWork || !currentTrigger) return;
      if (transitionIsBusy()) {
        anchorRefreshPending = true;
        return;
      }
      const anchorTrigger = readerAnchorTrigger?.isConnected
        ? readerAnchorTrigger
        : currentTrigger;
      const sourceRect = snapshotRect(anchorTrigger.querySelector(".pl-volume__spine"));
      const previousLayout = readingDock.dataset.readerLayout;
      const focusedReaderTarget = detail.contains(document.activeElement)
        ? document.activeElement
        : null;
      configureReaderAnchor(
        currentWork,
        sourceRect,
        anchorTrigger.closest(".pl-volume"),
        { preserveSource: true }
      );
      const nextLayout = readingDock.dataset.readerLayout;
      if (focusedReaderTarget && previousLayout !== nextLayout) {
        requestAnimationFrame(() => {
          if (!focusedReaderTarget.isConnected || readingDock.dataset.readerLayout !== nextLayout) return;
          const focusedRect = snapshotRect(focusedReaderTarget);
          if (!focusedRect) return;
          if (focusedRect.top < 0 || focusedRect.bottom > window.innerHeight) {
            focusedReaderTarget.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
          }
        });
      }
    });
  };

  const releaseReadingDockHeight = () => {
    heldDockHeight = 0;
    readingDock.style.removeProperty("height");
    readingDock.style.removeProperty("min-height");
  };

  const holdReadingDockHeight = () => {
    const dockRect = readingDock.getBoundingClientRect();
    const detailRect = detail.getBoundingClientRect();
    const spreadRect = detail.querySelector(".pl-detail__spread")?.getBoundingClientRect();
    heldDockHeight = Math.ceil(Math.max(
      dockRect.height || 0,
      detailRect.height || 0,
      spreadRect?.height || 0
    ));
    if (heldDockHeight > 0) {
      const value = `${heldDockHeight}px`;
      readingDock.style.height = value;
      readingDock.style.minHeight = value;
    }
    return heldDockHeight;
  };

  const clearOpeningTurnBounds = () => {
    if (!boundedOpeningTurn) return;
    ["top", "right", "bottom", "left", "width", "height"].forEach((property) => {
      boundedOpeningTurn.style.removeProperty(property);
    });
    boundedOpeningTurn = null;
  };

  const closedCoverRect = (spreadRect, coverPanelRect = null) => {
    if (!spreadRect || spreadRect.width <= 0 || spreadRect.height <= 0) return null;
    const anchored = readingDock.dataset.readerLayout === "anchored";
    const panelIsUsable = coverPanelRect
      && coverPanelRect.width > 0
      && coverPanelRect.height > 0;
    // In a two-page spread the closed board lives on the right of the gutter.
    // Keeping this as the single cover rectangle makes the shelf flight, open
    // hinge, close hinge, and return flight share one rigid piece of geometry.
    const gutter = panelIsUsable
      ? Math.min(spreadRect.right, Math.max(spreadRect.left, coverPanelRect.right))
      : spreadRect.left;
    const rightLeafWidth = Math.max(0, spreadRect.right - gutter);
    const basis = anchored && panelIsUsable && rightLeafWidth > 0
      ? {
        top: coverPanelRect.top,
        right: gutter + Math.min(coverPanelRect.width, rightLeafWidth),
        bottom: coverPanelRect.top + coverPanelRect.height,
        left: gutter,
        width: Math.min(coverPanelRect.width, rightLeafWidth),
        height: coverPanelRect.height
      }
      : spreadRect;
    const compact = !anchored || root.getBoundingClientRect().width < 720;
    const inset = compact ? 10 : 12;
    const maxWidth = Math.max(1, window.innerWidth - (inset * 2));
    const width = Math.min(basis.width, maxWidth);
    const centeredLeft = basis.left + ((basis.width - width) / 2);
    const left = Math.min(
      Math.max(inset, centeredLeft),
      Math.max(inset, window.innerWidth - width - inset)
    );
    const top = Math.min(
      Math.max(inset, basis.top),
      Math.max(inset, window.innerHeight - inset - 1)
    );
    const availableHeight = Math.max(1, window.innerHeight - top - inset);
    const height = Math.min(basis.height, availableHeight);
    return {
      top,
      right: left + width,
      bottom: top + height,
      left,
      width,
      height
    };
  };

  const applyOpeningTurnBounds = (pageTurn, coverRect, spreadRect) => {
    clearOpeningTurnBounds();
    if (!pageTurn || !coverRect || !spreadRect) return;
    const left = Math.max(0, coverRect.left - spreadRect.left);
    const top = Math.max(0, coverRect.top - spreadRect.top);
    [
      ["top", `${top}px`],
      ["right", "auto"],
      ["bottom", "auto"],
      ["left", `${left}px`],
      ["width", `${coverRect.width}px`],
      ["height", `${coverRect.height}px`]
    ].forEach(([property, value]) => pageTurn.style.setProperty(property, value, "important"));
    boundedOpeningTurn = pageTurn;
  };

  const transitionIsBusy = () => busyPhases.has(transitionPhase);

  const removeTransientVisualLayers = () => {
    clearShelfFocusProxy();
    root.querySelectorAll(
      ".pl-page-fan, .pl-detail__spread--ghost, .pl-closing-spread"
    ).forEach((node) => node.remove());
    document.body.querySelectorAll(
      `.pl-flight-cover[data-pl-owner="${CSS.escape(root.id)}"]`
    ).forEach((node) => node.remove());
    activeFlightCover = null;
    activePageFan = null;
  };

  const clearMotionArtifacts = () => {
    root.classList.remove("is-extracting", "is-returning", "is-local-extracting", "is-local-closing");
    delete readingDock.dataset.motion;
    detail.querySelector(".pl-page-turn")?.removeAttribute("data-motion");
    shelf.querySelectorAll(".is-local-extracting, .is-local-closing").forEach((item) => {
      item.classList.remove("is-local-extracting", "is-local-closing");
    });
    if (activeFlightCover) {
      activeFlightCover.getAnimations?.()?.forEach((animation) => animation.cancel());
      activeFlightCover.remove();
      activeFlightCover = null;
    }
    if (activePageFan) {
      activePageFan.getAnimations?.({ subtree: true })?.forEach((animation) => animation.cancel());
      activePageFan.remove();
      activePageFan = null;
    }
    removeTransientVisualLayers();
  };

  const beginVisualTransition = () => {
    transitionController?.abort();
    clearMotionArtifacts();
    clearOpeningTurnBounds();
    releaseReadingDockHeight();
    transitionController = new AbortController();
    return { epoch: ++transitionEpoch, signal: transitionController.signal };
  };

  const transitionIsCurrent = (token) => Boolean(
    token
    && token.epoch === transitionEpoch
    && !token.signal.aborted
  );

  const completeVisualTransition = (token) => {
    if (!transitionIsCurrent(token)) return;
    transitionController = null;
  };

  const waitForFrame = (token) => new Promise((resolve) => {
    if (!transitionIsCurrent(token)) {
      resolve(false);
      return;
    }
    let settled = false;
    const fallback = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cancelAnimationFrame(frame);
      resolve(transitionIsCurrent(token));
    }, 48);
    const frame = requestAnimationFrame(() => {
      if (settled) return;
      settled = true;
      clearTimeout(fallback);
      resolve(transitionIsCurrent(token));
    });
    token.signal.addEventListener("abort", () => {
      if (settled) return;
      settled = true;
      clearTimeout(fallback);
      cancelAnimationFrame(frame);
      resolve(false);
    }, { once: true });
  });

  const waitForVisual = async (node, token, timeout = 760, subtree = false) => {
    if (!node || motionDisabled()) return transitionIsCurrent(token);
    if (!await waitForFrame(token)) return false;
    void node.offsetWidth;
    let animations = [];
    if (typeof node.getAnimations === "function") {
      try {
        animations = node.getAnimations(subtree ? { subtree: true } : undefined)
          .filter((animation) => animation.playState !== "finished");
      } catch {
        animations = node.getAnimations()
          .filter((animation) => animation.playState !== "finished");
      }
    }
    if (!animations.length) return transitionIsCurrent(token);

    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value && transitionIsCurrent(token));
      };
      const timer = window.setTimeout(() => finish(true), timeout);
      token.signal.addEventListener("abort", () => finish(false), { once: true });
      Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)))
        .then(() => finish(true));
    });
  };

  const runWaapi = async (
    node,
    keyframes,
    options,
    token,
    timeout,
    interruptOnViewportChange = false
  ) => {
    if (!node || typeof node.animate !== "function" || motionDisabled()) {
      return transitionIsCurrent(token);
    }
    const finalFrame = keyframes[keyframes.length - 1] || {};
    let animation = null;
    let timer = 0;
    let viewportChanged = false;
    let resolveViewportChange = null;
    const applyFinalFrame = () => {
      ["opacity", "transform"].forEach((property) => {
        if (finalFrame[property] !== undefined) node.style[property] = String(finalFrame[property]);
      });
    };
    const abortAnimation = () => animation?.cancel();
    const handleViewportChange = () => {
      viewportChanged = true;
      animation?.cancel();
      resolveViewportChange?.();
    };
    try {
      animation = node.animate(keyframes, { ...options, fill: "forwards" });
      token.signal.addEventListener("abort", abortAnimation, { once: true });
      if (interruptOnViewportChange) {
        window.addEventListener("scroll", handleViewportChange, { passive: true, capture: true });
        window.addEventListener("resize", handleViewportChange, { passive: true });
      }
      await Promise.race([
        animation.finished.catch(() => undefined),
        new Promise((resolve) => {
          timer = window.setTimeout(resolve, timeout);
        }),
        new Promise((resolve) => { resolveViewportChange = resolve; })
      ]);
      if (!transitionIsCurrent(token)) return false;
      if (viewportChanged) return true;
      applyFinalFrame();
      animation.cancel();
      return true;
    } catch {
      if (!transitionIsCurrent(token)) return false;
      applyFinalFrame();
      return true;
    } finally {
      clearTimeout(timer);
      token.signal.removeEventListener("abort", abortAnimation);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    }
  };

  const runTransientWaapi = async (node, keyframes, options, token, timeout) => {
    if (!node || typeof node.animate !== "function" || motionDisabled()) {
      return transitionIsCurrent(token);
    }
    let animation = null;
    let timer = 0;
    const abortAnimation = () => animation?.cancel();
    try {
      animation = node.animate(keyframes, { ...options, fill: "both" });
      token.signal.addEventListener("abort", abortAnimation, { once: true });
      await Promise.race([
        animation.finished.catch(() => undefined),
        new Promise((resolve) => { timer = window.setTimeout(resolve, timeout); })
      ]);
      return transitionIsCurrent(token);
    } catch {
      return transitionIsCurrent(token);
    } finally {
      clearTimeout(timer);
      token.signal.removeEventListener("abort", abortAnimation);
      animation?.cancel();
    }
  };

  const animateStackedSourceLift = async (trigger, item, token) => {
    root.classList.add("is-local-extracting");
    item?.classList.add("is-local-extracting");
    try {
      return await runTransientWaapi(trigger, [
        { transform: "translateY(0)" },
        { offset: 0.72, transform: "translateY(-7px)" },
        { transform: "translateY(-6px)" }
      ], {
        duration: 140,
        easing: "cubic-bezier(.22,.72,.24,1)"
      }, token, 190);
    } finally {
      root.classList.remove("is-local-extracting");
      item?.classList.remove("is-local-extracting");
    }
  };

  const syncQueuedIntentState = () => {
    shelf.querySelectorAll(".is-pending-selection, .is-pending-close").forEach((item) => {
      item.classList.remove("is-pending-selection", "is-pending-close");
    });
    delete root.dataset.pendingAction;
    delete root.dataset.pendingSlug;
    if (!queuedIntent) return;

    const slug = queuedIntent.slug || queuedIntent.work?.slug || currentWork?.slug;
    const action = queuedIntent.kind === "open" ? "select" : "close";
    if (!slug) return;
    root.dataset.pendingAction = action;
    root.dataset.pendingSlug = slug;
    const item = shelf.querySelector(`.pl-volume[data-slug="${CSS.escape(slug)}"]`);
    item?.classList.add(action === "select" ? "is-pending-selection" : "is-pending-close");
  };

  const clearQueuedIntent = () => {
    queuedIntent = null;
    syncQueuedIntentState();
  };

  const queueTransitionIntent = (intent) => {
    queuedIntent = {
      ...intent,
      slug: intent.work?.slug || intent.slug || currentWork?.slug || ""
    };
    syncQueuedIntentState();
  };

  const drainQueuedIntent = () => {
    if (
      drainingQueuedIntent
      || !queuedIntent
      || transitionIsBusy()
      || historyClosePending
    ) return;

    // Drain in the same turn that commits the preceding transition. Deferring
    // this to a microtask allowed a newer click to start before an older queued
    // click replayed, so the stale click could win afterward.
    const intent = queuedIntent;
    clearQueuedIntent();
    drainingQueuedIntent = true;
    try {
      if (intent.kind === "open") openWork(intent.work, intent.options);
      if (intent.kind === "close") requestClose(intent.options);
      if (intent.kind === "close-visual") closeWork(intent.options);
    } finally {
      drainingQueuedIntent = false;
      if (queuedIntent && !transitionIsBusy() && !historyClosePending) {
        drainQueuedIntent();
      }
    }
  };

  const handleShelfActivation = (work, trigger, activation) => {
    const openOptions = {
      historyMode: "auto",
      focus: true,
      focusMode: "title",
      activation,
      sourceRect: snapshotRect(trigger.querySelector(".pl-volume__spine"))
    };
    const currentIsTarget = currentWork?.slug === work.slug;
    const pendingOpenIsTarget = queuedIntent?.kind === "open"
      && queuedIntent.work?.slug === work.slug;
    const pendingCloseIsTarget = queuedIntent
      && queuedIntent.kind !== "open"
      && queuedIntent.slug === work.slug;

    if (transitionIsBusy() || historyClosePending) {
      if (pendingOpenIsTarget) {
        // Repeating a selection is idempotent: A -> B -> B must still finish
        // on B. The only repeat that acts as a cancellation is a queued
        // reopen of the current book while that same book is closing.
        if (currentIsTarget && closingPhases.has(transitionPhase)) {
          clearQueuedIntent();
        }
        return;
      }
      if (currentIsTarget && closingPhases.has(transitionPhase)) {
        openWork(work, openOptions);
        return;
      }
      if (currentIsTarget) {
        if (pendingCloseIsTarget) {
          clearQueuedIntent();
          return;
        }
        requestClose({ activation });
        return;
      }
      openWork(work, openOptions);
      return;
    }

    if (currentIsTarget) requestClose({ activation });
    else openWork(work, openOptions);
  };

  const focusReaderTarget = (mode = "title") => {
    const selector = mode === "previous" || mode === "next"
      ? `[data-pl-action="${mode}"]`
      : ".pl-detail__title";
    const target = detail.querySelector(selector) || detail;
    try {
      target.focus({ preventScroll: true });
      if (embeddedLayout && !readerUsesAnchoredLayout()) {
        const expectedSlug = currentWork?.slug;
        const alignCompactReader = () => {
          if (!currentWork || currentWork.slug !== expectedSlug || detail.hidden || readerUsesAnchoredLayout()) return;
          const detailTop = detail.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, detailTop - 12), behavior: "auto" });
        };
        alignCompactReader();
        requestAnimationFrame(() => requestAnimationFrame(alignCompactReader));
      }
    } catch {
      detail.focus({ preventScroll: true });
    }
  };

  const makeFlightCover = (work, targetRect) => {
    const flight = create("div", `pl-flight-cover pl-palette-${work.palette || "ink"}`);
    flight.dataset.plOwner = root.id;
    flight.dataset.type = work.type;
    flight.dataset.palette = work.palette || "ink";
    flight.dataset.cover = work.slug;
    flight.setAttribute("aria-hidden", "true");
    flight.setAttribute("inert", "");
    const lang = currentLanguage();
    const meta = create(
      "span",
      "pl-flight-cover__meta",
      `${lang === "ko" ? "채지훈" : "JIHUN CHAE"} / ${mainKeywordFor(work, lang)} / ${work.year}`
    );
    const title = create("span", "pl-flight-cover__title", labelFor(work, lang));
    const front = create("span", "pl-flight-cover__frontface");
    const back = create("span", "pl-flight-cover__backface");
    flight.append(front, back);
    appendRigidEdges(flight);
    flight.append(meta, title);
    Object.assign(flight.style, {
      position: "fixed",
      zIndex: "2147482000",
      top: `${targetRect.top}px`,
      left: `${targetRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      margin: "0",
      pointerEvents: "none",
      transformOrigin: "top left",
      willChange: "transform, opacity"
    });
    return flight;
  };

  const usableFlightRect = (rect) => Boolean(
    rect
    && rect.width > 0
    && rect.height > 0
    && Number.isFinite(rect.top)
    && Number.isFinite(rect.left)
  );

  const flightMotionProfile = () => {
    const compact = readingDock.dataset.readerLayout !== "anchored"
      || root.getBoundingClientRect().width < 840;
    return compact
      ? {
        compact: true,
        pull: 8,
        extracting: 55,
        arriving: 150,
        hinge: 260,
        leaves: 2,
        flickDuration: 90,
        flickStagger: 18,
        closing: 130,
        returning: 150,
        extractingEasing: "cubic-bezier(0.32, 0.72, 0, 1)",
        travelEasing: "cubic-bezier(0.32, 0.72, 0, 1)",
        hingeEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
        flickEasing: "cubic-bezier(0.32, 0.02, 0.2, 1)",
        returningEasing: "cubic-bezier(0.32, 0.72, 0, 1)"
      }
      : {
        compact: false,
        pull: 12,
        extracting: 65,
        arriving: 190,
        hinge: 300,
        leaves: 2,
        flickDuration: 105,
        flickStagger: 22,
        closing: 180,
        returning: 190,
        extractingEasing: "cubic-bezier(0.32, 0.72, 0, 1)",
        travelEasing: "cubic-bezier(0.32, 0.72, 0, 1)",
        hingeEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
        flickEasing: "cubic-bezier(0.32, 0.02, 0.2, 1)",
        returningEasing: "cubic-bezier(0.32, 0.72, 0, 1)"
      };
  };

  const rigidCoverTransform = (
    x = 0,
    y = 0,
    z = 0,
    uniformScale = 1,
    rotationY = 0,
    rotationZ = 0,
    rotationX = 0
  ) => [
    `translate3d(${x}px, ${y}px, ${z}px)`,
    "perspective(1600px)",
    `rotateZ(${rotationZ}deg)`,
    `rotateX(${rotationX}deg)`,
    `rotateY(${rotationY}deg)`,
    `scale(${uniformScale})`
  ].join(" ");

  // One measured hinge path drives both directions. Reversing these poses
  // gives closing the exact inverse geometry and timing of opening instead of
  // handing the cover between unrelated animations.
  const rigidHingePoses = Object.freeze([
    Object.freeze({ offset: 0, angle: 0 }),
    Object.freeze({ offset: 0.17, angle: -19 }),
    Object.freeze({ offset: 0.43, angle: -68 }),
    Object.freeze({ offset: 0.67, angle: -119 }),
    Object.freeze({ offset: 0.84, angle: -157 }),
    Object.freeze({ offset: 1, angle: -179 })
  ]);

  const rigidHingeKeyframes = (closing = false) => {
    const poses = closing ? [...rigidHingePoses].reverse() : rigidHingePoses;
    return poses.map((pose) => ({
      offset: closing ? 1 - pose.offset : pose.offset,
      // A rigid board never loses mass at the hinge. Its real front and back
      // faces already handle visibility, so fading near 180deg caused the
      // opening/closing silhouette to break instead of reading as one object.
      opacity: 1,
      "--pl-cover-print-opacity": pose.angle <= -90 ? "0" : "1",
      transform: rigidCoverTransform(0, 0, 0, 1, pose.angle)
    }));
  };

  const edgeOnFlightGeometry = (sourceRect, targetRect, pullDistance) => {
    const scale = Math.max(0.01, sourceRect.height / targetRect.height);
    const projectedRatio = sourceRect.width / Math.max(1, targetRect.width * scale);
    const cosine = Math.min(1, Math.max(0.025, projectedRatio));
    const measuredAngle = Math.acos(cosine) * (180 / Math.PI);
    const minimumAngle = 76;
    const unsignedAngle = Math.min(88, Math.max(minimumAngle, measuredAngle));
    const direction = sourceRect.left + (sourceRect.width / 2) < targetRect.left + (targetRect.width / 2)
      ? -1
      : 1;
    const angle = unsignedAngle * direction;
    const translateX = sourceRect.left - targetRect.left;
    const translateY = sourceRect.top - targetRect.top;
    const toward = (value, progress) => value * (1 - progress);
    const grown = (progress) => scale + ((1 - scale) * progress);
    return {
      source: rigidCoverTransform(translateX, translateY, 0, scale, angle),
      lift: rigidCoverTransform(
        toward(translateX, 0.025),
        translateY - pullDistance,
        30,
        scale * 1.03,
        angle - (direction * 3),
        direction * -0.45,
        -1.4
      ),
      travel: rigidCoverTransform(
        toward(translateX, 0.68),
        toward(translateY, 0.68) - (pullDistance * 0.45),
        46,
        grown(0.68),
        angle * 0.74,
        direction * -0.3,
        -0.8
      ),
      approach: rigidCoverTransform(
        toward(translateX, 0.94),
        toward(translateY, 0.94),
        14,
        grown(0.96),
        angle * 0.18,
        direction * -0.08,
        -0.2
      ),
      target: rigidCoverTransform()
    };
  };

  const canAnimateFlight = (sourceRect, targetRect) => Boolean(
    !motionDisabled()
    && typeof Element.prototype.animate === "function"
    && root.getBoundingClientRect().width >= 280
    && usableFlightRect(sourceRect)
    && usableFlightRect(targetRect)
    && targetRect.width >= 180
    && targetRect.height >= 180
    && targetRect.left >= -1
    && targetRect.top >= -1
    && targetRect.right <= window.innerWidth + 1
    && targetRect.bottom <= window.innerHeight + 1
    && sourceRect.bottom > 0
    && sourceRect.top < window.innerHeight
  );

  const canUseFlight = (sourceRect, targetRect, historyMode) => Boolean(
    historyMode === "push" && canAnimateFlight(sourceRect, targetRect)
  );

  const canStartPointerFlight = (sourceRect, historyMode, activation) => Boolean(
    activation === "pointer"
    && historyMode === "push"
    && readingDock.dataset.readerLayout === "anchored"
    && !motionDisabled()
    && typeof Element.prototype.animate === "function"
    && root.getBoundingClientRect().width >= 280
    && usableFlightRect(sourceRect)
  );

  const flyCoverToReader = async (work, sourceRect, targetRect, sourceItem, token) => {
    const flight = makeFlightCover(work, targetRect);
    activeFlightCover = flight;
    document.body.append(flight);
    const profile = flightMotionProfile();
    const geometry = edgeOnFlightGeometry(sourceRect, targetRect, profile.pull);
    flight.dataset.motion = profile.compact ? "compact" : "full";
    flight.dataset.motionPhase = "lift";
    sourceItem?.classList.add("is-flight-source");
    root.classList.add("is-extracting");
    flight.classList.add("is-extracting");
    setTransitionPhase("extracting");
    flight.style.opacity = "0.94";
    flight.style.transform = geometry.source;
    void flight.offsetWidth;

    try {
      if (!await runWaapi(flight, [
        { opacity: 0.94, transform: geometry.source },
        { opacity: 1, transform: geometry.lift }
      ], {
        duration: profile.extracting,
        easing: profile.extractingEasing
      }, token, profile.extracting + 32)) return false;

      root.classList.remove("is-extracting");
      flight.classList.remove("is-extracting");
      flight.classList.add("is-arriving");
      flight.dataset.motionPhase = "travel";
      setTransitionPhase("arriving");
      if (!await runWaapi(flight, [
        { opacity: 1, transform: geometry.lift },
        { offset: 0.68, opacity: 1, transform: geometry.travel },
        { offset: 0.9, opacity: 1, transform: geometry.approach },
        { opacity: 1, transform: geometry.target }
      ], {
        duration: profile.arriving,
        easing: profile.travelEasing
      }, token, profile.arriving + 32)) return false;
      return transitionIsCurrent(token);
    } finally {
      root.classList.remove("is-extracting");
      if (activeFlightCover === flight) activeFlightCover = null;
      flight.remove();
    }
  };

  const openCoverAtReader = async (pageTurn, token, profile = flightMotionProfile()) => {
    if (!pageTurn || motionDisabled()) return transitionIsCurrent(token);
    pageTurn.style.setProperty("animation", "none", "important");
    pageTurn.style.transformOrigin = "left center";
    // The parent must remain two-sided; each face controls its own backface.
    // Hiding the parent made the whole cover vanish beyond 90 degrees.
    pageTurn.style.backfaceVisibility = "visible";
    pageTurn.style.opacity = "1";
    return runWaapi(pageTurn, rigidHingeKeyframes(false), {
      duration: profile.hinge,
      easing: profile.hingeEasing
    }, token, profile.hinge + 36);
  };

  const makePageFan = (count) => {
    const fan = create("span", "pl-page-fan");
    fan.setAttribute("aria-hidden", "true");
    fan.setAttribute("inert", "");
    fan.dataset.leaves = String(count);
    for (let index = 0; index < count; index += 1) {
      const leaf = create("span", "pl-page-fan__leaf");
      leaf.dataset.leaf = String(index + 1);
      leaf.style.setProperty("--pl-leaf-index", String(index));
      fan.append(leaf);
    }
    return fan;
  };

  const flickOpenPages = async (token, profile = flightMotionProfile()) => {
    const fan = makePageFan(profile.leaves);
    activePageFan = fan;
    detail.append(fan);
    if (getComputedStyle(fan).display === "none") {
      activePageFan = null;
      fan.remove();
      return transitionIsCurrent(token);
    }
    setTransitionPhase("flicking");
    void fan.offsetWidth;
    try {
      const leaves = [...fan.querySelectorAll(".pl-page-fan__leaf")];
      const results = await Promise.all(leaves.map((leaf, index) => {
        leaf.style.setProperty("animation", "none", "important");
        return runWaapi(leaf, [
          { opacity: 0, transform: `rotateY(0deg) translateZ(${index + 1}px)` },
          { offset: 0.12, opacity: 0.72 },
          { offset: 0.52, opacity: 0.82, transform: `rotateY(-86deg) translateZ(${7 + index}px)` },
          { offset: 0.9, opacity: 0.44 },
          { opacity: 0, transform: `rotateY(-174deg) translateZ(${index + 1}px)` }
        ], {
          duration: profile.flickDuration,
          delay: index * profile.flickStagger,
          easing: profile.flickEasing
        }, token, profile.flickDuration + (index * profile.flickStagger) + 36);
      }));
      return results.every(Boolean) && transitionIsCurrent(token);
    } finally {
      if (activePageFan === fan) activePageFan = null;
      fan.remove();
    }
  };

  const focusShelfBeforeReaderHide = (fallbackTrigger, shouldFocus) => {
    if (
      !shouldFocus
      || (
        !detail.contains(document.activeElement)
        && document.activeElement !== document.body
      )
    ) return;
    const queuedTrigger = queuedIntent?.kind === "open"
      ? shelf.querySelector(`[data-pl-book="${CSS.escape(queuedIntent.work.slug)}"]`)
      : null;
    (queuedTrigger || fallbackTrigger)?.focus({ preventScroll: true });
  };

  const settleReaderPages = (token, profile = flightMotionProfile()) => {
    const page = detail.querySelector(".pl-detail__page--right");
    const duration = profile.compact ? 72 : 96;
    setTransitionPhase("closing");
    return runTransientWaapi(page, [
      { opacity: 1, transform: "perspective(1200px) translate3d(0,0,0) rotateY(0deg)" },
      { offset: 0.52, opacity: 0.97, transform: "perspective(1200px) translate3d(-2px,0,3px) rotateY(-1.8deg)" },
      { opacity: 1, transform: "perspective(1200px) translate3d(0,0,0) rotateY(0deg)" }
    ], {
      duration,
      easing: "cubic-bezier(.3,.08,.28,1)"
    }, token, duration + 36);
  };

  const closeCoverAtReader = (pageTurn, token, profile = flightMotionProfile()) => {
    if (!pageTurn || motionDisabled()) return Promise.resolve(transitionIsCurrent(token));
    const motion = profile.compact ? "compact" : "full";
    pageTurn.dataset.motion = motion;
    readingDock.dataset.motion = motion;
    pageTurn.style.setProperty("display", "block", "important");
    pageTurn.style.setProperty("animation", "none", "important");
    pageTurn.style.transformOrigin = "left center";
    pageTurn.style.backfaceVisibility = "visible";
    pageTurn.style.opacity = "1";
    setTransitionPhase("closing-cover");
    return runWaapi(pageTurn, rigidHingeKeyframes(true), {
      duration: profile.hinge,
      easing: profile.hingeEasing
    }, token, profile.hinge + 36);
  };

  const returnClosedCoverToShelf = async (
    work,
    coverRect,
    sourceRect,
    sourceItem,
    token,
    restoreFocusBeforeHide = false
  ) => {
    const flight = makeFlightCover(work, coverRect);
    activeFlightCover = flight;
    flight.classList.add("is-returning");
    flight.style.transformOrigin = "top left";
    flight.style.backfaceVisibility = "hidden";
    sourceItem?.classList.add("is-flight-source");
    document.body.append(flight);
    const profile = flightMotionProfile();
    const geometry = edgeOnFlightGeometry(sourceRect, coverRect, profile.pull);
    flight.dataset.motion = profile.compact ? "compact" : "full";
    flight.dataset.motionPhase = "return";
    flight.style.opacity = "1";
    flight.style.transform = geometry.target;
    void flight.offsetWidth;

    try {
      focusShelfBeforeReaderHide(
        sourceItem?.querySelector(".pl-volume__trigger"),
        restoreFocusBeforeHide
      );
      detail.hidden = true;
      detail.setAttribute("inert", "");
      root.classList.add("is-returning");
      setTransitionPhase("returning");
      void flight.offsetWidth;
      if (!await runWaapi(flight, [
        { opacity: 1, transform: geometry.target },
        { offset: 0.18, opacity: 1, transform: geometry.approach },
        { offset: 0.72, opacity: 1, transform: geometry.travel },
        { offset: 0.9, opacity: 1, transform: geometry.lift },
        { opacity: 0.96, transform: geometry.source }
      ], {
        duration: profile.returning,
        easing: profile.returningEasing
      }, token, profile.returning + 32, true)) return false;
      return transitionIsCurrent(token);
    } finally {
      root.classList.remove("is-returning");
      if (activeFlightCover === flight) activeFlightCover = null;
      flight.remove();
    }
  };

  const performOpen = async (work, options = {}) => {
    const {
      focus = false,
      focusMode = "title",
      turnDirection = 0,
      historyMode: requestedHistoryMode = "replace",
      sourceRect = null,
      activation = "programmatic",
      skipMotion = false
    } = options;
    const nextTrigger = shelf.querySelector(`[data-pl-book="${CSS.escape(work.slug)}"]`);
    const item = nextTrigger?.closest(".pl-volume");
    if (!item || !nextTrigger) return;
    const nextSourceRect = sourceRect || snapshotRect(nextTrigger.querySelector(".pl-volume__spine"));

    if (currentWork?.slug === work.slug) {
      if (focus) focusReaderTarget(focusMode);
      return;
    }

    const previousWork = currentWork;
    const previousTrigger = currentTrigger;
    const previousItem = previousTrigger?.closest(".pl-volume");
    const firstOpen = !previousWork;
    const needsImmediateReaderFocus = focus && focusMode === "title" && activation !== "pointer";
    let commitsWithoutMotion = motionDisabled() || needsImmediateReaderFocus || skipMotion;
    const previousIndex = previousWork
      ? allWorks.findIndex((candidate) => candidate.slug === previousWork.slug)
      : -1;
    const nextIndex = allWorks.findIndex((candidate) => candidate.slug === work.slug);
    const direction = turnDirection || (previousWork && nextIndex < previousIndex ? -1 : 1);
    const resolvedHistoryMode = requestedHistoryMode === "auto"
      ? (firstOpen ? "push" : "replace")
      : requestedHistoryMode;
    const effectiveHistoryMode = firstOpen
      && resolvedHistoryMode === "replace"
      && activation !== "programmatic"
      ? "push"
      : resolvedHistoryMode;
    let pointerFlightCandidate = false;
    const token = beginVisualTransition();

    readingDock.querySelectorAll(".pl-closing-spread").forEach((node) => node.remove());
    detail.querySelectorAll(".pl-detail__spread--ghost").forEach((node) => node.remove());
    const turningVisual = previousWork && !motionDisabled()
      ? makeVisualClone(detail.querySelector(".pl-detail__spread"), "pl-detail__spread--ghost")
      : null;

    previousItem?.classList.remove("is-open", "is-active");
    previousTrigger?.setAttribute("aria-expanded", "false");
    currentWork = work;
    currentTrigger = nextTrigger;
    currentSourceRect = nextSourceRect;
    if (firstOpen || !root.dataset.readerLayout) {
      readerAnchorTrigger = nextTrigger;
      configureReaderAnchor(work, nextSourceRect, item);
    } else {
      setReaderAnchorSource(work, item);
    }
    const stackedFirstOpen = firstOpen && readingDock.dataset.readerLayout !== "anchored";
    const stackedPointerOpen = stackedFirstOpen
      && activation === "pointer"
      && !motionDisabled()
      && typeof Element.prototype.animate === "function";
    commitsWithoutMotion = commitsWithoutMotion || (stackedFirstOpen && !stackedPointerOpen);
    pointerFlightCandidate = firstOpen
      && canStartPointerFlight(nextSourceRect, effectiveHistoryMode, activation);
    clearCaption();
    shelf.querySelectorAll(".pl-volume__trigger").forEach((book) => {
      book.tabIndex = book === currentTrigger ? 0 : -1;
    });

    renderDetail(work);
    if (turningVisual) detail.insertBefore(turningVisual, detail.querySelector(".pl-page-turn"));
    detail.hidden = false;
    if (firstOpen) detail.setAttribute("inert", "");
    else detail.removeAttribute("inert");
    readingDock.hidden = false;
    readingDock.dataset.cover = work.slug;
    readingDock.dataset.palette = work.palette;
    readingDock.dataset.type = work.type;
    readingDock.dataset.pattern = work.pattern;
    setTransitionPhase(firstOpen
      ? (pointerFlightCandidate || stackedPointerOpen ? "extracting" : "preparing-open")
      : (direction < 0 ? "turning-backward" : "turning-forward"));
    item.classList.add("is-active");
    nextTrigger.setAttribute("aria-expanded", "true");
    if (firstOpen && focus) nextTrigger.focus({ preventScroll: true });
    if (pointerFlightCandidate) root.classList.add("is-extracting");
    root.classList.add("is-reading");
    moveDetail();
    void readingDock.offsetHeight;

    if (effectiveHistoryMode !== "none") {
      setWorkUrl(work.slug, effectiveHistoryMode);
      if (effectiveHistoryMode === "push") historyOwned = true;
    }
    window.dispatchEvent(new CustomEvent("site:layoutchange"));

    if (!firstOpen && focus && (focusMode === "previous" || focusMode === "next")) {
      focusReaderTarget(focusMode);
    }

    if (stackedPointerOpen) {
      // Compact readers previously stopped after a 2-D shelf lift. Let that
      // tactile pull finish, then continue through the same bounded rigid
      // hinge used on desktop below. No separate mobile physics model means
      // opening and closing stay exact inverses at every viewport size.
      if (!await animateStackedSourceLift(nextTrigger, item, token)) return;
      if (!transitionIsCurrent(token)) return;
    }

    if (commitsWithoutMotion) {
      const hasQueuedFollowup = Boolean(queuedIntent);
      root.classList.remove("is-extracting");
      previousItem?.classList.remove("is-flight-source", "is-open", "is-active");
      item.classList.add("is-active", "is-open", "is-flight-source");
      detail.removeAttribute("inert");
      setTransitionPhase("open");
      updateScrollButtons();
      if (!hasQueuedFollowup) announceOpen(work);
      window.dispatchEvent(new CustomEvent("site:layoutchange"));
      if (focus && !hasQueuedFollowup) focusReaderTarget(focusMode);
      removeTransientVisualLayers();
      completeVisualTransition(token);
      if (firstOpen || anchorRefreshPending) scheduleReaderAnchor();
      drainQueuedIntent();
      return;
    }

    if (firstOpen) {
      if (!await waitForFrame(token)) return;
      const spread = detail.querySelector(".pl-detail__spread");
      const spreadRect = snapshotRect(spread);
      const coverPanelRect = snapshotRect(detail.querySelector(".pl-detail__page--left"));
      const coverRect = closedCoverRect(spreadRect, coverPanelRect);
      const pageTurn = detail.querySelector(".pl-page-turn");
      const profile = flightMotionProfile();
      applyOpeningTurnBounds(pageTurn, coverRect, spreadRect);
      if (activation === "pointer" && canUseFlight(nextSourceRect, coverRect, effectiveHistoryMode)) {
        if (!await flyCoverToReader(work, nextSourceRect, coverRect, item, token)) {
          clearOpeningTurnBounds();
          return;
        }
      } else {
        root.classList.remove("is-extracting");
        item.classList.add("is-flight-source");
      }
      if (!transitionIsCurrent(token)) {
        clearOpeningTurnBounds();
        return;
      }
      setTransitionPhase("opening");
      void pageTurn?.offsetWidth;
      const opened = await openCoverAtReader(pageTurn, token, profile);
      clearOpeningTurnBounds();
      if (!opened) return;
      if (activation === "pointer" && !motionDisabled()) {
        if (!await flickOpenPages(token, profile)) return;
      }
    } else {
      const pageTurn = detail.querySelector(".pl-page-turn");
      void pageTurn?.offsetWidth;
      if (!await waitForVisual(pageTurn, token, 760)) return;
    }

    if (!transitionIsCurrent(token)) return;
    const hasQueuedFollowup = Boolean(queuedIntent);
    removeTransientVisualLayers();
    previousItem?.classList.remove("is-flight-source", "is-open", "is-active");
    item.classList.add("is-active", "is-open", "is-flight-source");
    detail.removeAttribute("inert");
    root.classList.remove("is-extracting");
    setTransitionPhase("open");
    updateScrollButtons();
    if (!hasQueuedFollowup) announceOpen(work);
    window.dispatchEvent(new CustomEvent("site:layoutchange"));
    if (focus && !hasQueuedFollowup) focusReaderTarget(focusMode);
    completeVisualTransition(token);
    if (firstOpen || anchorRefreshPending) scheduleReaderAnchor();
    drainQueuedIntent();
  };

  const openWork = (work, options = {}) => {
    if (!work) return;
    if (transitionIsBusy() || historyClosePending) {
      queueTransitionIntent({
        kind: "open",
        work,
        options: { ...options, sourceRect: null }
      });
      return;
    }
    void performOpen(work, options);
  };

  const finishClose = (triggerToRestore, focus, suppressCompletion = false) => {
    const anchoredAtClose = readerUsesAnchoredLayout();
    const activeAtCommit = document.activeElement;
    const restoreTriggerFocus = Boolean(
      focus
      && triggerToRestore?.isConnected
      && (
        !activeAtCommit
        || activeAtCommit === document.body
        || activeAtCommit === triggerToRestore
        || detail.contains(activeAtCommit)
      )
    );
    shelf.querySelectorAll(".pl-volume.is-active, .pl-volume.is-open, .pl-volume.is-flight-source")
      .forEach((item) => item.classList.remove("is-active", "is-open", "is-flight-source"));
    if (detail.parentElement !== readingDock) readingDock.append(detail);
    clearCaption();
    root.classList.remove("is-reading");
    if (restoreTriggerFocus) {
      triggerToRestore.focus({ preventScroll: true });
    }
    detail.hidden = true;
    detail.setAttribute("inert", "");
    detail.replaceChildren();
    removeTransientVisualLayers();
    setTransitionPhase("closed");
    readingDock.hidden = true;
    delete readingDock.dataset.cover;
    delete readingDock.dataset.palette;
    delete readingDock.dataset.type;
    delete readingDock.dataset.pattern;
    delete readingDock.dataset.motion;
    currentWork = null;
    currentTrigger = null;
    currentSourceRect = null;
    clearReaderAnchor();
    root.classList.remove("is-extracting", "is-returning");
    releaseReadingDockHeight();
    clearOpeningTurnBounds();
    if (restoreTriggerFocus) {
      requestAnimationFrame(() => {
        if (transitionPhase !== "closed" || !triggerToRestore.isConnected) return;
        if (document.activeElement !== triggerToRestore) return;
        const restoredWork = allWorks.find((work) => work.slug === triggerToRestore.dataset.plBook);
        if (restoredWork && (captionModality === "keyboard" || triggerToRestore.matches(":hover"))) {
          setCaption(restoredWork);
        } else {
          clearCaption();
        }
        const restoredRect = snapshotRect(triggerToRestore);
        const restoredOutsideViewport = restoredRect && (
          restoredRect.top < 0
          || restoredRect.bottom > window.innerHeight
          || restoredRect.left < 0
          || restoredRect.right > window.innerWidth
        );
        if (embeddedLayout && (!anchoredAtClose || restoredOutsideViewport)) {
          triggerToRestore.scrollIntoView({
            behavior: reducedMotion.matches ? "auto" : "smooth",
            block: "nearest",
            inline: "nearest"
          });
        }
      });
    }
    if (!suppressCompletion) announceClosed();
    updateScrollButtons();
    window.dispatchEvent(new CustomEvent("site:layoutchange"));
  };

  const performClose = async (options = {}) => {
    const {
      immediate = false,
      focus = true,
      updateUrl = true,
      activation = "programmatic"
    } = options;
    if (!currentWork) return;
    const token = beginVisualTransition();
    holdReadingDockHeight();
    const workToClose = currentWork;
    const triggerToRestore = currentTrigger;
    const item = triggerToRestore?.closest(".pl-volume");
    item?.classList.remove("is-open");
    const liveSourceRect = snapshotRect(triggerToRestore?.querySelector(".pl-volume__spine"));
    const returnSourceRect = liveSourceRect || currentSourceRect;
    const spreadRect = snapshotRect(detail.querySelector(".pl-detail__spread:not(.pl-detail__spread--ghost)"));
    const coverPanel = detail.querySelector(".pl-detail__page--left");
    const coverPanelRect = snapshotRect(coverPanel);
    const coverRect = closedCoverRect(spreadRect, coverPanelRect);
    const pageTurn = detail.querySelector(".pl-page-turn");
    const coverIsVisible = Boolean(
      coverPanelRect
      && coverPanelRect.bottom > 0
      && coverPanelRect.top < window.innerHeight
      && coverPanelRect.right > 0
      && coverPanelRect.left < window.innerWidth
    );
    const stackedPointerClose = !immediate
      && readingDock.dataset.readerLayout !== "anchored"
      && activation === "pointer"
      && !motionDisabled()
      && typeof Element.prototype.animate === "function"
      && coverIsVisible;
    const closeImmediately = immediate
      || (readingDock.dataset.readerLayout !== "anchored" && !stackedPointerClose)
      || (focus && activation !== "pointer");
    const animateClose = !closeImmediately && !motionDisabled();
    const reverseFlight = animateClose
      && !stackedPointerClose
      && pageTurn
      && canAnimateFlight(returnSourceRect, coverRect);
    const closingVisual = animateClose && !stackedPointerClose && !reverseFlight
      ? makeVisualClone(
        detail.querySelector(".pl-detail__spread:not(.pl-detail__spread--ghost)"),
        "pl-closing-spread"
      )
      : null;
    readingDock.querySelectorAll(".pl-closing-spread").forEach((node) => node.remove());
    detail.querySelectorAll(".pl-detail__spread--ghost").forEach((node) => node.remove());
    if (closingVisual) readingDock.append(closingVisual);
    triggerToRestore?.setAttribute("aria-expanded", "false");
    if (updateUrl) setWorkUrl(null, "replace");

    if (stackedPointerClose) {
      const compactProfile = { ...flightMotionProfile(), compact: true, closing: 150 };
      applyOpeningTurnBounds(pageTurn, coverRect, spreadRect);
      if (!await settleReaderPages(token, compactProfile)) {
        clearOpeningTurnBounds();
        return;
      }
      if (!await closeCoverAtReader(pageTurn, token, compactProfile)) {
        clearOpeningTurnBounds();
        return;
      }
      clearOpeningTurnBounds();
    } else if (reverseFlight) {
      const profile = flightMotionProfile();
      applyOpeningTurnBounds(pageTurn, coverRect, spreadRect);
      if (!await settleReaderPages(token, profile)) {
        clearOpeningTurnBounds();
        return;
      }
      if (!await closeCoverAtReader(pageTurn, token, profile)) {
        clearOpeningTurnBounds();
        return;
      }
      const handoffSpreadRect = snapshotRect(detail.querySelector(".pl-detail__spread:not(.pl-detail__spread--ghost)"));
      const handoffCoverPanelRect = snapshotRect(detail.querySelector(".pl-detail__page--left"));
      const handoffCoverRect = closedCoverRect(handoffSpreadRect, handoffCoverPanelRect);
      const handoffSourceRect = snapshotRect(triggerToRestore?.querySelector(".pl-volume__spine")) || returnSourceRect;
      const readerResizedDuringClose = !handoffCoverRect
        || Math.abs(handoffCoverRect.width - coverRect.width) > 8
        || Math.abs(handoffCoverRect.height - coverRect.height) > 8;
      if (
        !readerResizedDuringClose
        && canAnimateFlight(handoffSourceRect, handoffCoverRect)
        && !await returnClosedCoverToShelf(
          workToClose,
          handoffCoverRect,
          handoffSourceRect,
          item,
          token,
          focus
        )
      ) {
        clearOpeningTurnBounds();
        return;
      }
      clearOpeningTurnBounds();
    } else if (animateClose) {
      setTransitionPhase("closing");
      focusShelfBeforeReaderHide(triggerToRestore, focus);
      detail.hidden = true;
      detail.setAttribute("inert", "");
      if (!await waitForVisual(closingVisual, token, 360)) return;
    } else {
      setTransitionPhase("closing");
    }
    if (!transitionIsCurrent(token)) return;
    const supersededByOpen = queuedIntent?.kind === "open";
    if (supersededByOpen) focusShelfBeforeReaderHide(triggerToRestore, focus);
    finishClose(triggerToRestore, focus && !supersededByOpen, supersededByOpen);
    completeVisualTransition(token);
    drainQueuedIntent();
  };

  const closeWork = (options = {}) => {
    if (!currentWork) return;
    if (transitionIsBusy()) {
      if (closingPhases.has(transitionPhase)) {
        if (queuedIntent?.kind === "open") clearQueuedIntent();
      } else {
        queueTransitionIntent({ kind: "close-visual", options });
      }
      return;
    }
    void performClose(options);
  };

  const requestClose = (options = {}) => {
    if (!currentWork) return;
    if (transitionIsBusy()) {
      if (closingPhases.has(transitionPhase)) {
        if (queuedIntent?.kind === "open") clearQueuedIntent();
      } else {
        queueTransitionIntent({ kind: "close", options });
      }
      return;
    }
    if (historyOwned) {
      historyClosePending = true;
      closeWork({ ...options, updateUrl: false });
      history.back();
      return;
    }
    historyClosePending = false;
    closeWork({ ...options, updateUrl: true });
  };

  const adjacentWork = (direction, options = {}) => {
    if (!currentWork) return;
    // Base repeated navigation on the last queued destination, not the work
    // whose page turn is still running. Otherwise Next x3 collapses to one step.
    const basisWork = queuedIntent?.kind === "open" && queuedIntent.work
      ? queuedIntent.work
      : currentWork;
    const collection = collectionFor(basisWork);
    const index = collection.findIndex((work) => work.slug === basisWork.slug);
    const nextIndex = (index + direction + collection.length) % collection.length;
    openWork(collection[nextIndex], {
      historyMode: "replace",
      focus: true,
      focusMode: options.focusMode || (direction < 0 ? "previous" : "next"),
      activation: options.activation || "programmatic",
      turnDirection: direction
    });
  };

  detail.addEventListener("click", async (event) => {
    const control = event.target.closest("[data-pl-action]");
    if (!control) return;
    const action = control.dataset.plAction;
    if (action === "view-cv" && !isUnmodifiedPrimaryClick(event)) return;
    event.preventDefault();
    event.stopPropagation();
    const activation = event.detail === 0 ? "keyboard" : "pointer";
    captionModality = activation;
    if (action === "close") requestClose({ activation });
    if (action === "previous") {
      adjacentWork(-1, { activation, focusMode: activation === "pointer" ? "title" : "previous" });
    }
    if (action === "next") {
      adjacentWork(1, { activation, focusMode: activation === "pointer" ? "title" : "next" });
    }
    if (action === "view-cv" && currentWork) {
      if (transitionIsBusy()) return;
      const source = currentWork.source;
      if (currentWork.type === "publication" && source.classList.contains("hidden")) {
        document.querySelector('#pubFilter [data-year="all"]')?.click();
      }
      const url = new URL(control.href, window.location.href);
      closeWork({ immediate: true, focus: false, updateUrl: false });
      historyOwned = false;
      historyClosePending = false;
      await transitionDocumentView(url, { historyMode: "replace", focus: true });
    }
  });

  scrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.plScroll === "previous" ? -1 : 1;
      viewport.scrollBy({ left: direction * viewport.clientWidth * 0.72, behavior: reducedMotion.matches ? "auto" : "smooth" });
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.key !== "Escape" || !currentWork) return;
    event.preventDefault();
    requestClose({ activation: "keyboard" });
  });

  viewport.addEventListener("scroll", scheduleScrollButtons, { passive: true });
  const refreshCompactKeywords = () => {
    const nextState = root.clientWidth <= 760;
    if (nextState === compactKeywordState) return;
    compactKeywordState = nextState;
    updateLocalizedLabels();
  };
  window.addEventListener("resize", () => {
    refreshCompactKeywords();
    scheduleScrollButtons();
    scheduleCaptionLayout();
    scheduleReaderAnchor();
    if (document.activeElement?.matches?.(".pl-volume__trigger")) {
      window.requestAnimationFrame(() => syncShelfFocusProxy(document.activeElement));
    }
  }, { passive: true });
  window.addEventListener("scroll", scheduleShelfFocusProxyLayout, { passive: true });
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      refreshCompactKeywords();
      scheduleScrollButtons();
      scheduleCaptionLayout();
      scheduleReaderAnchor();
    }).observe(root);
  }
  compactLayout.addEventListener("change", () => {
    moveDetail();
    scheduleReaderAnchor();
    window.dispatchEvent(new CustomEvent("site:layoutchange"));
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || !isUnmodifiedPrimaryClick(event)) return;
    const link = event.target.closest("a[href]");
    if (!link || detail.contains(link)) return;
    const targetUrl = new URL(link.href, window.location.href);
    const currentUrl = new URL(window.location.href);
    if (targetUrl.origin !== currentUrl.origin || targetUrl.pathname !== currentUrl.pathname) return;
    const nextView = documentViewFor(targetUrl);
    const currentView = documentViewFor(currentUrl);
    const isViewLink = link.matches("[data-cv-jump], .library-return")
      || targetUrl.searchParams.get("view") === "cv";
    if (!isViewLink || nextView === currentView) return;
    event.preventDefault();
    if (currentWork && nextView === "cv") {
      closeWork({ immediate: true, focus: false, updateUrl: false });
      historyOwned = false;
      historyClosePending = false;
    }
    void transitionDocumentView(targetUrl, { historyMode: "push", focus: true });
  });

  let observedLanguage = currentLanguage();
  const languageObserver = new MutationObserver(() => {
    const nextLanguage = currentLanguage();
    if (nextLanguage === observedLanguage) return;
    observedLanguage = nextLanguage;
    updateLocalizedLabels();
    if (currentWork && transitionPhase === "open") announceOpen(currentWork);
  });
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  window.addEventListener("popstate", async () => {
    const popEpoch = ++popstateEpoch;
    const url = new URL(window.location.href);
    const viewChanged = documentViewFor(url) !== document.documentElement.dataset.view;
    if (viewChanged) {
      await transitionDocumentView(url, { historyMode: "none", focus: true });
    } else {
      syncDocumentView(url);
    }
    if (popEpoch !== popstateEpoch || window.location.href !== url.href) return;
    const slug = url.searchParams.get("work");
    if (historyClosePending) {
      if (slug) {
        history.back();
        return;
      }
      historyOwned = false;
      historyClosePending = false;
      if (currentWork && !closingPhases.has(transitionPhase)) {
        closeWork({ updateUrl: false });
      }
      drainQueuedIntent();
      return;
    }
    historyOwned = false;
    if (!slug) {
      closeWork({ updateUrl: false });
      return;
    }
    const work = allWorks.find((candidate) => candidate.slug === slug);
    if (work) {
      openWork(work, { historyMode: "none", focus: false, activation: "programmatic" });
    } else {
      if (currentWork) closeWork({ immediate: true, focus: false, updateUrl: false });
      setWorkUrl(null, "replace");
    }
  });

  renderShelf();
  updateLocalizedLabels();
  root.classList.add("is-ready");
  if (document.fonts?.ready) {
    document.fonts.ready
      .then(() => {
        scheduleCaptionLayout();
        scheduleReaderAnchor();
      })
      .catch(() => {});
  }

  const requestedSlug = new URL(window.location.href).searchParams.get("work");
  const requestedWork = allWorks.find((work) => work.slug === requestedSlug);
  if (requestedWork) {
    requestAnimationFrame(() => openWork(requestedWork, {
      historyMode: "none",
      focus: false,
      activation: "programmatic"
    }));
  } else if (requestedSlug) {
    setWorkUrl(null, "replace");
  }
})();
