/**
 * Particle Policy Field: lightweight agents steering through a vector field.
 *
 * Every frame each agent samples a procedural field, blends that heading with
 * noise and (optionally) the pointer, and leaves a short trace. The six modes
 * change the field. Runs on the shared harness.
 */

import { createSimHarness, clamp, TAU } from "./_shared.js?v=115-20260930a";

export function mountParticleField(refs) {
  function fieldAt(api, x, y, t, phase) {
    const { variation } = api.state;
    const nx = x / api.w - 0.5;
    const ny = y / api.h - 0.5;
    const swirl = Math.atan2(ny, nx) + Math.PI / 2;
    const wave =
      Math.sin(nx * 7.2 + t * 0.018 + phase) +
      Math.cos(ny * 6.4 - t * 0.014) +
      Math.sin((nx + ny) * 4.4 + t * 0.012);
    if (variation === "vortex") {
      const ring = Math.sin(Math.hypot(nx, ny) * 18 - t * 0.025 + phase);
      return swirl + ring * 0.42;
    }
    if (variation === "comet") {
      return -0.08 + Math.sin(ny * 8 + t * 0.02 + phase) * 0.22 + nx * 0.35;
    }
    if (variation === "lattice") {
      return Math.round((swirl + wave * 0.25) / (Math.PI / 4)) * (Math.PI / 4);
    }
    if (variation === "trace") {
      return swirl * 0.36 + wave * 0.9;
    }
    if (variation === "swarm") {
      return swirl * 0.72 + wave * 0.88 + Math.sin(t * 0.01 + phase) * 0.18;
    }
    return swirl * 0.58 + wave * 0.72;
  }

  function reset(api) {
    const w = api.custom;
    const { state } = api;
    w.t = 0;
    w.energy = 0;
    w.particles = Array.from({ length: state.count }, (_, index) => {
      const x = api.rand() * api.w;
      const y = api.rand() * api.h;
      const angle = api.rand() * TAU;
      return {
        id: index,
        x,
        y,
        vx: Math.cos(angle) * state.speed,
        vy: Math.sin(angle) * state.speed,
        phase: api.rand() * TAU,
        mass: 0.75 + api.rand() * 0.8,
        hue: state.variation === "comet"
          ? 24 + api.rand() * 46
          : state.variation === "lattice"
            ? 160 + (index % 6) * 20
            : 185 + api.rand() * 145
      };
    });
    api.log(`${api.variationLabel()} mode: seed ${state.seed}, ${state.count} agents.`);
  }

  function step(api) {
    const w = api.custom;
    const { state } = api;
    const t = w.t++;
    const cx = api.w / 2;
    const cy = api.h / 2;
    const centerPull = state.variation === "comet" ? 0.0004 : state.variation === "vortex" ? 0.0024 : 0.0015;
    let energy = 0;
    let orderX = 0;
    let orderY = 0;
    let spread = 0;

    for (const p of w.particles) {
      let angle = fieldAt(api, p.x, p.y, t, p.phase);
      angle += (api.rand() - 0.5) * state.turbulence;

      if (api.pointer && state.attraction > 0) {
        const pointerAngle = Math.atan2(api.pointer.y - p.y, api.pointer.x - p.x);
        angle = angle * (1 - state.attraction) + pointerAngle * state.attraction;
      }

      const targetVX = Math.cos(angle) * state.speed * p.mass;
      const targetVY = Math.sin(angle) * state.speed * p.mass;
      const inertia = state.variation === "lattice" ? 0.78 : state.variation === "comet" ? 0.92 : 0.88;
      const response = 1 - inertia;
      p.vx = p.vx * inertia + targetVX * response + (cx - p.x) * centerPull;
      p.vy = p.vy * inertia + targetVY * response + (cy - p.y) * centerPull;
      if (state.variation === "comet") p.vx += 0.018 * state.speed;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x += api.w;
      if (p.x > api.w) p.x -= api.w;
      if (p.y < 0) p.y += api.h;
      if (p.y > api.h) p.y -= api.h;

      const v = Math.hypot(p.vx, p.vy);
      energy += v;
      orderX += p.vx / Math.max(0.001, v);
      orderY += p.vy / Math.max(0.001, v);
      spread += Math.hypot(p.x - cx, p.y - cy);
    }

    const n = Math.max(1, w.particles.length);
    // Kinetic energy is shown as the raw mean (it can pass 1); the chart line
    // uses the same value scaled by 1/1.4, as before.
    w.energy = clamp(energy / n / 4, 0, 1.6);
    api.push(clamp(w.energy / 1.4, 0, 1), clamp(Math.hypot(orderX, orderY) / n, 0, 1), clamp(spread / n / Math.hypot(cx, cy), 0, 1));
  }

  function drawField(api) {
    const { ctx } = api;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    const gridStep = api.w < 520 ? 56 : 72;
    for (let x = gridStep / 2; x < api.w; x += gridStep) {
      for (let y = gridStep / 2; y < api.h; y += gridStep) {
        const angle = fieldAt(api, x, y, api.custom.t, 0);
        const len = 13;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(angle) * len * 0.5, y - Math.sin(angle) * len * 0.5);
        ctx.lineTo(x + Math.cos(angle) * len * 0.5, y + Math.sin(angle) * len * 0.5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function draw(api) {
    const { ctx, custom: w, state } = api;
    if (state.trails) {
      const fade = state.variation === "trace" ? 0.07 : state.variation === "comet" ? 0.11 : 0.15;
      ctx.fillStyle = `rgba(6, 8, 13, ${fade})`;
      ctx.fillRect(0, 0, api.w, api.h);
    } else {
      ctx.clearRect(0, 0, api.w, api.h);
      ctx.fillStyle = "rgba(6, 8, 13, 0.94)";
      ctx.fillRect(0, 0, api.w, api.h);
    }

    drawField(api);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of w.particles) {
      const speed = Math.hypot(p.vx, p.vy);
      const radius = (state.variation === "lattice" ? 1.35 : 1.6) + speed * 0.34;
      const alpha = state.variation === "trace" ? 0.22 + clamp(speed / 9, 0, 0.38) : 0.32 + clamp(speed / 8, 0, 0.45);
      ctx.fillStyle = `hsla(${p.hue}, 88%, 66%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    if (api.pointer) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.24)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(api.pointer.x, api.pointer.y, 22 + state.attraction * 38, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  return createSimHarness(refs, {
    seedDefault: 42,
    firstVariation: "calm",
    usePointer: true,
    chartColors: ["rgba(120, 210, 255, 0.95)", "rgba(250, 215, 120, 0.95)", "rgba(185, 150, 255, 0.95)"],
    metricFormat: {
      energy: (_v, api) => (api.custom.energy || 0).toFixed(2),
      order: (v) => v.toFixed(2),
      spread: (v) => v.toFixed(2)
    },
    controlFormat: {
      count: (v) => `${v} agents`,
      speed: (v) => `${v.toFixed(2)} px/frame`,
      turbulence: (v) => `±${(v / 2).toFixed(2)} rad`,
      attraction: (v) => `${Math.round(v * 100)}% toward cursor`
    },
    presets: {
      calm: { count: 140, speed: 1.3, turbulence: 0.18, attraction: 0.18, trails: true },
      swarm: { count: 260, speed: 2.2, turbulence: 0.55, attraction: 0.38, trails: true },
      trace: { count: 190, speed: 1.75, turbulence: 0.32, attraction: 0.08, trails: true },
      vortex: { count: 220, speed: 1.55, turbulence: 0.2, attraction: 0.28, trails: true },
      comet: { count: 180, speed: 2.65, turbulence: 0.14, attraction: 0.18, trails: true },
      lattice: { count: 156, speed: 1.45, turbulence: 0.08, attraction: 0.12, trails: false }
    },
    reset,
    step,
    draw
  });
}
