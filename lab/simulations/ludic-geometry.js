/**
 * Ludic Geometry Notebook: parametric sketches (orbits, rose curves, wave
 * interference, a decision boundary, and a chaotic map).
 *
 * Each step computes the sample points for the current time and three simple
 * shape measures; draw renders the stored points. Runs on the shared harness.
 */

import { createSimHarness, clamp, TAU } from "./_shared.js?v=115-20260930a";

export function mountLudicGeometry(refs) {
  function samplePoint(api, index, t) {
    const w = api.custom;
    const { state } = api;
    const width = api.w;
    const height = api.h;
    const n = Math.max(1, state.count - 1);
    const u = index / n;
    const phase = w.phases[index] || 0;
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.36;

    if (state.variation === "rose") {
      const theta = u * TAU * (2.5 + state.attraction * 3.5);
      const k = 3 + Math.round(state.attraction * 5);
      const r = scale * (0.22 + 0.76 * Math.abs(Math.cos(k * theta + t + phase * 0.08)));
      return {
        x: cx + Math.cos(theta) * r + Math.sin(t * 1.7 + phase) * state.turbulence * 18,
        y: cy + Math.sin(theta) * r + Math.cos(t * 1.3 + phase) * state.turbulence * 18
      };
    }

    if (state.variation === "interference") {
      const cols = Math.ceil(Math.sqrt(state.count));
      const gx = (index % cols) / Math.max(1, cols - 1);
      const gy = Math.floor(index / cols) / Math.max(1, cols - 1);
      const x = width * (0.12 + gx * 0.76);
      const yBase = height * (0.14 + gy * 0.72);
      const wave =
        Math.sin(gx * TAU * 3 + t * 1.8) +
        Math.cos(gy * TAU * 4 - t * 1.4 + phase) +
        Math.sin((gx + gy) * TAU * 2 + t);
      return { x, y: yBase + wave * (10 + state.turbulence * 34) };
    }

    if (state.variation === "boundary") {
      const classA = index % 2 === 0;
      const theta = u * TAU * 5 + phase * 0.1;
      const radius = scale * (0.18 + (index % 19) / 22);
      const drift = Math.sin(t + phase) * state.turbulence * 38;
      return {
        x: cx + (classA ? -scale * 0.46 : scale * 0.46) + Math.cos(theta) * radius * 0.34 + drift,
        y: cy + Math.sin(theta) * radius * 0.46 + Math.cos(t * 0.7 + phase) * state.attraction * 40,
        classA
      };
    }

    if (state.variation === "chaos") {
      let x = Math.sin(phase + t * 0.6);
      let y = Math.cos(phase * 1.7 - t * 0.4);
      const a = 1.4 + state.attraction;
      const b = -2.3 + state.turbulence;
      const c = 2.4 - state.attraction * 0.7;
      const d = -2.1 + state.turbulence * 0.5;
      for (let j = 0; j < 12 + (index % 7); j++) {
        const nx = Math.sin(a * y) + c * Math.cos(a * x);
        const ny = Math.sin(b * x) + d * Math.cos(b * y);
        x = nx;
        y = ny;
      }
      return { x: cx + x * scale * 0.32, y: cy + y * scale * 0.32 };
    }

    const ring = 0.28 + (index % 9) * 0.052;
    const theta = u * TAU * 3 + t * (0.6 + state.attraction) + phase * 0.18;
    const wobble = Math.sin(theta * 2.3 + t + phase) * state.turbulence * scale * 0.18;
    return {
      x: cx + Math.cos(theta) * scale * ring + Math.cos(theta * 2 + t) * wobble,
      y: cy + Math.sin(theta * 1.37) * scale * ring + Math.sin(theta * 3 - t) * wobble
    };
  }

  // Compute the points for the current time and the three shape measures.
  function sample(api) {
    const w = api.custom;
    const { state } = api;
    const cx = api.w / 2;
    const cy = api.h / 2;
    let last = null;
    let curvature = 0;
    let symmetryX = 0;
    let coverage = 0;
    w.points = [];
    for (let i = 0; i < state.count; i++) {
      const p = samplePoint(api, i, w.time);
      w.points.push(p);
      if (last && state.variation !== "interference") {
        curvature += Math.abs(Math.atan2(p.y - last.y, p.x - last.x));
      }
      last = p;
      symmetryX += 1 - clamp(Math.abs(p.x - (api.w - p.x)) / api.w, 0, 1);
      coverage += clamp(Math.hypot(p.x - cx, p.y - cy) / Math.hypot(cx, cy), 0, 1);
    }
    const n = Math.max(1, state.count);
    return [clamp((curvature / n) % 1.2, 0, 1), clamp(symmetryX / n, 0, 1), clamp(coverage / n, 0, 1)];
  }

  function reset(api) {
    const w = api.custom;
    w.time = 0;
    w.phases = Array.from({ length: api.state.count }, () => api.rand() * TAU);
    sample(api);
    api.log(`${api.variationLabel()} sketch with ${api.state.count} samples.`);
  }

  function step(api) {
    const w = api.custom;
    w.time += 0.01 * api.state.speed;
    api.push(...sample(api));
  }

  function drawBoundary(api) {
    const { ctx, state } = api;
    if (state.variation !== "boundary") return;
    ctx.save();
    ctx.strokeStyle = "rgba(246, 211, 107, 0.42)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([7, 8]);
    ctx.beginPath();
    for (let x = api.w * 0.12; x <= api.w * 0.88; x += 12) {
      const nx = (x / api.w - 0.5) * 2;
      const y = api.h / 2 + Math.sin(nx * 4 + api.custom.time) * 50 * state.attraction;
      if (x === api.w * 0.12) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function draw(api) {
    const { ctx, custom: w, state } = api;
    const fade = state.trails ? (state.variation === "chaos" ? 0.08 : 0.14) : 0.96;
    ctx.fillStyle = `rgba(5, 8, 13, ${fade})`;
    ctx.fillRect(0, 0, api.w, api.h);
    drawBoundary(api);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    let last = null;
    (w.points || []).forEach((p, i) => {
      const hue = state.variation === "boundary"
        ? (p.classA ? 198 : 42)
        : state.variation === "chaos"
          ? 285 + (i % 32)
          : 170 + (i % 72);
      const alpha = state.variation === "interference" ? 0.46 : 0.62;
      ctx.fillStyle = `hsla(${hue}, 88%, 66%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, state.variation === "interference" ? 1.6 : 2.2, 0, TAU);
      ctx.fill();
      if (last && state.variation !== "interference") {
        ctx.strokeStyle = `hsla(${hue}, 84%, 65%, 0.18)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      last = p;
    });
    ctx.restore();
  }

  // What Distortion and Coupling do depends on the mode, so the readout names
  // the parameter each one sets in the current mode.
  function distortionText(v, api) {
    switch (api.state.variation) {
      case "rose": return `±${Math.round(v * 18)} px wobble`;
      case "interference": return `${Math.round(10 + v * 34)} px amplitude`;
      case "boundary": return `±${Math.round(v * 38)} px drift`;
      // A true minus sign (U+2212), not a hyphen, for negative values.
      case "chaos": return `b = ${(-2.3 + v).toFixed(2).replace("-", "−")}`;
      default: return `${Math.round(v * 18)}% wobble`;
    }
  }

  function couplingText(v, api) {
    switch (api.state.variation) {
      case "rose": return `k = ${3 + Math.round(v * 5)}`;
      case "interference": return "not used";
      case "boundary": return `±${Math.round(v * 50)} px boundary`;
      case "chaos": return `a = ${(1.4 + v).toFixed(2)}`;
      default: return `${(0.6 + v).toFixed(2)}× orbit rate`;
    }
  }

  return createSimHarness(refs, {
    seedDefault: 314,
    firstVariation: "orbit",
    chartColors: ["rgba(255, 147, 199, 0.95)", "rgba(126, 231, 189, 0.95)", "rgba(120, 210, 255, 0.95)"],
    metricFormat: {
      energy: (v) => v.toFixed(2),
      order: (v) => v.toFixed(2),
      spread: (v) => v.toFixed(2)
    },
    controlFormat: {
      count: (v) => `${v} points`,
      speed: (v) => `${v.toFixed(2)}×`,
      turbulence: distortionText,
      attraction: couplingText
    },
    presets: {
      orbit: { count: 180, speed: 1.2, turbulence: 0.14, attraction: 0.26, trails: true },
      rose: { count: 220, speed: 1.65, turbulence: 0.08, attraction: 0.42, trails: true },
      interference: { count: 280, speed: 1.05, turbulence: 0.25, attraction: 0.34, trails: false },
      boundary: { count: 156, speed: 0.9, turbulence: 0.18, attraction: 0.58, trails: false },
      chaos: { count: 240, speed: 2.4, turbulence: 0.55, attraction: 0.22, trails: true }
    },
    reset,
    step,
    draw
  });
}
