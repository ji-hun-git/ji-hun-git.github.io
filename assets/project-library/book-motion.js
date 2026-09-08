import * as THREE from "../vendor/three/three.module.min.js";

const WIDTH = 1.55;
const HEIGHT = 2.3;
const DURATION = 2400;
const clamp = (value) => Math.max(0, Math.min(1, value));
const ease = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const between = (time, start, end) => ease((time - start) / (end - start));
const mix = THREE.MathUtils.lerp;

function wrap(context, text, x, y, width, lineHeight, limit = 8) {
  // Segmenting graphemes keeps Korean and long technical titles inside the page.
  const segments =
    typeof Intl.Segmenter === "function"
      ? [
          ...new Intl.Segmenter(undefined, { granularity: "word" }).segment(
            text,
          ),
        ].map((part) => part.segment)
      : [...text];
  let line = "",
    rows = 0;
  for (const segment of segments) {
    if (context.measureText(line + segment).width > width && line) {
      context.fillText(line.trim(), x, y);
      y += lineHeight;
      if (++rows >= limit) return y;
      line = "";
    }
    if (context.measureText(segment).width > width) {
      for (const character of segment) {
        if (context.measureText(line + character).width > width) {
          context.fillText(line, x, y);
          y += lineHeight;
          if (++rows >= limit) return y;
          line = "";
        }
        line += character;
      }
    } else line += segment;
  }
  if (line) context.fillText(line.trim(), x, y);
  return y + lineHeight;
}

function texture(draw) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  draw(canvas.getContext("2d"));
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function coverTexture({ color, ink, title, category, year }) {
  return texture((ctx) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 768);
    ctx.fillStyle = "#ffffff08";
    for (let y = 0; y < 768; y += 3) ctx.fillRect(0, y, 512, 1);
    ctx.fillStyle = "#0000000c";
    for (let x = 0; x < 512; x += 4) ctx.fillRect(x, 0, 1, 768);
    ctx.fillStyle = "#00000018";
    ctx.fillRect(0, 0, 24, 768);
    ctx.fillStyle = ink;
    ctx.font = "22px Arial, sans-serif";
    ctx.fillText(category, 54, 64);
    ctx.font = "56px Georgia, serif";
    ctx.fillText("JC.", 54, 220);
    ctx.font = "500 43px Arial, sans-serif";
    wrap(ctx, title, 54, 425, 398, 52, 4);
    ctx.globalAlpha = 0.45;
    ctx.fillRect(54, 650, 398, 1);
    ctx.globalAlpha = 1;
    ctx.font = "22px Arial, sans-serif";
    ctx.fillText("Jihun Chae", 54, 694);
    ctx.textAlign = "right";
    ctx.fillText(year, 458, 694);
  });
}

