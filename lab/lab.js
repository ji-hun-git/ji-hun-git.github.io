import { labProjects } from "./experiments.js?v=109-20260908r3";

const rendererRegistry = {
  "behavior-prompt-gridworld": () =>
    import("./simulations/gridworld-prompt.js?v=109-20260908r3").then(
      (module) => module.mountGridworldPrompt,
    ),
  "arc-adaptive-unit": () =>
    import("./simulations/arc-adaptive-robot.js?v=109-20260908r3").then(
      (module) => module.mountArcRobot,
    ),
  "double-pendulum": () =>
    import("./simulations/double-pendulum.js?v=109-20260908r3").then(
      (module) => module.mountDoublePendulum,
    ),
  "verlet-cloth": () =>
    import("./simulations/verlet-cloth.js?v=109-20260908r3").then(
      (module) => module.mountVerletCloth,
    ),
  "falling-sand": () =>
    import("./simulations/falling-sand.js?v=109-20260908r3").then(
      (module) => module.mountFallingSand,
    ),
  plinko: () =>
    import("./simulations/plinko.js?v=109-20260908r3").then(
      (module) => module.mountPlinko,
    ),
  "lunar-lander": () =>
    import("./simulations/lunar-lander.js?v=109-20260908r3").then(
      (module) => module.mountLunarLander,
    ),
  "breakout-ai": () =>
    import("./simulations/breakout-ai.js?v=109-20260908r3").then(
      (module) => module.mountBreakoutAI,
    ),
  "tetris-ai": () =>
    import("./simulations/tetris-ai.js?v=109-20260908r3").then(
      (module) => module.mountTetrisAI,
    ),
  "agent-arena": () =>
    import("./simulations/agent-arena.js?v=109-20260908r3").then(
      (module) => module.mountAgentArena,
    ),
  "neuroevolution-flappy": () =>
    import("./simulations/neuroevolution-flappy.js?v=109-20260908r3").then(
      (module) => module.mountNeuroFlappy,
    ),
  "connect-four": () =>
    import("./simulations/connect-four.js?v=109-20260908r3").then(
      (module) => module.mountConnectFour,
    ),
  "game-2048": () =>
    import("./simulations/game-2048.js?v=109-20260908r3").then(
      (module) => module.mountGame2048,
    ),
  minesweeper: () =>
    import("./simulations/minesweeper.js?v=109-20260908r3").then(
      (module) => module.mountMinesweeper,
    ),
  "maze-chase": () =>
    import("./simulations/maze-chase.js?v=109-20260908r3").then(
      (module) => module.mountMazeChase,
    ),
  "snake-growth": () =>
    import("./simulations/snake-swarm.js?v=109-20260908r3").then(
      (module) => module.mountSnakeSwarm,
    ),
  "light-cycle-arena": () =>
    import("./simulations/light-cycle.js?v=109-20260908r3").then(
      (module) => module.mountLightCycle,
    ),
  "frozen-lake": () =>
    import("./simulations/frozen-lake.js?v=109-20260908r3").then(
      (module) => module.mountFrozenLake,
    ),
  "q-learning-gridworld": () =>
    import("./simulations/q-learning.js?v=109-20260908r3").then(
      (module) => module.mountQLearning,
    ),
  "cartpole-control": () =>
    import("./simulations/cartpole.js?v=109-20260908r3").then(
      (module) => module.mountCartpole,
    ),
  "pathfinding-search": () =>
    import("./simulations/pathfinding.js?v=109-20260908r3").then(
      (module) => module.mountPathfinding,
    ),
  "wumpus-world": () =>
    import("./simulations/wumpus.js?v=109-20260908r3").then(
      (module) => module.mountWumpus,
    ),
  "reaction-diffusion": () =>
    import("./simulations/reaction-diffusion.js?v=109-20260908r3").then(
      (module) => module.mountReactionDiffusion,
    ),
  "boids-3d": () =>
    import("./simulations/boids-3d.js?v=109-20260908r3").then(
      (module) => module.mountBoids3d,
    ),
  "optimizer-landscape-3d": () =>
    import("./simulations/terrain-descent-3d.js?v=109-20260908r3").then(
      (module) => module.mountTerrainDescent3d,
    ),
  "nbody-gravity-3d": () =>
    import("./simulations/nbody-3d.js?v=109-20260908r3").then(
      (module) => module.mountNBody3d,
    ),
  "ludic-geometry": () =>
    import("./simulations/ludic-geometry.js?v=109-20260908r3").then(
      (module) => module.mountLudicGeometry,
    ),
  "particle-policy-field": () =>
    import("./simulations/particle-field.js?v=109-20260908r3").then(
      (module) => module.mountParticleField,
    ),
};

