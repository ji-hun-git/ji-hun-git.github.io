(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  if (params.get("view") === "cv") {
    document.title = "Jihun Chae | Curriculum Vitae";
    document.querySelector('link[rel="canonical"]').href =
      "https://ji-hun-git.github.io/?view=cv";
  }
  const language = document.getElementById("langToggle");
  const reader = document.getElementById("ttsToggle");
  const setLanguage = (ko) => {
    document.body.classList.toggle("ko", ko);
    document.documentElement.lang = ko ? "ko" : "en";
    document.getElementById("langLabel").textContent = ko
      ? "English"
      : "한국어";
    language.setAttribute(
      "aria-label",
      ko ? "Read in English" : "한국어로 읽기",
    );
    const url = new URL(location.href);
    if (ko) url.searchParams.set("lang", "ko");
    else url.searchParams.delete("lang");
    history.replaceState(history.state, "", url);
  };
  setLanguage(params.get("lang") === "ko");
  language.addEventListener("click", () =>
    setLanguage(document.documentElement.lang !== "ko"),
  );
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
  document
    .getElementById("printCV")
    ?.addEventListener("click", () => window.print());
  const toolkit = document.querySelector("details.caps");
  let toolkitWasOpen = false;
  window.addEventListener("beforeprint", () => {
    if (!toolkit) return;
    toolkitWasOpen = toolkit.open;
    toolkit.open = true;
  });
  window.addEventListener("afterprint", () => {
    if (toolkit) toolkit.open = toolkitWasOpen;
  });
  // The authored citations remain the library's source of truth. On the CV,
  // present the same nodes in a title-first reading order after extraction.
  document.addEventListener("DOMContentLoaded", () => {
    if (params.get("view") !== "cv") return;
    document.querySelectorAll(".item-meta > span[lang]").forEach((meta) => {
      const parts = meta.textContent.split("|").map((part) => part.trim());
      if (parts.length < 2) return;
      meta.classList.add("cv-meta-row");
      meta.replaceChildren(
        ...parts.map((part, index) => {
          const span = document.createElement("span");
          span.className = index === 0 ? "cv-date" : "cv-meta-part";
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
      const heading = document.createElement("h3");
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
      if (number) surface.append(number);
      surface.append(heading, authors, detail, links);
      citation.replaceWith(surface);
    });
  });
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
      const current = sections
        .filter(
          (section) =>
            section.getBoundingClientRect().top <=
            Math.max(100, innerHeight * 0.25),
        )
        .at(-1);
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
    schedule();
  }
  document.querySelectorAll("img").forEach((img) => {
    const failed = () => {
      img.hidden = true;
      if (img.closest(".profile-image"))
        img.closest(".profile-image").classList.add("image-unavailable");
    };
    img.addEventListener("error", failed);
    if (img.complete && !img.naturalWidth) failed();
  });
})();
