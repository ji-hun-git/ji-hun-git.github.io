import * as THREE from "../vendor/three/three.module.min.js";

// A lightweight, KF-21-inspired airframe. All geometry stays local to this effect.
export function playJetFlyby(container = document.body, originY) {
  const local = container !== document.body;
  const width = local ? container.clientWidth : innerWidth;
  const height = local ? container.clientHeight : innerHeight;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(width, height);
  const canvas = renderer.domElement;
  canvas.className = "kf21-flyby";
  canvas.dataset.local = String(local);
  canvas.setAttribute("aria-hidden", "true");
  container.append(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width / 2,
    width / 2,
    height / 2,
    -height / 2,
    1,
    2000,
  );
  camera.position.z = 1000;
  scene.add(new THREE.HemisphereLight(0xf3f8ff, 0x39434b, 2.4));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-150, 300, 500);
  scene.add(key);
  const jet = new THREE.Group();
  scene.add(jet);
  const metal = new THREE.MeshStandardMaterial({
    color: 0x859399,
    metalness: 0.55,
    roughness: 0.42,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x2d393e,
    metalness: 0.6,
    roughness: 0.4,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x19363d,
    metalness: 0.8,
    roughness: 0.15,
  });
  const exhaust = new THREE.MeshBasicMaterial({ color: 0xffb66c });
  const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    jet.add(item);
    return item;
  };
  const body = mesh(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.34, -2.45),
        new THREE.Vector2(0.49, -1.8),
        new THREE.Vector2(0.51, -0.6),
        new THREE.Vector2(0.37, 0.7),
        new THREE.Vector2(0.21, 1.75),
        new THREE.Vector2(0.025, 3),
      ],
      16,
    ),
    metal,
  );
  body.rotation.z = -Math.PI / 2;
  body.scale.z = 0.7;
  const panel = (points, z, material = metal, depth = 0.045) => {
    const shape = new THREE.Shape(
      points.map(([x, y]) => new THREE.Vector2(x, y)),
    );
    return mesh(
      new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }),
      material,
      0,
      0,
      z,
    );
  };
  for (const side of [-1, 1]) {
    panel(
      [
        [0.8, side * 0.28],
        [-1.05, side * 2.12],
        [-1.82, side * 2.06],
        [-1.35, side * 0.35],
      ],
      -0.06,
    );
    panel(
      [
        [-1.4, side * 0.32],
        [-2.28, side * 1.25],
        [-2.7, side * 1.08],
        [-2.48, side * 0.22],
      ],
      0.08,
    );
    panel(
      [
        [0.5, side * 0.34],
        [-0.18, side * 0.65],
        [-0.8, side * 0.65],
        [-0.65, side * 0.35],
      ],
      0.12,
      dark,
    );
    const engine = mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 2.2, 12),
      metal,
      -1.45,
      side * 0.29,
      -0.1,
    );
    engine.rotation.z = Math.PI / 2;
    const nozzle = mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.3, 12),
      dark,
      -2.57,
      side * 0.29,
      -0.1,
    );
    nozzle.rotation.z = Math.PI / 2;
    const flame = mesh(
      new THREE.ConeGeometry(0.115, 0.55, 12),
      exhaust,
      -2.96,
      side * 0.29,
      -0.1,
    );
    flame.rotation.z = Math.PI / 2;
    const fin = panel(
      [
        [-1.25, 0],
        [-1.8, 0.9],
        [-2.45, 0.86],
        [-2.3, 0],
      ],
      0,
      metal,
      0.04,
    );
    fin.rotation.x = side === 1 ? 1.08 : Math.PI - 1.08;
    fin.position.set(0, side * 0.4, 0.17);
    panel(
      [
        [-0.7, side * 0.8],
        [-1.16, side * 1.6],
        [-1.5, side * 1.6],
      ],
      0.002,
      dark,
      0.01,
    );
  }
  const canopy = mesh(new THREE.SphereGeometry(1, 20, 12), glass, 0.8, 0, 0.26);
  canopy.scale.set(0.72, 0.225, 0.255);
  const scale = Math.min(42, Math.max(23, width / 30));
  const baseline =
    height / 2 -
    Math.max(height * 0.28, Math.min(height * 0.76, originY ?? height * 0.6));
  const pose = (t) => {
    const u = Math.max(0, t);
    const x = -width / 2 - 210 + (width + 440) * Math.pow(u, 1.2);
    const y = baseline + height * (0.2 * u + 0.12 * u * u - 0.1);
    return {
      x,
      y,
      angle: Math.atan2(
        height * (0.2 + 0.24 * u),
        (width + 440) * 1.2 * Math.pow(Math.max(u, 0.01), 0.2),
      ),
    };
  };
  const trails = [-1, 1].map((side) => {
    const positions = new Float32Array(32 * 6);
    const colors = new Float32Array(32 * 6);
    const indices = [];
    for (let i = 0; i < 32; i++) {
      const shade = new THREE.Color(0x789aab).lerp(
        new THREE.Color(0xd5e0e3),
        i / 31,
      );
      for (let j = 0; j < 2; j++) shade.toArray(colors, i * 6 + j * 3);
      if (i < 31) {
        const n = i * 2;
        indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ribbon = new THREE.Mesh(geometry, material);
    ribbon.frustumCulled = false;
    scene.add(ribbon);
    return { side, positions, geometry, material };
  });
  let frame,
    stopped = false;
  const cancel = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    removeEventListener("resize", cancel);
    document.removeEventListener("visibilitychange", cancel);
    canvas.removeEventListener("webglcontextlost", cancel);
    const geometries = new Set(),
      materials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
  addEventListener("resize", cancel, { once: true });
  document.addEventListener("visibilitychange", cancel, { once: true });
  canvas.addEventListener("webglcontextlost", cancel, { once: true });
  const start = performance.now();
  const tick = (now) => {
    if (stopped) return;
    const t = (now - start) / 1150;
    if (t >= 1.15) {
      cancel();
      return;
    }
    const p = pose(t);
    const bank = 0.35 + Math.sin(t * Math.PI) * 0.45;
    jet.position.set(p.x, p.y, 0);
    jet.rotation.set(bank, -0.12, p.angle);
    jet.scale.setScalar(scale);
    for (const trail of trails) {
      for (let i = 0; i < 32; i++) {
        const age = i / 31;
        const q = pose(Math.max(0, t - age * 0.2));
        const offset = trail.side * scale * 0.29;
        const x =
          q.x - Math.cos(q.angle) * scale * 2.8 - Math.sin(q.angle) * offset;
        const y =
          q.y - Math.sin(q.angle) * scale * 2.8 + Math.cos(q.angle) * offset;
        const half = (1 - age) * 1.6;
        trail.positions.set([x, y - half, -15, x, y + half, -15], i * 6);
      }
      trail.geometry.attributes.position.needsUpdate = true;
      trail.material.opacity =
        0.48 * Math.min(1, t * 8) * Math.min(1, Math.max(0, (1.15 - t) / 0.15));
    }
    try {
      renderer.render(scene, camera);
    } catch {
      cancel();
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return { cancel };
}
