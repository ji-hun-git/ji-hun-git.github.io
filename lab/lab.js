import { labProjects } from "./experiments.js?v=115-20260930b";

// A browser remembers a failed module fetch for the life of the page, so a
// retry asks for the same file under a one-off query (?v=…&retry=N).
const bust = (n) => (n ? `&retry=${n}` : "");

const rendererRegistry = {
  "behavior-prompt-gridworld": (n) =>
    import("./simulations/gridworld-prompt.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountGridworldPrompt,
    ),
  "arc-adaptive-unit": (n) =>
    import("./simulations/arc-adaptive-robot.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountArcRobot,
    ),
  "double-pendulum": (n) =>
    import("./simulations/double-pendulum.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountDoublePendulum,
    ),
  "verlet-cloth": (n) =>
    import("./simulations/verlet-cloth.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountVerletCloth,
    ),
  "falling-sand": (n) =>
    import("./simulations/falling-sand.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountFallingSand,
    ),
  plinko: (n) =>
    import("./simulations/plinko.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountPlinko,
    ),
  "lunar-lander": (n) =>
    import("./simulations/lunar-lander.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountLunarLander,
    ),
  "breakout-ai": (n) =>
    import("./simulations/breakout-ai.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountBreakoutAI,
    ),
  "tetris-ai": (n) =>
    import("./simulations/tetris-ai.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountTetrisAI,
    ),
  "agent-arena": (n) =>
    import("./simulations/agent-arena.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountAgentArena,
    ),
  "neuroevolution-flappy": (n) =>
    import("./simulations/neuroevolution-flappy.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountNeuroFlappy,
    ),
  "connect-four": (n) =>
    import("./simulations/connect-four.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountConnectFour,
    ),
  "game-2048": (n) =>
    import("./simulations/game-2048.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountGame2048,
    ),
  minesweeper: (n) =>
    import("./simulations/minesweeper.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountMinesweeper,
    ),
  "maze-chase": (n) =>
    import("./simulations/maze-chase.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountMazeChase,
    ),
  "snake-growth": (n) =>
    import("./simulations/snake-swarm.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountSnakeSwarm,
    ),
  "light-cycle-arena": (n) =>
    import("./simulations/light-cycle.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountLightCycle,
    ),
  "frozen-lake": (n) =>
    import("./simulations/frozen-lake.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountFrozenLake,
    ),
  "q-learning-gridworld": (n) =>
    import("./simulations/q-learning.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountQLearning,
    ),
  "cartpole-control": (n) =>
    import("./simulations/cartpole.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountCartpole,
    ),
  "pathfinding-search": (n) =>
    import("./simulations/pathfinding.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountPathfinding,
    ),
  "wumpus-world": (n) =>
    import("./simulations/wumpus.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountWumpus,
    ),
  "reaction-diffusion": (n) =>
    import("./simulations/reaction-diffusion.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountReactionDiffusion,
    ),
  "boids-3d": (n) =>
    import("./simulations/boids-3d.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountBoids3d,
    ),
  "optimizer-landscape-3d": (n) =>
    import("./simulations/terrain-descent-3d.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountTerrainDescent3d,
    ),
  "nbody-gravity-3d": (n) =>
    import("./simulations/nbody-3d.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountNBody3d,
    ),
  "ludic-geometry": (n) =>
    import("./simulations/ludic-geometry.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountLudicGeometry,
    ),
  "particle-policy-field": (n) =>
    import("./simulations/particle-field.js?v=115-20260930b" + bust(n)).then(
      (module) => module.mountParticleField,
    ),
};