const $ = (selector, root = document) => root.querySelector(selector);

// Category -> a muted, earthy hue (RGB triplet) used only as a small wayfinding
// dot in the index and figure tag. All emphasis (active state, math highlight)
// uses the single clay brand accent defined in the stylesheet.
const ACCENTS = {
  "AI Agent": "94, 122, 145",
  "Game AI": "179, 106, 74",
  "Game Prototype": "110, 138, 106",
  Simulation: "124, 110, 150",
  "Math Visualization": "176, 138, 79",
  "Research Tool": "110, 138, 106",
  "Experimental Tool": "124, 110, 150",
};
const accentFor = (category) => ACCENTS[category] || "141, 137, 126";

// The project list is grouped and filterable so the (long) catalog stays tidy.
const GROUP_ORDER = ["Agents", "Games", "Learning", "Physics", "Generative"];
let currentFilter = "All";
let currentProjectId = null;

// Synced math highlight: the equation matching the simulation's current step
// lights up. A sim sets api.stage to drive it; otherwise it auto-cycles through
// the equations while the sim runs.
let currentEqEls = [];
let hlIdx = 0;
let hlAccum = 0;
let hlLast = 0;
const projectCards = $("#projectCards");
const railFilter = $("#railFilter");
const viewportMount = $("#viewportMount");
const detailMount = $("#detailMount");
const controlMount = $("#controlMount");
const heroMetrics = {
  projects: $("#metricProjects"),
  renderers: $("#metricRenderers"),
  live: $("#metricLive"),
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

// Stable catalogue number per sim (01..N), in the grouped reading order. Used
// both as the index entry number and the figure number, so every experiment is
// referable by a fixed "Fig. N" the way a paper numbers its figures.
const FIG_NUM = new Map(sortedProjects().map((p, i) => [p.id, i + 1]));
const figNo = (project) =>
  String(FIG_NUM.get(project.id) || 0).padStart(2, "0");

function cardHTML(project, selectedId) {
  return `
    <button class="project-card ${project.id === selectedId ? "active" : ""}" type="button" data-project-id="${project.id}" data-category="${project.category}" style="--accent: ${accentFor(project.category)}">
      <span class="card-index">${figNo(project)}</span>
      <span class="card-body">
        <span class="status-line">
          <span class="card-kicker">${project.category}</span>
          ${project.status === "live" ? `<span class="badge live">Live</span>` : ""}
        </span>
        <h2>${project.title}</h2>
        <p>${project.description}</p>
      </span>
    </button>`;
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
        `<button class="chip ${g === currentFilter ? "active" : ""}" type="button" data-filter="${g}">${g}<span class="chip-n">${g === "All" ? labProjects.length : counts[g] || 0}</span></button>`,
    )
    .join("");
  railFilter.querySelectorAll("[data-filter]").forEach((b) => {
    b.addEventListener("click", () => {
      currentFilter = b.dataset.filter;
      renderFilter();
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
    if (currentFilter === "All" && p.group !== lastGroup) {
      html += `<div class="rail-group">${p.group}</div>`;
      lastGroup = p.group;
    }
    html += cardHTML(p, selectedId);
  }
  projectCards.innerHTML = html;
  projectCards.querySelectorAll("[data-project-id]").forEach((card) => {
    card.addEventListener("click", () =>
      selectProject(card.dataset.projectId, true),
    );
  });
}

// CENTER - top: the figure (live simulation) with a journal-style caption.
function viewportHTML(project) {
  const canRender = Boolean(rendererRegistry[project.id]);
  const n = figNo(project);
  return `
    <figure class="viewport-panel" aria-labelledby="viewport-title">
      <figcaption class="viewport-header">
        <div>
          <span class="kicker">Figure ${n} &middot; ${project.category}</span>
          <h3 id="viewport-title">${project.title}</h3>
        </div>
        <div class="viewport-tools">
          <button class="text-button" type="button" data-control="pause">Pause</button>
          <button class="text-button" type="button" data-control="reset">Reset</button>
          <button class="text-button" type="button" data-control="copyLink">Copy link</button>
        </div>
      </figcaption>
      ${
        canRender
          ? `<div class="viewport-stage"><canvas id="simulationCanvas" aria-label="${project.title} simulation"></canvas></div>
           <p class="viewport-caption"><b>Fig. ${n}.</b> ${project.subtitle}. ${project.simulationType}; adjust parameters in the Controls panel and switch regimes with the mode buttons.</p>`
          : `<div class="empty-stage"><div><strong>${project.title} is registered.</strong><br />A renderer module will activate this figure.</div></div>`
      }
    </figure>
  `;
}

// CENTER - bottom: live signals, the synced math, and the detail.
function detailHTML(project) {
  const canRender = Boolean(rendererRegistry[project.id]);
  const metricLabels = project.metricLabels;
  return `
    <section class="panel panel-signals" aria-labelledby="analysis-title">
      <div class="analysis-header">
        <div>
          <span class="kicker">Measurements</span>
          <h3 id="analysis-title">Runtime signals</h3>
        </div>
        <span class="badge ${project.status === "live" ? "live" : ""}">${project.status === "live" ? "Live" : statusLabel(project.status)}</span>
      </div>
      <div class="analysis-grid">
        <div class="chart-wrap">
          ${canRender ? `<canvas id="analysisChart" aria-label="Live metric chart"></canvas>` : `<div class="empty-stage">Metrics will mount here.</div>`}
        </div>
        <div>
          <div class="metric-grid">
            <div class="metric"><span>${metricLabels.energy}</span><strong id="metricEnergy">0.00</strong></div>
            <div class="metric"><span>${metricLabels.order}</span><strong id="metricOrder">0.00</strong></div>
            <div class="metric"><span>${metricLabels.spread}</span><strong id="metricSpread">0.00</strong></div>
            <div class="metric"><span>${metricLabels.fps}</span><strong id="metricFps">0</strong></div>
          </div>
          <ul class="log-list" id="simulationLog" aria-live="polite">
            <li>Simulation log is ready.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="panel panel-math" aria-labelledby="math-title">
      <span class="kicker">Model &middot; the lit term tracks the current step</span>
      <h3 id="math-title">${project.mathTopics.join(" &middot; ")}</h3>
      <div class="math-list">
        ${project.equations.map((equation) => `<div class="equation">\\[${equation}\\]</div>`).join("")}
      </div>
    </section>

    <section class="panel panel-about" aria-labelledby="overview-title">
      <span class="kicker">Description</span>
      <h3 id="overview-title">${project.subtitle}</h3>
      <div class="overview-copy">
        ${project.overview.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </div>
      <div class="facts-grid">
        ${project.facts.map((fact) => `<div class="fact"><span>${fact.label}</span><strong>${fact.value}</strong></div>`).join("")}
      </div>
    </section>

    <section class="panel panel-future" aria-labelledby="future-title">
      <span class="kicker">Notes</span>
      <h3 id="future-title">Extensions</h3>
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
      <div>
        <span class="kicker">Controls</span>
        <h3 id="controls-title">Parameters</h3>
      </div>
    </div>
    <div class="controls">
      ${canRender ? controlsTemplate(project) : placeholderControlsTemplate(project)}
    </div>
  `;
}

function controlsTemplate(project) {
  const labels = project.controlLabels;
  return `
    <div class="preset-row">
      ${project.variations
        .map(
          (variation, index) => `
        <button class="ghost-button ${index === 0 ? "active" : ""}" type="button" data-variation="${variation.id}" title="${variation.description}">
          ${variation.label}
        </button>
      `,
        )
        .join("")}
    </div>

    <!-- for= is required here, not decorative. A <label> binds to its first
         LABELABLE descendant, and <output> is labelable - so the <output> in
         .control-row was claiming the label and every slider was reaching the
         accessibility tree with no name at all ("slider", value only). An
         explicit for= overrides that and points the name at the input. -->
    <label class="control" for="countControl">
      <span class="control-row"><span>${labels.count}</span><output id="countValue">180</output></span>
      <input id="countControl" name="count" type="range" min="48" max="360" step="4" value="180" />
    </label>
    <label class="control" for="speedControl">
      <span class="control-row"><span>${labels.speed}</span><output id="speedValue">1.80</output></span>
      <input id="speedControl" name="speed" type="range" min="0.4" max="3.4" step="0.05" value="1.8" />
    </label>
    <label class="control" for="turbulenceControl">
      <span class="control-row"><span>${labels.turbulence}</span><output id="turbulenceValue">0.35</output></span>
      <input id="turbulenceControl" name="turbulence" type="range" min="0" max="1.2" step="0.01" value="0.35" />
    </label>
    <label class="control" for="attractionControl">
      <span class="control-row"><span>${labels.attraction}</span><output id="attractionValue">0.22</output></span>
      <input id="attractionControl" name="attraction" type="range" min="0" max="0.9" step="0.01" value="0.22" />
    </label>
    <label class="toggle">
      <span>${labels.trails}</span>
      <input id="trailsControl" type="checkbox" checked />
    </label>
    <label class="control" for="seedControl">
      <span class="control-row"><span>Seed</span><output id="seedValue">42</output></span>
      <input id="seedControl" type="number" min="1" max="999999" value="42" />
    </label>
    <button class="outline-button" type="button" data-control="randomize">Randomize seed</button>
  `;
}

function placeholderControlsTemplate(project) {
  return `
    <p class="overview-copy">${project.title} already has its description, model, and notes. A renderer module will activate these controls.</p>
    <button class="outline-button" type="button" disabled>Renderer pending</button>
  `;
}

let mountRevision = 0;
async function mountSelectedSimulation(project) {
  const revision = ++mountRevision;
  mountedSimulation?.dispose?.();
  mountedSimulation = null;

  const copyLink = $('[data-control="copyLink"]');
  if (copyLink) {
    copyLink.addEventListener(
      "click",
      async () => {
        const url = `${location.origin}${location.pathname}${project.route}`;
        try {
          await navigator.clipboard.writeText(url);
          copyLink.textContent = "Copied";
          setTimeout(() => {
            copyLink.textContent = "Copy link";
          }, 1300);
        } catch {
          copyLink.textContent = "Link ready";
          setTimeout(() => {
            copyLink.textContent = "Copy link";
          }, 1300);
        }
      },
      { once: false },
    );
  }

  const load = rendererRegistry[project.id];
  if (!load) return;
  const canvas = $("#simulationCanvas");
  canvas.setAttribute("aria-busy", "true");
  let renderer;
  try {
    renderer = await load();
  } catch {
    if (revision !== mountRevision) return;
    const error = document.createElement("div");
    error.className = "load-error";
    error.setAttribute("role", "alert");
    error.textContent = "This simulation could not be loaded. ";
    const retry = document.createElement("button");
    retry.textContent = "Try again";
    retry.addEventListener("click", () => location.reload());
    error.append(retry);
    canvas.after(error);
    canvas.setAttribute("aria-busy", "false");
    return;
  }
  if (revision !== mountRevision) return;

  mountedSimulation = renderer({
    canvas: $("#simulationCanvas"),
    chartCanvas: $("#analysisChart"),
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
      seedValue: $("#seedValue"),
    },
    metrics: {
      energy: $("#metricEnergy"),
      order: $("#metricOrder"),
      spread: $("#metricSpread"),
      fps: $("#metricFps"),
    },
    log: $("#simulationLog"),
  });
  canvas.setAttribute("aria-busy", "false");
  canvas.dataset.ready = "true";
}

function renderMath() {
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }
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

function selectProject(id, updateHash = false) {
  const project = labProjects.find((item) => item.id === id) || labProjects[0];
  currentProjectId = project.id;
  if (updateHash) history.replaceState(null, "", project.route);
  renderProjectCards(project.id);
  const accent = accentFor(project.category);
  viewportMount.style.setProperty("--accent", accent);
  detailMount.style.setProperty("--accent", accent);
  controlMount.style.setProperty("--accent", accent);
  viewportMount.innerHTML = viewportHTML(project);
  detailMount.innerHTML = detailHTML(project);
  controlMount.innerHTML = controlHTML(project);
  mountSelectedSimulation(project);
  renderMath();
  currentEqEls = [...detailMount.querySelectorAll(".equation")];
  markEquationParts();
  hlIdx = 0;
  hlAccum = 0;
  currentEqEls.forEach((el, i) => el.classList.toggle("eq-active", i === 0));
  revealActiveCard();
}

function navigateProject(delta) {
  const projects = sortedProjects();
  const idx = Math.max(
    0,
    projects.findIndex((p) => p.id === currentProjectId),
  );
  const next = projects[(idx + delta + projects.length) % projects.length];
  currentFilter = "All";
  renderFilter();
  selectProject(next.id, true);
}

function navigateVariation(delta) {
  const buttons = [...document.querySelectorAll("[data-variation]")];
  if (!buttons.length) return;
  const idx = Math.max(
    0,
    buttons.findIndex((button) => button.classList.contains("active")),
  );
  buttons[(idx + delta + buttons.length) % buttons.length].click();
}

// Keep the active index entry in view by scrolling ONLY the rail list, never the
// window. (Window-level scrollIntoView is what made the page jump to the top when
// re-selecting; controls live in a non-scrollable sticky panel.)
function revealActiveCard() {
  const card = projectCards.querySelector(".project-card.active");
  if (!card) return;
  const listRect = projectCards.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  if (cardRect.top < listRect.top) {
    projectCards.scrollTop -= listRect.top - cardRect.top + 8;
  } else if (cardRect.bottom > listRect.bottom) {
    projectCards.scrollTop += cardRect.bottom - listRect.bottom + 8;
  }
}

function highlightLoop(ts) {
  if (currentEqEls.length) {
    const sim = mountedSimulation;
    const running = sim && sim.isRunning ? sim.isRunning() : true;
    const stage = sim && sim.getStage ? sim.getStage() : -1;
    let idx;
    if (typeof stage === "number" && stage >= 0) {
      idx = stage % currentEqEls.length;
    } else {
      const dt = hlLast ? ts - hlLast : 0;
      if (running) hlAccum += dt;
      if (hlAccum > 1500) {
        hlAccum = 0;
        hlIdx = (hlIdx + 1) % currentEqEls.length;
      }
      idx = hlIdx;
    }
    for (let i = 0; i < currentEqEls.length; i++) {
      currentEqEls[i].classList.toggle("eq-active", i === idx);
    }
  }
  hlLast = ts;
  requestAnimationFrame(highlightLoop);
}

function boot() {
  if (heroMetrics.projects)
    heroMetrics.projects.textContent = String(labProjects.length);
  if (heroMetrics.renderers)
    heroMetrics.renderers.textContent = String(
      Object.keys(rendererRegistry).length,
    );
  if (heroMetrics.live)
    heroMetrics.live.textContent = String(
      labProjects.filter((project) => project.status === "live").length,
    );

  renderFilter();

  selectProject(location.hash.replace("#", "") || labProjects[0].id);
  requestAnimationFrame(highlightLoop);

  window.addEventListener("hashchange", () => {
    selectProject(location.hash.replace("#", "") || labProjects[0].id);
  });

  window.addEventListener("keydown", (event) => {
    const tag = (event.target.tagName || "").toLowerCase();
    if (
      tag === "input" ||
      tag === "textarea" ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    if (event.key === "j") navigateProject(1);
    if (event.key === "k") navigateProject(-1);
    if (event.key === "]") navigateVariation(1);
    if (event.key === "[") navigateVariation(-1);
  });
}

boot();
