(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealTargets = document.querySelectorAll([
    ".section-heading",
    ".thesis-grid",
    ".operating-model > li",
    ".case",
    ".funder",
    ".toolkit-grid",
    ".capability-list article",
    ".recognition-list article",
    ".featured-pubs article",
    ".credentials-grid"
  ].join(","));

  if (!reduceMotion && "IntersectionObserver" in window) {
    revealTargets.forEach((element) => element.classList.add("reveal-ready"));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -48px 0px"
    });

    revealTargets.forEach((element) => revealObserver.observe(element));
  }

  const navigationLinks = [...document.querySelectorAll(".site-nav a")];
  const trackedSections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && trackedSections.length) {
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navigationLinks.forEach((link) => {
        const current = link.getAttribute("href") === `#${visible.target.id}`;
        if (current) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, {
      rootMargin: "-20% 0px -68% 0px",
      threshold: [0, 0.2, 0.5, 0.8]
    });

    trackedSections.forEach((section) => activeObserver.observe(section));
  }
})();
