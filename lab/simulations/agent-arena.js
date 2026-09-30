/**
 * Agent Arena: seekers, runners, goals, and obstacles in a small world.
 *
 * Runners flee the nearest seeker and head for goals; seekers chase, patrol,
 * or press toward the runners' centre depending on the mode. Every agent
 * blends hand-written steering vectors. Runs on the shared harness.
 */

import { createSimHarness, clamp, normalize, fmt, TAU } from "./_shared.js?v=115-20260930a";

const runnerCountFor = (count) => clamp(Math.round(count / 16), 5, 22);
const seekerCountFor = (count) => clamp(Math.round(count / 48), 2, 8);

export function mountAgentArena(refs) {
  function randomPoint(api, margin = 26) {
    return {
      x: margin + api.rand() * Math.max(1, api.w - margin * 2),
      y: margin + api.rand() * Math.max(1, api.h - margin * 2)
    };
  }

  function reset(api) {
    const w = api.custom;
    const { state } = api;
    w.captures = 0;
    w.rewards = 0;
    w.visited = new Set();

    const runnerCount = runnerCountFor(state.count);
    const seekerCount = seekerCountFor(state.count);
    const obstacleCount = state.variation === "evasion" ? 7 : state.variation === "pressure" ? 3 : 5;

    w.goals = Array.from({ length: 4 }, () => ({ ...randomPoint(api, 42), pulse: api.rand() * TAU }));
    w.obstacles = Array.from({ length: obstacleCount }, () => ({
      ...randomPoint(api, 64),
      r: 20 + api.rand() * 26
    }));

    w.agents = [
      ...Array.from({ length: runnerCount }, (_, index) => ({
        kind: "runner",
        ...randomPoint(api),
        vx: 0,
        vy: 0,
        phase: api.rand() * TAU,
        trail: [],
        id: index
      })),
      ...Array.from({ length: seekerCount }, (_, index) => ({
        kind: "seeker",
        ...randomPoint(api),
        vx: 0,
        vy: 0,
        phase: api.rand() * TAU,
        anchor: {
          x: api.w * (0.18 + (index % 4) * 0.22),
          y: api.h * (index % 2 ? 0.78 : 0.22)
        },
        trail: [],
        id: index
      }))
    ];
    api.log(`${api.variationLabel()} policy with ${runnerCount} runners and ${seekerCount} seekers.`);
  }

  function avoidObstacles(api, agent, force) {
    for (const obstacle of api.custom.obstacles) {
      const dx = agent.x - obstacle.x;
      const dy = agent.y - obstacle.y;
      const d = Math.hypot(dx, dy);
      if (d < obstacle.r + 34) {
        const n = normalize(dx, dy);
        force.x += n.x * (1 - d / (obstacle.r + 34)) * 1.7;
        force.y += n.y * (1 - d / (obstacle.r + 34)) * 1.7;
      }
    }
  }

  function steer(api, agent, force, maxSpeed) {
    const n = normalize(force.x, force.y);
    const noise = (api.rand() - 0.5) * api.state.turbulence;
    const angle = Math.atan2(n.y, n.x) + noise;
    const targetVX = Math.cos(angle) * maxSpeed;
    const targetVY = Math.sin(angle) * maxSpeed;
    agent.vx = agent.vx * 0.82 + targetVX * 0.18;
    agent.vy = agent.vy * 0.82 + targetVY * 0.18;
    agent.x += agent.vx;
    agent.y += agent.vy;

    if (agent.x < 12 || agent.x > api.w - 12) agent.vx *= -0.8;
    if (agent.y < 12 || agent.y > api.h - 12) agent.vy *= -0.8;
    agent.x = clamp(agent.x, 12, api.w - 12);
    agent.y = clamp(agent.y, 12, api.h - 12);

    agent.trail.push({ x: agent.x, y: agent.y });
    if (agent.trail.length > 38) agent.trail.shift();
  }

  function nearest(agent, candidates) {
    let best = candidates[0];
    let bestDistance = Infinity;
    for (const candidate of candidates) {
      const d = Math.hypot(candidate.x - agent.x, candidate.y - agent.y);
      if (d < bestDistance) {
        best = candidate;
        bestDistance = d;
      }
    }
    return { target: best, distance: bestDistance };
  }

  function step(api) {
    const w = api.custom;
    const { state } = api;
    const runners = w.agents.filter((agent) => agent.kind === "runner");
    const seekers = w.agents.filter((agent) => agent.kind === "seeker");
    const center = {
      x: runners.reduce((sum, agent) => sum + agent.x, 0) / Math.max(1, runners.length),
      y: runners.reduce((sum, agent) => sum + agent.y, 0) / Math.max(1, runners.length)
    };

    for (const runner of runners) {
      const nearestSeeker = nearest(runner, seekers);
      const nearestGoal = nearest(runner, w.goals);
      const flee = normalize(runner.x - nearestSeeker.target.x, runner.y - nearestSeeker.target.y);
      const goal = normalize(nearestGoal.target.x - runner.x, nearestGoal.target.y - runner.y);
      const safetyWeight = state.variation === "evasion" ? 2.2 : state.variation === "pressure" ? 1.4 : 1.7;
      const goalWeight = 0.35 + state.attraction * 1.6;
      const force = {
        x: flee.x * safetyWeight + goal.x * goalWeight,
        y: flee.y * safetyWeight + goal.y * goalWeight
      };
      avoidObstacles(api, runner, force);
      steer(api, runner, force, state.speed * 1.08);

      if (nearestGoal.distance < 18) {
        w.rewards += 1;
        Object.assign(nearestGoal.target, randomPoint(api, 42), { pulse: api.rand() * TAU });
      }
    }

    for (const seeker of seekers) {
      const nearestRunner = nearest(seeker, runners);
      let force = normalize(nearestRunner.target.x - seeker.x, nearestRunner.target.y - seeker.y);
      if (state.variation === "patrol" && nearestRunner.distance > 130) {
        force = normalize(seeker.anchor.x - seeker.x, seeker.anchor.y - seeker.y);
      }
      if (state.variation === "pressure") {
        const centerBias = normalize(center.x - seeker.x, center.y - seeker.y);
        force.x = force.x * 0.72 + centerBias.x * 0.58;
        force.y = force.y * 0.72 + centerBias.y * 0.58;
      }
      avoidObstacles(api, seeker, force);
      steer(api, seeker, force, state.speed * (state.variation === "pursuit" ? 1.12 : 0.96));

      if (nearestRunner.distance < 13) {
        w.captures += 1;
        w.rewards -= 0.35;
        Object.assign(nearestRunner.target, randomPoint(api), { vx: 0, vy: 0, trail: [] });
        if (w.captures % 5 === 0) api.log(`Capture ${w.captures}: the seekers are closing in.`);
      }
    }

    for (const agent of w.agents) {
      const gx = Math.floor((agent.x / api.w) * 24);
      const gy = Math.floor((agent.y / api.h) * 18);
      w.visited.add(`${gx}:${gy}`);
    }

    api.push(
      clamp((w.rewards + 8) / 24, 0, 1),
      clamp(w.captures / 42, 0, 1),
      clamp(w.visited.size / (24 * 18), 0, 1)
    );
  }

  function draw(api) {
    const { ctx, custom: w, state } = api;
    const width = api.w;
    const height = api.h;
    ctx.fillStyle = state.trails ? "rgba(5, 8, 13, 0.2)" : "rgba(5, 8, 13, 0.96)";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    const gridStep = 36;
    for (let x = 0; x <= width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(255, 147, 199, 0.09)";
    ctx.strokeStyle = "rgba(255, 147, 199, 0.22)";
    for (const obstacle of w.obstacles) {
      ctx.beginPath();
      ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    for (const goal of w.goals) {
      const pulse = 1 + Math.sin(api.frame * 0.05 + goal.pulse) * 0.18;
      ctx.strokeStyle = "rgba(126, 231, 189, 0.55)";
      ctx.fillStyle = "rgba(126, 231, 189, 0.12)";
      ctx.beginPath();
      ctx.arc(goal.x, goal.y, 13 * pulse, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    if (state.trails) {
      for (const agent of w.agents) {
        ctx.beginPath();
        agent.trail.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = agent.kind === "runner" ? "rgba(120, 210, 255, 0.22)" : "rgba(246, 211, 107, 0.2)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    for (const agent of w.agents) {
      const isRunner = agent.kind === "runner";
      ctx.fillStyle = isRunner ? "rgba(120, 210, 255, 0.92)" : "rgba(246, 211, 107, 0.94)";
      ctx.strokeStyle = isRunner ? "rgba(120, 210, 255, 0.28)" : "rgba(246, 211, 107, 0.28)";
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, isRunner ? 4.2 : 5.5, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, isRunner ? 10 : 13, 0, TAU);
      ctx.stroke();
    }
  }

  return createSimHarness(refs, {
    seedDefault: 91,
    firstVariation: "pursuit",
    chartColors: ["rgba(126, 231, 189, 0.95)", "rgba(246, 211, 107, 0.95)", "rgba(120, 210, 255, 0.95)"],
    metricFormat: {
      energy: (v) => String(Math.round(v * 100)),
      order: (v) => `${Math.round(v * 100)}%`,
      spread: (v) => `${Math.round(v * 100)}%`
    },
    controlFormat: {
      count: (v) => `${runnerCountFor(v)} runners, ${seekerCountFor(v)} seekers`,
      speed: (v) => `${(v * 1.08).toFixed(2)} px/frame`,
      turbulence: (v) => `±${(v / 2).toFixed(2)} rad`,
      attraction: (v) => `weight ${fmt.fixed(0.35 + v * 1.6)}`
    },
    presets: {
      pursuit: { count: 164, speed: 1.8, turbulence: 0.22, attraction: 0.34, trails: true },
      evasion: { count: 192, speed: 2.15, turbulence: 0.4, attraction: 0.58, trails: true },
      patrol: { count: 132, speed: 1.45, turbulence: 0.18, attraction: 0.24, trails: true },
      pressure: { count: 220, speed: 1.95, turbulence: 0.28, attraction: 0.46, trails: true }
    },
    reset,
    step,
    draw
  });
}