// KaTeX, pinned to one version with Subresource Integrity, and loaded after the
// page so a slow or blocked CDN never holds up the simulations. Until it
// arrives the equations stay hidden (no raw TeX); if it fails, a short note
// replaces them.
const KATEX_BASE = "https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/";
const KATEX = {
  css: {
    href: `${KATEX_BASE}katex.min.css`,
    integrity: "sha256-AomgLPRRpE3XOt1oOglkQlI2OHGsEXE6ZHtzLO6LHuM=",
  },
  core: {
    src: `${KATEX_BASE}katex.min.js`,
    integrity: "sha256-op0pYdMUbeWUnXisfBqdk65UlVutIqbbT76Dbojov0g=",
  },
  autoRender: {
    src: `${KATEX_BASE}contrib/auto-render.min.js`,
    integrity: "sha256-5TctGZvNrotN5x0PfOunKkuhJ3SifGCm8fd9A7MijuQ=",
  },
};

const $ = (selector, root = document) => root.querySelector(selector);

// Simulations that react to the cursor also take arrow keys (see _shared.js).
const POINTER_SIMS = new Set([
  "arc-adaptive-unit",
  "verlet-cloth",
  "falling-sand",
  "reaction-diffusion",
  "particle-policy-field",
]);

// Catalog links carry this page's own file name and query before the #route, so
// they stay same-page links (no reload, ?from=ko kept) without being bare
// "#id" anchors that point at no element.
const ROUTE_BASE = `${location.pathname.split("/").pop()}${location.search}`;

// Visitors who came from the Korean CV go back to it.
const CV_HREF =
  new URLSearchParams(location.search).get("from") === "ko"
    ? "ko.html"
    : "index.html";

// The project list is grouped and filterable so the long catalog stays tidy.
const GROUP_ORDER = ["Agents", "Games", "Learning", "Physics", "Patterns"];
let currentFilter = "All";
let currentProjectId = null;

// Synced math highlight: the equation matching the simulation's current step
// lights up. A sim sets api.stage to drive it; otherwise the highlight moves
// through the equations every 1.5 s, but only while the simulation runs.
let currentEqEls = [];
let hlIdx = 0;
let hlAccum = 0;
const HL_TICK = 250;

const projectCards = $("#projectCards");
const railFilter = $("#railFilter");
const viewportMount = $("#viewportMount");
const detailMount = $("#detailMount");
const controlMount = $("#controlMount");
const heroMetrics = {
  projects: $("#metricProjects"),
  live: $("#metricLive"),
  liveStat: $("#metricLiveStat"),
};

let mountedSimulation = null;

function statusLabel(status) {
  return status.replace("-", " ");
}

function sortedProjects() {
  return [...labProjects].sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
  );
}

// Stable catalog number per sim (01..N), in the grouped reading order. Used
// both as the index entry number and the figure number, so every simulation is
// referable by a fixed "Fig. N" the way a paper numbers its figures.
const FIG_NUM = new Map(sortedProjects().map((p, i) => [p.id, i + 1]));
const figNo = (project) =>
  String(FIG_NUM.get(project.id) || 0).padStart(2, "0");

// One catalog entry: a link to the simulation (its hash route), with the
// number and description beside it. The group is the heading above the list,
// so the entry does not repeat it. The link's ::after covers the whole entry,
// so the full card stays clickable.
function cardHTML(project, selectedId) {
  const current = project.id === selectedId;
  return `
    <li class="project-card ${current ? "active" : ""}">
      <span class="card-index" aria-hidden="true">${figNo(project)}</span>
      <span class="card-body">
        ${project.status === "live" ? "" : `<span class="status-line"><span class="badge">${statusLabel(project.status)}</span></span>`}
        <a class="card-title" href="${ROUTE_BASE}${project.route}" data-project-id="${project.id}"${current ? ' aria-current="true"' : ""}>${project.title}</a>
        <p>${project.description}</p>
      </span>
    </li>`;
}

function renderFilter() {
  if (!railFilter) return;
  const counts = {};
  labProjects.forEach((p) => {
    counts[p.group] = (counts[p.group] || 0) + 1;
  });
  const chips = ["All", ...GROUP_ORDER];
  railFilter.innerHTML = chips
    .map(
      (g) =>
        `<button class="chip ${g === currentFilter ? "active" : ""}" type="button" data-filter="${g}" aria-pressed="${g === currentFilter}">${g}<span class="chip-n">${g === "All" ? labProjects.length : counts[g] || 0}</span></button>`,
    )
    .join("");
  railFilter.querySelectorAll("[data-filter]").forEach((b) => {
    b.addEventListener("click", () => {
      currentFilter = b.dataset.filter;
      // Update the chips in place so keyboard focus stays on the pressed one.
      railFilter.querySelectorAll("[data-filter]").forEach((chip) => {
        const on = chip.dataset.filter === currentFilter;
        chip.classList.toggle("active", on);
        chip.setAttribute("aria-pressed", String(on));
      });
      renderProjectCards(currentProjectId);
    });
  });
}

