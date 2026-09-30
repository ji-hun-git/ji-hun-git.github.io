/**
 * Shared toolkit for the simulations on laboratory.html.
 *
 * `createSimHarness` owns everything the page expects from a simulation:
 * control wiring, readouts, mode switching, the requestAnimationFrame loop,
 * chart and metric cadence, and a clean dispose.
 *
 * A simulation provides reset / step / draw callbacks that read `api.state`
 * (the generic control set) and push three normalized signals
 * (energy / order / spread) per step. It can also provide `controlFormat`, one
 * function per slider that returns the value the model actually uses, so the
 * readout never shows a raw slider position that the model rescales.
 */

export const TAU = Math.PI * 2;

export function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

/** Frames between two ticks for the common "base / speed" pacing. */
export function framesPerTick(base, speed, min, max) {
  return clamp(Math.round(base / Math.max(0.2, speed)), min, max);
}

/** Small helpers for controlFormat readouts. */
export const fmt = {
  every: (frames) => (frames === 1 ? "every frame" : `every ${frames} frames`),
  steps: (n) => `${n} step${n === 1 ? "" : "s"}/frame`,
  pct: (x) => `${Math.round(x * 100)}%`,
  fixed: (x, digits = 2) => Number(x).toFixed(digits),
  times: (x) => `${Number(x).toFixed(2)}×`,
  grid: (w, h = w) => `${w}×${h}`,
  count: (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
};

// The three chart series differ by line style as well as colour (WCAG 1.4.1).
export const SERIES_DASH = [[], [6, 3], [2, 3]];

/** Draw a single normalized (0..1) series as a polyline filling the chart box. */
export function metricLine(ctx, values, color, height, width, scale, dash) {
  if (!values || values.length < 2) return;
  const f = scale || ((v) => clamp(v, 0, 1));
  ctx.save();
  ctx.setLineDash(dash || []);
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - f(value) * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/**
 * Pinhole 3D → 2D projection with yaw + pitch camera orbit.
 * cam: { yaw, pitch, dist, fov }. Returns screen point, depth, and scale.
 */
export function project3d(p, cam, w, h) {
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);
  let x = p.x * cy - p.z * sy;
  let z = p.x * sy + p.z * cy;
  let y = p.y;
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const y2 = y * cp - z * sp;
  const z2 = y * sp + z * cp;
  y = y2;
  z = z2 + cam.dist;
  const f = (cam.fov || h * 0.9) / Math.max(0.0001, z);
  return { sx: w / 2 + x * f, sy: h / 2 - y * f, depth: z, scale: f };
}

function writeLog(logEl, message) {
  if (!logEl) return;
  const line = document.createElement("li");
  // A fixed locale and 24-hour clock, so the English log never mixes in the
  // viewer's own time format.
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  line.textContent = `${time} · ${message}`;
  logEl.prepend(line);
  while (logEl.children.length > 6) logEl.lastElementChild.remove();
}

function setText(el, text) {
  if (el && el.textContent !== text) el.textContent = text;
}

const DEFAULT_COLORS = ["rgba(96, 165, 250, 0.95)", "rgba(52, 211, 153, 0.95)", "rgba(244, 114, 182, 0.95)"];

/**
 * @param {Object} refs   { canvas, chartCanvas, controls, metrics, log, status, variationLabels }
 * @param {Object} config simulation hooks + presets, see comments in callers
 */
export function createSimHarness(refs, config) {
  const { canvas, chartCanvas, controls, metrics, log, status } = refs;
  const variationLabels = refs.variationLabels || {};
  const ctx = canvas.getContext("2d", { alpha: true });
  const chartCtx = chartCanvas ? chartCanvas.getContext("2d", { alpha: true }) : null;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seedDefault = config.seedDefault || 1;
  const colors = config.chartColors || DEFAULT_COLORS;
  // Start on the simulation's declared first variation when it has a button;
  // syncLabels() then marks that same button active.
  const variationIds = controls.variationButtons.map((button) => button.dataset.variation);
  const startVariation = variationIds.includes(config.firstVariation)
    ? config.firstVariation
    : variationIds[0] || config.firstVariation || "";

  let gen = mulberry32(seedDefault);
  // Under reduced motion every simulation starts paused on a drawn first frame.
  let running = !prefersReduced;
  let raf = 0;
  let visible = true;
  let lastStageKey = "";

  const validSeed = (value) => {
    const v = Math.round(Number(value));
    return Number.isFinite(v) && v >= 1 ? Math.min(v, 999999) : 0;
  };

  const api = {
    ctx,
    chartCtx,
    w: 0,
    h: 0,
    dpr: 1,
    chartW: 0,
    chartH: 220,
    frame: 0,
    pointer: null,
    state: {
      count: Number(controls.count.value),
      speed: Number(controls.speed.value),
      turbulence: Number(controls.turbulence.value),
      attraction: Number(controls.attraction.value),
      trails: controls.trails.checked,
      seed: validSeed(controls.seed.value) || seedDefault,
      variation: startVariation
    },
    series: { energy: [], order: [], spread: [] },
    custom: {},
    // `stage` is the index of the equation that is currently most relevant.
    // Sims set it each tick; the lab highlights that equation in sync. -1 = let
    // the page auto-cycle through the equations while the sim runs.
    stage: -1,
    /** The visible name of a mode (its button label), for canvas and log text. */
    variationLabel(id = api.state.variation) {
      return variationLabels[id] || id;
    },
    reseed(s) {
      gen = mulberry32((s || 0) >>> 0);
    },
    rand() {
      return gen();
    },
    range(min, max) {
      return min + gen() * (max - min);
    },
    log(message) {
      writeLog(log, message);
    },
    push(e, o, s) {
      api.series.energy.push(clamp(e, 0, 1));
      api.series.order.push(clamp(o, 0, 1));
      api.series.spread.push(clamp(s, 0, 1));
      for (const key of ["energy", "order", "spread"]) {
        if (api.series[key].length > 120) api.series[key].shift();
      }
    },
    get running() {
      return running;
    }
  };

  // One short status message for screen readers, only on user actions (the
  // visual log is not a live region; it updates too often to be read aloud).
  function announce(message) {
    if (status) status.textContent = message;
  }

  function syncLabels() {
    const cf = config.controlFormat || {};
    for (const key of ["count", "speed", "turbulence", "attraction"]) {
      // No formatter means no honest mapping: the slider stays, the number goes.
      setText(controls[`${key}Value`], cf[key] ? String(cf[key](api.state[key], api)) : "");
    }
    // The label swap is the state; no aria-pressed on top of it.
    setText(controls.pause, running ? "Pause" : "Run");
    controls.variationButtons.forEach((button) => {
      const on = button.dataset.variation === api.state.variation;
      button.classList.toggle("active", on);
      button.setAttribute("aria-pressed", String(on));
    });
  }

  function stageKey() {
    const rect = canvas.parentElement.getBoundingClientRect();
    return `${Math.round(rect.width)}x${Math.round(rect.height)}`;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    // No 320px floor: the stage is ~294px wide at a 360px viewport, so a
    // forced 320 pushed the grid column past the page and the right edge of
    // every simulation was clipped. lab.css sizes the canvas at width:100%;
    // canvas.width/height (device pixels) and the dpr transform set the
    // rendering resolution.
    api.w = Math.max(1, rect.width);
    api.h = Math.max(260, rect.height);
    api.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(api.w * api.dpr);
    canvas.height = Math.floor(api.h * api.dpr);
    ctx.setTransform(api.dpr, 0, 0, api.dpr, 0, 0);

    if (chartCanvas && chartCtx) {
      const chartRect = chartCanvas.parentElement.getBoundingClientRect();
      api.chartW = Math.max(240, chartRect.width);
      api.chartH = 220;
      chartCanvas.width = Math.floor(api.chartW * api.dpr);
      chartCanvas.height = Math.floor(api.chartH * api.dpr);
      chartCanvas.style.width = `${api.chartW}px`;
      chartCanvas.style.height = `${api.chartH}px`;
      chartCtx.setTransform(api.dpr, 0, 0, api.dpr, 0, 0);
    }
  }

  function drawChart() {
    if (!chartCtx) return;
    const W = api.chartW;
    const H = api.chartH;
    chartCtx.clearRect(0, 0, W, H);
    chartCtx.fillStyle = "rgba(10, 11, 19, 0.55)";
    chartCtx.fillRect(0, 0, W, H);
    chartCtx.strokeStyle = "rgba(255,255,255,0.06)";
    chartCtx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (H / 4) * i;
      chartCtx.beginPath();
      chartCtx.moveTo(0, y);
      chartCtx.lineTo(W, y);
      chartCtx.stroke();
    }
    const scales = config.chartScales || [];
    ["energy", "order", "spread"].forEach((key, i) => {
      metricLine(chartCtx, api.series[key], colors[i], H, W, scales[i], SERIES_DASH[i]);
    });
  }

  function updateMetrics() {
    const last = (key) => api.series[key][api.series[key].length - 1] || 0;
    const mf = config.metricFormat || {};
    for (const key of ["energy", "order", "spread"]) {
      setText(metrics[key], mf[key] ? mf[key](last(key), api) : last(key).toFixed(2));
    }
  }

  // Draw the current state without advancing it: after a reset, a resize, or
  // a change while paused, the figure always shows something.
  function paint() {
    config.draw(api);
    drawChart();
    updateMetrics();
  }

  function reset() {
    api.reseed(api.state.seed);
    api.frame = 0;
    api.series.energy.length = 0;
    api.series.order.length = 0;
    api.series.spread.length = 0;
    ctx.clearRect(0, 0, api.w, api.h);
    config.reset(api);
    paint();
  }

  // The loop runs only while the simulation is running, the tab is visible and
  // the figure is on screen; kick() restarts it when any of those change.
  function loop() {
    raf = 0;
    if (!running || document.hidden || !visible) return;
    api.frame += 1;
    config.step(api);
    config.draw(api);
    if (api.frame % 2 === 0) drawChart();
    if (api.frame % 8 === 0) updateMetrics();
    raf = requestAnimationFrame(loop);
  }

  function kick() {
    if (!raf && running && !document.hidden && visible) raf = requestAnimationFrame(loop);
  }

  function applyControl(event) {
    const target = event.currentTarget;
    if (target === controls.trails) {
      api.state.trails = controls.trails.checked;
      syncLabels();
      config.onTrails?.(api);
      if (!running) paint();
      return;
    }
    if (target === controls.seed) {
      api.state.seed = validSeed(controls.seed.value) || api.state.seed;
      controls.seed.value = String(api.state.seed);
      syncLabels();
      reset();
      return;
    }
    api.state[target.name] = Number(target.value);
    syncLabels();
    // `resetOn` lists sliders that set initial conditions (a start spread, a
    // density), so moving them rebuilds the world instead of waiting for Reset.
    if ((target.name === "count" && !config.liveCount) || config.resetOn?.includes(target.name)) reset();
    else if (!running) paint();
  }

  function randomizeSeed() {
    api.state.seed = Math.floor(Math.random() * 90000) + 10000;
    controls.seed.value = String(api.state.seed);
    syncLabels();
    reset();
    announce(`Seed ${api.state.seed}`);
  }

  function resetClick() {
    reset();
    announce("Reset");
  }

  function applyPreset(name) {
    const preset = config.presets?.[name];
    if (!preset) return;
    Object.assign(api.state, preset);
    controls.count.value = api.state.count;
    controls.speed.value = api.state.speed;
    controls.turbulence.value = api.state.turbulence;
    controls.attraction.value = api.state.attraction;
    controls.trails.checked = api.state.trails;
  }

  function setVariation(name) {
    api.state.variation = name;
    applyPreset(name);
    syncLabels();
    reset();
    announce(`Mode: ${api.variationLabel(name)}`);
  }

  const variationClick = (event) => setVariation(event.currentTarget.dataset.variation);

  function togglePause() {
    running = !running;
    syncLabels();
    api.log(running ? "Resumed." : "Paused.");
    announce(running ? "Running" : "Paused");
    kick();
  }

  function pointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    api.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function pointerLeave() {
    api.pointer = null;
  }

  // Keyboard stand-in for the cursor on simulations that react to it: arrow
  // keys move a virtual pointer (starting at the centre), Escape removes it.
  function pointerKeys(event) {
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (event.key === "Escape") {
      if (api.pointer) {
        api.pointer = null;
        event.preventDefault();
      }
      return;
    }
    const move = moves[event.key];
    if (!move || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const from = api.pointer || { x: api.w / 2, y: api.h / 2 };
    api.pointer = {
      x: clamp(from.x + move[0] * 16, 0, api.w),
      y: clamp(from.y + move[1] * 16, 0, api.h)
    };
    if (!running) paint();
  }

  function onVisibility() {
    kick();
  }

  controls.count.addEventListener("input", applyControl);
  controls.speed.addEventListener("input", applyControl);
  controls.turbulence.addEventListener("input", applyControl);
  controls.attraction.addEventListener("input", applyControl);
  controls.seed.addEventListener("change", applyControl);
  controls.trails.addEventListener("change", applyControl);
  controls.randomize.addEventListener("click", randomizeSeed);
  controls.reset.addEventListener("click", resetClick);
  controls.pause.addEventListener("click", togglePause);
  controls.variationButtons.forEach((button) => button.addEventListener("click", variationClick));
  if (config.usePointer) {
    canvas.addEventListener("pointermove", pointerMove, { passive: true });
    canvas.addEventListener("pointerleave", pointerLeave);
    canvas.tabIndex = 0;
    canvas.dataset.pointer = "";
    canvas.addEventListener("keydown", pointerKeys);
    canvas.addEventListener("blur", pointerLeave);
  }
  document.addEventListener("visibilitychange", onVisibility);

  // Series swatches next to the metric labels: the same colour and line style
  // as the chart lines.
  ["energy", "order", "spread"].forEach((key, i) => {
    const tile = metrics[key]?.parentElement;
    if (!tile) return;
    tile.style.setProperty("--series", colors[i]);
    tile.dataset.series = String(i);
  });

  // Resize on every observed change (the chart's parent is watched too), but
  // rebuild the world only when the stage itself changed size.
  const resizeObserver = new ResizeObserver(() => {
    const key = stageKey();
    resize();
    if (key !== lastStageKey) {
      lastStageKey = key;
      reset();
    } else {
      paint();
    }
  });
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    kick();
  });

  // First paint: apply the preset for the initial variation so the controls and
  // the world agree from frame zero.
  resize();
  lastStageKey = stageKey();
  applyPreset(api.state.variation);
  syncLabels();
  reset();
  resizeObserver.observe(canvas.parentElement);
  if (chartCanvas) resizeObserver.observe(chartCanvas.parentElement);
  intersection.observe(canvas);
  kick();

  return {
    getStage: () => api.stage,
    isRunning: () => running,
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      running = false;
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      controls.count.removeEventListener("input", applyControl);
      controls.speed.removeEventListener("input", applyControl);
      controls.turbulence.removeEventListener("input", applyControl);
      controls.attraction.removeEventListener("input", applyControl);
      controls.seed.removeEventListener("change", applyControl);
      controls.trails.removeEventListener("change", applyControl);
      controls.randomize.removeEventListener("click", randomizeSeed);
      controls.reset.removeEventListener("click", resetClick);
      controls.pause.removeEventListener("click", togglePause);
      controls.variationButtons.forEach((button) => button.removeEventListener("click", variationClick));
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerleave", pointerLeave);
      canvas.removeEventListener("keydown", pointerKeys);
      canvas.removeEventListener("blur", pointerLeave);
      config.dispose?.(api);
    }
  };
}