function pageTexture(title, body, number, reverse = false) {
  return texture((ctx) => {
    if (reverse) {
      ctx.translate(512, 0);
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = "#f7f4e9";
    ctx.fillRect(0, 0, 512, 768);
    const gutter = ctx.createLinearGradient(0, 0, 80, 0);
    gutter.addColorStop(0, "#7b786529");
    gutter.addColorStop(1, "#7b786500");
    ctx.fillStyle = gutter;
    ctx.fillRect(0, 0, 80, 768);
    ctx.fillStyle = "#626d61";
    ctx.font = "16px Arial, sans-serif";
    ctx.fillText("JIHUN CHAE / COLLECTED WORK", 52, 62);
    ctx.fillStyle = "#2d3931";
    ctx.font = "32px Georgia, serif";
    const next = wrap(ctx, title, 52, 132, 406, 40, 4);
    ctx.fillStyle = "#c4c7bc";
    ctx.fillRect(52, next + 4, 406, 1);
    ctx.fillStyle = "#535a53";
    ctx.font = "21px Arial, sans-serif";
    wrap(ctx, body, 52, next + 50, 406, 34, 10);
    ctx.fillStyle = "#737d70";
    ctx.font = "18px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(String(number).padStart(2, "0"), 256, 710);
  });
}

export function playBookOpening({
  container,
  rect,
  color,
  ink,
  title,
  category,
  year,
  pages,
  faceOut = false,
}) {
  const canvas = document.createElement("canvas");
  canvas.className = "book-flight-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (!gl) throw new Error("WebGL2 unavailable");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: gl,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 760 ? 1.5 : 2),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    32,
    innerWidth / innerHeight,
    1,
    6000,
  );
  const root = new THREE.Group();
  const book = new THREE.Group();
  root.add(book);
  scene.add(root);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7c857b, 2.3));
  const light = new THREE.DirectionalLight(0xfff9ec, 2.1);
  light.position.set(-350, 550, 900);
  light.castShadow = true;
  light.shadow.mapSize.set(
    innerWidth < 760 ? 512 : 1024,
    innerWidth < 760 ? 512 : 1024,
  );
  Object.assign(light.shadow.camera, {
    left: -700,
    right: 700,
    top: 700,
    bottom: -700,
    near: 1,
    far: 2200,
  });
  light.shadow.bias = -0.00005;
  light.shadow.normalBias = 1.5;
  scene.add(light);
  const resources = new Set();
  const track = (resource) => {
    resources.add(resource);
    return resource;
  };
  const material = (options) =>
    track(
      new THREE.MeshStandardMaterial({
        roughness: 0.88,
        metalness: 0,
        ...options,
      }),
    );
  const cover = track(coverTexture({ color, ink, title, category, year }));
  const board = material({ color });
  const printed = material({ map: cover });
  const inside = material({ color: "#e8e7d9" });
  const paper = material({ color: "#e4dfcf" });
  const box = (width, height, depth, materials) => {
    const mesh = new THREE.Mesh(
      track(new THREE.BoxGeometry(width, height, depth)),
      materials,
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };
  const back = box(WIDTH, HEIGHT, 0.055, board);
  back.position.set(WIDTH / 2, 0, -0.13);
  book.add(back);
  const block = box(WIDTH - 0.07, HEIGHT - 0.09, 0.17, paper);
  block.position.set(WIDTH / 2, 0, -0.015);
  book.add(block);
  // The hinge stays at x=0; every cover and leaf rotates around the actual binding.
  const hinge = new THREE.Group();
  hinge.position.z = 0.12;
  const front = box(WIDTH, HEIGHT, 0.052, [
    board,
    board,
    board,
    board,
    printed,
    inside,
  ]);
  front.position.x = WIDTH / 2;
  hinge.add(front);
  book.add(hinge);
  const spine = box(0.06, HEIGHT, 0.29, board);
  spine.position.set(0, 0, -0.01);
  book.add(spine);
  const edgeMaterial = material({ color: "#bdbdac" });
  for (let i = 0; i < 12; i++) {
    const edge = box(WIDTH - 0.085, 0.003, 0.002, edgeMaterial);
    edge.position.set(WIDTH / 2, -(HEIGHT - 0.08) / 2, -0.09 + i * 0.014);
    book.add(edge);
  }
  const leaves = [];
  for (let index = 0; index < 4; index++) {
    const content = pages[index % pages.length] || { title, body: "" };
    const geometry = track(
      new THREE.PlaneGeometry(WIDTH - 0.055, HEIGHT - 0.085, 30, 2),
    );
    geometry.translate((WIDTH - 0.055) / 2, 0, 0);
    const backGeometry = track(geometry.clone());
    const frontMap = track(
      pageTexture(content.title, content.body, index * 2 + 1),
    );
    const backMap = track(
      pageTexture(content.title, content.body, index * 2 + 2, true),
    );
    const leaf = new THREE.Group();
    const face = new THREE.Mesh(
      geometry,
      material({ map: frontMap, side: THREE.FrontSide }),
    );
    const reverse = new THREE.Mesh(
      backGeometry,
      material({ map: backMap, side: THREE.BackSide }),
    );
    face.castShadow = reverse.castShadow = true;
    // Only the stationary page receives shadows; moving two-sided leaves otherwise self-shadow.
    face.receiveShadow = reverse.receiveShadow = index === 0;
    face.frustumCulled = reverse.frustumCulled = false;
    leaf.add(face, reverse);
    leaf.position.z = 0.079 + index * 0.008;
    book.add(leaf);
    leaves.push({
      geometry,
      backGeometry,
      base: geometry.attributes.position.array.slice(),
      leaf,
    });
  }
  const shadow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(WIDTH * 5, HEIGHT * 4)),
    track(new THREE.ShadowMaterial({ opacity: 0.17 })),
  );
  shadow.position.z = -0.18;
  shadow.receiveShadow = true;
  book.add(shadow);
  let frame = 0,
    stopped = false,
    start = null,
    resolve;
  const finished = new Promise((done) => {
    resolve = done;
  });
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.position.z =
      innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(16)));
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });
  const dispose = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    canvas.removeEventListener("webglcontextlost", lost);
    resources.forEach((resource) => resource.dispose());
    light.shadow.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    delete container.dataset.phase;
    resolve();
  };
  const lost = (event) => {
    event.preventDefault();
    dispose();
  };
  canvas.addEventListener("webglcontextlost", lost);
  const bend = (leaf, progress) => {
    const positions = leaf.geometry.attributes.position;
    const segments = 30,
      width = WIDTH - 0.055;
    const xs = [0],
      zs = [0];
    for (let i = 1; i <= segments; i++) {
      const s = (i - 0.5) / segments;
      const angle =
        -Math.PI * progress +
        Math.sin(Math.PI * progress) * 0.8 * Math.sin(s * Math.PI);
      xs[i] = xs[i - 1] + (Math.cos(angle) * width) / segments;
      zs[i] = zs[i - 1] - (Math.sin(angle) * width) / segments;
    }
    for (let i = 0; i < positions.count; i++) {
      const column = i % (segments + 1);
      const y = leaf.base[i * 3 + 1];
      positions.setXYZ(
        i,
        xs[column],
        y,
        zs[column] +
          (Math.sin(Math.PI * progress) * 0.035 * y * column) / segments,
      );
    }
    positions.needsUpdate = true;
    leaf.geometry.computeVertexNormals();
    leaf.backGeometry.attributes.position.copy(positions);
    leaf.backGeometry.attributes.position.needsUpdate = true;
    leaf.backGeometry.attributes.normal.copy(leaf.geometry.attributes.normal);
    leaf.backGeometry.attributes.normal.needsUpdate = true;
  };
  const draw = (now) => {
    if (stopped) return;
    const time = start === null ? 0 : now - start;
    const pull = between(time, 0, 400);
    const present = between(time, 360, 920);
    const open = between(time, 900, 1460);
    const finish = between(time, 2200, DURATION);
    const scale = Math.min(
      (innerWidth - 48) / (WIDTH * 2 + 0.3),
      (innerHeight - 170) / (HEIGHT + 0.4),
      215,
    );
    const fromScale = rect.height / HEIGHT;
    const startAngle = faceOut
      ? -0.04
      : -Math.acos(clamp(rect.width / (WIDTH * fromScale)));
    root.scale.setScalar(mix(fromScale, scale, present));
    root.position.set(
      mix(rect.left + rect.width / 2 - innerWidth / 2 + pull * 12, 0, present),
      mix(
        innerHeight / 2 - rect.top - rect.height / 2 + pull * 60,
        12,
        present,
      ),
      pull * (1 - present) * 60,
    );
    root.rotation.set(
      mix(0, -0.16, present),
      mix(startAngle - pull * 0.3, -0.12, present),
      mix(0, -0.025, present),
    );
    book.position.x = (-WIDTH / 2) * (1 - open);
    hinge.rotation.y = -Math.PI * open;
    leaves.forEach((leaf, index) => {
      const turn =
        index === 0
          ? 0
          : between(time, 1320 + (3 - index) * 180, 1740 + (3 - index) * 180);
      bend(leaf, turn);
      leaf.leaf.position.z =
        0.079 + index * 0.008 + turn * (0.085 + (4 - index) * 0.01);
    });
    container.dataset.phase =
      time < 400
        ? "pull"
        : time < 900
          ? "turn"
          : time < 1320
            ? "open"
            : time < 2150
              ? "flip"
              : "settle";
    canvas.style.opacity = String(1 - finish);
    renderer.render(scene, camera);
    start ??= performance.now();
    container.dataset.rendered = "true";
    if (time >= DURATION) dispose();
    else frame = requestAnimationFrame(draw);
  };
  container.append(canvas);
  draw(performance.now());
  return { finished, cancel: dispose };
}
