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
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((e) => e.isIntersecting);
        if (!entry) return;
        nav.querySelectorAll("a").forEach((a) => {
          if (a.hash === "#" + entry.target.id)
            a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-12% 0px -65% 0px" },
    );
    document
      .querySelectorAll("#cv-content > section[id]")
      .forEach((section) => observer.observe(section));
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
