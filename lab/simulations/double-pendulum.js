/**
 * Double Pendulum - deterministic chaos
 *
 * A field of double pendulums with almost-identical starting angles. They track
 * each other for a moment, then sensitive dependence on initial conditions pulls
 * them apart. The chart's "divergence" line is the butterfly effect, measured.
 */

import { createSimHarness, clamp, TAU } from "./_shared.js?v=115-20260930a";

const G = 0.5;
const L1 = 1;
const L2 = 1;
const M1 = 1;
const M2 = 1;

export function mountDoublePendulum(refs) {
  function deriv(t1, t2, w1, w2) {
    const d = t1 - t2;
    const den = 2 * M1 + M2 - M2 * Math.cos(2 * d);
    const a1 =
      (-G * (2 * M1 + M2) * Math.sin(t1) -
        M2 * G * Math.sin(t1 - 2 * t2) -
        2 * Math.sin(d) * M2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) /
      (L1 * den);
    const a2 =
      (2 * Math.sin(d) *
        (w1 * w1 * L1 * (M1 + M2) + G * (M1 + M2) * Math.cos(t1) + w2 * w2 * L2 * M2 * Math.cos(d))) /
      (L2 * den);
    return [a1, a2];
  }

  // Total mechanical energy of one pendulum, with the potential measured so that
  // hanging straight down is -(M1 + M2) G L1 - M2 G L2.
  function energyOf(p) {
    const kinetic =
      0.5 * (M1 + M2) * L1 * L1 * p.w1 * p.w1 +
      0.5 * M2 * L2 * L2 * p.w2 * p.w2 +
      M2 * L1 * L2 * p.w1 * p.w2 * Math.cos(p.t1 - p.t2);
    const potential = -(M1 + M2) * G * L1 * Math.cos(p.t1) - M2 * G * L2 * Math.cos(p.t2);
    return kinetic + potential;
  }
  const E_MIN = -(M1 + M2) * G * L1 - M2 * G * L2;

  function step(api) {
    const w = api.custom;
    const sub = clamp(Math.round(api.state.speed * 3), 1, 8);
    const dt = 0.05;
    const damp = 1 - api.state.attraction * 0.004;
    for (let s = 0; s < sub; s++) {
      for (const p of w.pend) {
        const [a1, a2] = deriv(p.t1, p.t2, p.w1, p.w2);
        p.w1 = (p.w1 + a1 * dt) * damp;
        p.w2 = (p.w2 + a2 * dt) * damp;
        p.t1 += p.w1 * dt;
        p.t2 += p.w2 * dt;
      }
    }
    // metrics: mean speed, tip spread (divergence), and the energy left as a
    // share of the starting energy (flat without damping, falling with it)
    let mx = 0, my = 0, n = w.pend.length;
    const tips = w.pend.map((p) => {
      const x = Math.sin(p.t1) * L1 + Math.sin(p.t2) * L2;
      const y = Math.cos(p.t1) * L1 + Math.cos(p.t2) * L2;
      mx += x; my += y;
      return { x, y };
    });
    mx /= n; my /= n;
    let spread = 0, spd = 0, energy = 0;
    for (let i = 0; i < n; i++) {
      spread += Math.hypot(tips[i].x - mx, tips[i].y - my);
      spd += Math.abs(w.pend[i].w1) + Math.abs(w.pend[i].w2);
      energy += energyOf(w.pend[i]);
    }
    const energyLeft = (energy / n - E_MIN) / Math.max(1e-6, w.e0 - E_MIN);
    api.push(clamp(spd / n / 8, 0, 1), clamp(spread / n / 1.6, 0, 1), clamp(energyLeft, 0, 1));
  }

  function draw(api) {
    const { ctx, custom: w } = api;
    if (api.state.trails) { ctx.fillStyle = "rgba(7,7,13,0.12)"; ctx.fillRect(0, 0, api.w, api.h); }
    else { ctx.fillStyle = "rgba(7,7,13,0.96)"; ctx.fillRect(0, 0, api.w, api.h); }
    const cx = api.w / 2, cy = api.h * 0.4;
    const scale = Math.min(api.w, api.h) * 0.2;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < w.pend.length; i++) {
      const p = w.pend[i];
      const x1 = cx + Math.sin(p.t1) * L1 * scale;
      const y1 = cy + Math.cos(p.t1) * L1 * scale;
      const x2 = x1 + Math.sin(p.t2) * L2 * scale;
      const y2 = y1 + Math.cos(p.t2) * L2 * scale;
      const hue = 200 + (i / w.pend.length) * 130;
      const alpha = w.pend.length > 40 ? 0.5 : 0.9;
      ctx.strokeStyle = `hsla(${hue},85%,68%,${alpha})`;
      ctx.lineWidth = w.pend.length > 40 ? 1 : 1.6;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.fillStyle = `hsla(${hue},90%,70%,${alpha})`;
      ctx.beginPath(); ctx.arc(x2, y2, w.pend.length > 40 ? 1.6 : 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "rgba(245,245,247,0.9)";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(`${w.pend.length} double pendulums · deterministic chaos`, 14, 12);
  }

  return createSimHarness(refs, {
    seedDefault: 21,
    firstVariation: "fan",
    chartColors: ["rgba(96,165,250,0.95)", "rgba(244,114,182,0.95)", "rgba(167,139,250,0.95)"],
    metricFormat: { energy: (v) => v.toFixed(2), order: (v) => v.toFixed(2), spread: (v) => `${Math.round(v * 100)}%` },
    // The start spread only matters when the pendulums are placed, so moving it
    // restarts them.
    resetOn: ["turbulence"],
    controlFormat: {
      count: (v, api) => (api.state.variation === "pair" ? "2 (Pair)" : `${clamp(Math.round(v / 1.6), 40, 225)} pendulums`),
      speed: (v) => `${clamp(Math.round(v * 3), 1, 8)} steps/frame`,
      turbulence: (v) => `${(v * 0.5).toFixed(3)} rad`,
      attraction: (v) => `${(v * 0.4).toFixed(2)}% per step`
    },
    presets: {
      fan: { count: 120, speed: 1.6, turbulence: 0.04, attraction: 0.05, trails: true },
      pair: { count: 64, speed: 1.6, turbulence: 0.02, attraction: 0.02, trails: true },
      storm: { count: 240, speed: 2.2, turbulence: 0.12, attraction: 0.04, trails: true },
      damped: { count: 120, speed: 1.6, turbulence: 0.06, attraction: 0.45, trails: true }
    },
    reset(api) {
      const w = api.custom;
      // Pair is exactly two pendulums; the other modes take 40 to 225 from the
      // slider (48 to 360).
      const n = api.state.variation === "pair" ? 2 : clamp(Math.round(api.state.count / 1.6), 40, 225);
      const base = Math.PI * (0.6 + api.rand() * 0.5);
      w.pend = Array.from({ length: n }, (_, i) => ({
        t1: base + (i / n) * api.state.turbulence * 0.5 + (api.rand() - 0.5) * 0.001,
        t2: base + (api.rand() - 0.5) * 0.002,
        w1: 0,
        w2: 0
      }));
      w.e0 = w.pend.reduce((s, p) => s + energyOf(p), 0) / n;
      // The same quantity and unit as the Start spread readout (controlFormat).
      api.log(`${n} double pendulums, near-identical start (spread ${(api.state.turbulence * 0.5).toFixed(3)} rad).`);
    },
    step,
    draw
  });
}