function renderProjectCards(selectedId) {
  const list = sortedProjects().filter(
    (p) => currentFilter === "All" || p.group === currentFilter,
  );
  let html = "";
  let lastGroup = null;
  for (const p of list) {
    if (p.group !== lastGroup) {
      if (lastGroup !== null) html += "</ol>";
      if (currentFilter === "All") html += `<h3 class="rail-group">${p.group}</h3>`;
      html += '<ol class="project-group">';
      lastGroup = p.group;
    }
    html += cardHTML(p, selectedId);
  }
  if (lastGroup !== null) html += "</ol>";
  projectCards.innerHTML = html;
}

// Mark the selected entry without rebuilding the list (rebuilding it would
// drop keyboard focus to <body>).
function markSelectedCard(id) {
  projectCards.querySelectorAll("[data-project-id]").forEach((link) => {
    const on = link.dataset.projectId === id;
    link.closest(".project-card")?.classList.toggle("active", on);
    if (on) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

// CENTER - top: the figure (live simulation) with a journal-style caption.
function viewportHTML(project) {
  const canRender = Boolean(rendererRegistry[project.id]);
  const n = figNo(project);
  const keys = POINTER_SIMS.has(project.id)
    ? " Arrow keys move the cursor when the figure has focus."
    : "";
  return `
    <figure class="viewport-panel" aria-labelledby="viewport-title">
      <figcaption class="viewport-header">
        <div>
          <span class="kicker">Figure ${n}</span>
          <h2 id="viewport-title" tabindex="-1">${project.title}</h2>
        </div>
        <div class="viewport-tools">
          <button class="text-button" type="button" data-control="pause">Pause</button>
          <button class="text-button" type="button" data-control="reset">Reset</button>
          <button class="text-button" type="button" data-control="copyLink">Copy link</button>
        </div>
      </figcaption>
      ${
        canRender
          ? `<div class="viewport-stage"><canvas id="simulationCanvas" role="img" aria-label="${project.title} simulation" aria-describedby="viewport-caption"></canvas></div>
           <p class="viewport-caption" id="viewport-caption"><b>Fig. ${n}.</b> ${project.subtitle}. Use the Controls panel to switch modes and change parameters.${keys}</p>
           <p class="viewport-note" id="viewport-note" hidden>Paused because your device is set to reduce motion. Press Run to start.</p>
           <p class="pl-sr-only" id="simStatus" role="status"></p>`
          : `<div class="empty-stage"><div><strong>${project.title}</strong><br />This simulation is not available yet.</div></div>`
      }
    </figure>
  `;
}

// CENTER - bottom: signals, the synced math, and the detail.
function detailHTML(project) {
  const canRender = Boolean(rendererRegistry[project.id]);
  const metricLabels = project.metricLabels;
  const chartLabel = `History of ${metricLabels.energy}, ${metricLabels.order} and ${metricLabels.spread}, last 120 samples`;
  return `
    <section class="panel panel-signals" aria-labelledby="analysis-title">
      <div class="analysis-header">
        <h3 id="analysis-title">Signals</h3>
        ${project.status === "live" ? "" : `<span class="badge">${statusLabel(project.status)}</span>`}
      </div>
      <div class="analysis-grid">
        <div class="chart-wrap">
          ${canRender ? `<canvas id="analysisChart" role="img" aria-label="${chartLabel}"></canvas>` : `<div class="empty-stage">No measurements yet.</div>`}
        </div>
        <div>
          <div class="metric-grid">
            <div class="metric"><span>${metricLabels.energy}</span><strong id="metricEnergy">0.00</strong></div>
            <div class="metric"><span>${metricLabels.order}</span><strong id="metricOrder">0.00</strong></div>
            <div class="metric"><span>${metricLabels.spread}</span><strong id="metricSpread">0.00</strong></div>
          </div>
          <ul class="log-list" id="simulationLog">
            <li>Simulation log is ready.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="panel panel-math" aria-labelledby="math-title">
      <span class="kicker">Model</span>
      <h3 id="math-title">${project.mathTopics.join(" &middot; ")}</h3>
      <div class="math-list is-pending">
        ${project.equations.map((equation) => `<div class="equation">\\[${equation}\\]</div>`).join("")}
      </div>
    </section>

    <section class="panel panel-about" aria-labelledby="overview-title">
      <h3 id="overview-title">${project.subtitle}</h3>
      <div class="overview-copy">
        <p class="overview-lead">${project.description}</p>
        ${project.overview.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </div>
      <div class="facts-grid">
        ${project.facts.map((fact) => `<div class="fact"><span>${fact.label}</span><strong>${fact.value}</strong></div>`).join("")}
      </div>
    </section>

    <section class="panel panel-future" aria-labelledby="future-title">
      <h3 id="future-title">Possible extensions</h3>
      <ol class="steps">
        ${project.futureWork.map((item) => `<li>${item}</li>`).join("")}
      </ol>
    </section>
  `;
}

// RIGHT - controls and parameters.
function controlHTML(project) {
  const canRender = Boolean(rendererRegistry[project.id]);
  return `
    <div class="control-header">
      <h2 id="controls-title">Controls</h2>
    </div>
    <div class="controls">
      ${canRender ? controlsTemplate(project) : placeholderControlsTemplate(project)}
    </div>
  `;
}

function controlsTemplate(project) {
  const labels = project.controlLabels;
  // No button is marked active here: each simulation marks the variation it
  // actually starts on (its declared first variation) when it mounts. Each
  // mode's description is visible text for assistive tech, not only a tooltip.
  return `
    <div class="preset-row" role="group" aria-label="Modes">
      ${project.variations
        .map(
          (variation) => `
        <button class="ghost-button" type="button" data-variation="${variation.id}" aria-pressed="false" title="${variation.description}" aria-describedby="mode-desc-${variation.id}">
          ${variation.label}
        </button>
      `,
        )
        .join("")}
    </div>
    <div hidden>
      ${project.variations.map((variation) => `<span id="mode-desc-${variation.id}">${variation.description}</span>`).join("")}
    </div>

    <!-- for= is required here, not decorative. A <label> binds to its first
         LABELABLE descendant, and <output> is labelable - so the <output> in
         .control-row was claiming the label and every slider was reaching the
         accessibility tree with no name at all ("slider", value only). An
         explicit for= overrides that and points the name at the input. The
         <output> shows the value the model uses (each simulation's
         controlFormat), or nothing where no single value applies. -->
    <label class="control" for="countControl">
      <span class="control-row"><span>${labels.count}</span><output id="countValue" for="countControl"></output></span>
      <input id="countControl" name="count" type="range" min="48" max="360" step="4" value="180" />
    </label>
    <label class="control" for="speedControl">
      <span class="control-row"><span>${labels.speed}</span><output id="speedValue" for="speedControl"></output></span>
      <input id="speedControl" name="speed" type="range" min="0.4" max="3.4" step="0.05" value="1.8" />
    </label>
    <label class="control" for="turbulenceControl">
      <span class="control-row"><span>${labels.turbulence}</span><output id="turbulenceValue" for="turbulenceControl"></output></span>
      <input id="turbulenceControl" name="turbulence" type="range" min="0" max="1.2" step="0.01" value="0.35" />
    </label>
    <label class="control" for="attractionControl">
      <span class="control-row"><span>${labels.attraction}</span><output id="attractionValue" for="attractionControl"></output></span>
      <input id="attractionControl" name="attraction" type="range" min="0" max="0.9" step="0.01" value="0.22" />
    </label>
    <label class="toggle">
      <span>${labels.trails}</span>
      <input id="trailsControl" type="checkbox" checked />
    </label>
    <label class="control" for="seedControl">
      <span class="control-row"><span>Seed</span></span>
      <input id="seedControl" type="number" min="1" max="999999" step="1" value="42" inputmode="numeric" />
    </label>
    <button class="outline-button" type="button" data-control="randomize">Randomize seed</button>
  `;
}

function placeholderControlsTemplate(project) {
  return `
    <p class="overview-copy">Controls appear when this simulation is ready.</p>
    <button class="outline-button" type="button" disabled>Not available yet</button>
  `;
}

let mountRevision = 0;
async function mountSelectedSimulation(project, attempt = 0) {
  const revision = ++mountRevision;
  mountedSimulation?.dispose?.();
  mountedSimulation = null;

  const copyLink = $('[data-control="copyLink"]');
  if (copyLink && attempt === 0) {
    copyLink.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}${project.route}`;
      try {
        await navigator.clipboard.writeText(url);
        copyLink.textContent = "Copied";
      } catch {
        // Leave the link in the address bar so it can be copied from there.
        history.replaceState(null, "", project.route);
        copyLink.textContent = "Copy failed";
      }
      setTimeout(() => {
        copyLink.textContent = "Copy link";
      }, 1300);
    });
  }

  const load = rendererRegistry[project.id];
  if (!load) return;
  const canvas = $("#simulationCanvas");
  const tools = viewportMount.querySelector(".viewport-tools");
  // Nothing responds until the module has mounted, so nothing looks live.
  controlMount.inert = true;
  if (tools) tools.inert = true;
  canvas.setAttribute("aria-busy", "true");
  let renderer;
  try {
    renderer = await load(attempt);
  } catch {
    if (revision !== mountRevision) return;
    const error = document.createElement("div");
    error.className = "load-error";
    error.setAttribute("role", "alert");
    const message = document.createElement("p");
    message.textContent = "This simulation could not be loaded.";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "outline-button";
    retry.textContent = "Try again";
    retry.addEventListener("click", () => {
      error.remove();
      mountSelectedSimulation(project, attempt + 1);
    });
    error.append(message, retry);
    canvas.after(error);
    canvas.setAttribute("aria-busy", "false");
    return;
  }
  if (revision !== mountRevision) return;

  mountedSimulation = renderer({
    canvas: $("#simulationCanvas"),
    chartCanvas: $("#analysisChart"),
    status: $("#simStatus"),
    variationLabels: Object.fromEntries(
      project.variations.map((variation) => [variation.id, variation.label]),
    ),
    controls: {
      pause: $('[data-control="pause"]'),
      reset: $('[data-control="reset"]'),
      copyLink: $('[data-control="copyLink"]'),
      randomize: $('[data-control="randomize"]'),
      variationButtons: [...document.querySelectorAll("[data-variation]")],
      count: $("#countControl"),
      countValue: $("#countValue"),
      speed: $("#speedControl"),
      speedValue: $("#speedValue"),
      turbulence: $("#turbulenceControl"),
      turbulenceValue: $("#turbulenceValue"),
      attraction: $("#attractionControl"),
      attractionValue: $("#attractionValue"),
      trails: $("#trailsControl"),
      seed: $("#seedControl"),
    },
    metrics: {
      energy: $("#metricEnergy"),
      order: $("#metricOrder"),
      spread: $("#metricSpread"),
    },
    log: $("#simulationLog"),
  });
  controlMount.inert = false;
  if (tools) tools.inert = false;
  canvas.setAttribute("aria-busy", "false");
  canvas.dataset.ready = "true";
  const note = $("#viewport-note");
  if (note && !mountedSimulation?.isRunning?.()) note.hidden = false;
}

function loadScript({ src, integrity }) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.integrity = integrity;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

function loadStyle({ href, integrity }) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.integrity = integrity;
    link.crossOrigin = "anonymous";
    link.onload = resolve;
    link.onerror = reject;
    document.head.append(link);
  });
}

let mathLib = null;
function loadMath() {
  if (!mathLib) {
    mathLib = Promise.all([
      loadStyle(KATEX.css),
      loadScript(KATEX.core).then(() => loadScript(KATEX.autoRender)),
    ])
      .then(() => typeof window.renderMathInElement === "function")
      .catch(() => false);
  }
  return mathLib;
}

async function renderMath(projectId) {
  const ok = await loadMath();
  if (projectId !== currentProjectId) return;
  const list = detailMount.querySelector(".math-list");
  if (!list) return;
  if (!ok) {
    list.hidden = true;
    const note = document.createElement("p");
    note.className = "math-fallback";
    note.textContent = "The equations could not be loaded.";
    list.after(note);
    return;
  }
  window.renderMathInElement(list, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
  });
  list.classList.remove("is-pending");
  // An equation wider than a phone screen scrolls sideways (lab.css): it
  // becomes a Tab stop so keyboard users can scroll it too.
  list.querySelectorAll(".katex-display").forEach((el) => {
    if (el.scrollWidth > el.clientWidth + 1) {
      el.tabIndex = 0;
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", "Equation (scrolls sideways)");
    }
  });
  currentEqEls = [...list.querySelectorAll(".equation")];
  markEquationParts();
  hlIdx = 0;
  hlAccum = 0;
  currentEqEls.forEach((el, i) => el.classList.toggle("eq-active", i === 0));
}

// Tag the right-hand side of each rendered equation (everything after the main
// relation), so the highlight lands on that sub-part instead of the whole box.
function markEquationParts() {
  currentEqEls.forEach((eq) => {
    const html = eq.querySelector(".katex-html");
    if (!html) return;
    [...html.querySelectorAll(".eqk")].forEach((s) =>
      s.classList.remove("eqk"),
    );
    const bases = [...html.children].filter(
      (c) => c.classList && c.classList.contains("base"),
    );
    bases.forEach((base) => {
      const kids = [...base.children].filter(
        (c) => !c.classList || !c.classList.contains("strut"),
      );
      const relIdx = kids.findIndex(
        (k) => k.classList && k.classList.contains("mrel"),
      );
      if (relIdx < 0) return;
      for (let i = relIdx + 1; i < kids.length; i++) {
        if (kids[i].classList) kids[i].classList.add("eqk");
      }
    });
  });
}

// The simulation id in the address bar; malformed escapes read as no id.
function hashId() {
  const raw = location.hash.replace("#", "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// A hash that names an element on this page (the skip link's #viewportMount)
// is in-page navigation, not a simulation route.
function isPageAnchor(id) {
  return Boolean(id) && !findProject(id) && Boolean(document.getElementById(id));
}

function findProject(id) {
  const key = String(id || "");
  return (
    labProjects.find((p) => p.id === key) ||
    labProjects.find((p) => p.id.toLowerCase() === key.toLowerCase()) ||
    null
  );
}

function selectProject(id, updateHash = false) {
  const match = findProject(id);
  const project = match || labProjects[0];
  const unknown = Boolean(id) && !match;
  currentProjectId = project.id;
  // Keep the address bar on the simulation that is showing.
  if (updateHash || unknown || location.hash !== project.route)
    history.replaceState(null, "", project.route);
  if (!projectCards.querySelector(`[data-project-id="${project.id}"]`))
    renderProjectCards(project.id);
  else markSelectedCard(project.id);
  viewportMount.innerHTML = viewportHTML(project);
  detailMount.innerHTML = detailHTML(project);
  controlMount.innerHTML = controlHTML(project);
  if (unknown) {
    const notice = document.createElement("p");
    notice.className = "viewport-caption viewport-notice";
    notice.setAttribute("role", "status");
    notice.textContent = `That simulation is not in the list. Showing Fig. ${figNo(project)}.`;
    viewportMount.querySelector(".viewport-header")?.after(notice);
  }
  currentEqEls = [];
  mountSelectedSimulation(project);
  renderMath(project.id);
  revealActiveCard();
}

function navigateProject(delta) {
  const projects = sortedProjects();
  const idx = Math.max(
    0,
    projects.findIndex((p) => p.id === currentProjectId),
  );
  const next = projects[(idx + delta + projects.length) % projects.length];
  if (currentFilter !== "All") {
    currentFilter = "All";
    renderFilter();
    renderProjectCards(next.id);
  }
  selectProject(next.id, true);
  // Focus follows the move, onto the new figure's title.
  $("#viewport-title")?.focus();
}

function navigateVariation(delta) {
  const buttons = [...document.querySelectorAll("[data-variation]")];
  if (!buttons.length) return;
  const idx = Math.max(
    0,
    buttons.findIndex((button) => button.classList.contains("active")),
  );
  const next = buttons[(idx + delta + buttons.length) % buttons.length];
  next.click();
  next.focus();
}

// Keep the active index entry in view by scrolling ONLY the rail list, never the
// window. (Window-level scrollIntoView is what made the page jump to the top when
// re-selecting.)
function revealActiveCard() {
  const card = projectCards.querySelector(".project-card.active");
  if (!card) return;
  const listRect = projectCards.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  if (cardRect.top < listRect.top) {
    projectCards.scrollTop -= listRect.top - cardRect.top + 40;
  } else if (cardRect.bottom > listRect.bottom) {
    projectCards.scrollTop += cardRect.bottom - listRect.bottom + 8;
  }
}

function tickHighlight() {
  if (!currentEqEls.length) return;
  const sim = mountedSimulation;
  const running = sim?.isRunning ? sim.isRunning() : false;
  const stage = sim?.getStage ? sim.getStage() : -1;
  let idx;
  if (typeof stage === "number" && stage >= 0) {
    idx = stage % currentEqEls.length;
  } else {
    if (!running) return;
    hlAccum += HL_TICK;
    if (hlAccum >= 1500) {
      hlAccum = 0;
      hlIdx = (hlIdx + 1) % currentEqEls.length;
    }
    idx = hlIdx;
  }
  for (let i = 0; i < currentEqEls.length; i++) {
    currentEqEls[i].classList.toggle("eq-active", i === idx);
  }
}

// Shortcuts are scoped to the part of the page they act on and never fire while
// typing, so a single key cannot switch the simulation from anywhere (WCAG 2.1.4).
function shortcutAllowed(event) {
  return !(
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.target.closest("input, textarea, select, [contenteditable]")
  );
}

function boot() {
  if (heroMetrics.projects)
    heroMetrics.projects.textContent = String(labProjects.length);
  // The "live" count only says something when some records are not live yet,
  // so it stays hidden while every simulation runs.
  const liveCount = labProjects.filter(
    (project) => project.status === "live",
  ).length;
  if (heroMetrics.live) heroMetrics.live.textContent = String(liveCount);
  if (heroMetrics.liveStat)
    heroMetrics.liveStat.hidden = liveCount === labProjects.length;

  // Visitors from the Korean CV return to it.
  document.querySelectorAll('a[href^="index.html"]').forEach((link) => {
    if (CV_HREF !== "index.html")
      link.setAttribute("href", link.getAttribute("href").replace("index.html", CV_HREF));
  });

  renderFilter();
  renderProjectCards(null);

  const startId = hashId();
  selectProject(isPageAnchor(startId) ? "" : startId, true);
  setInterval(tickHighlight, HL_TICK);

  window.addEventListener("hashchange", () => {
    const id = hashId();
    if (id === currentProjectId || isPageAnchor(id)) return;
    selectProject(id);
  });

  // On narrow screens the catalog sits below the figure, so choosing an entry
  // there brings the figure into view.
  projectCards.addEventListener("click", (event) => {
    if (!event.target.closest("[data-project-id]")) return;
    if (!window.matchMedia("(max-width: 860px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() =>
      viewportMount.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }),
    );
  });

  projectCards.setAttribute("aria-keyshortcuts", "j k");
  projectCards.addEventListener("keydown", (event) => {
    if (!shortcutAllowed(event)) return;
    if (event.key === "j") navigateProject(1);
    if (event.key === "k") navigateProject(-1);
  });
  controlMount.addEventListener("keydown", (event) => {
    if (!shortcutAllowed(event)) return;
    if (event.key === "]") navigateVariation(1);
    if (event.key === "[") navigateVariation(-1);
  });
}

boot();
