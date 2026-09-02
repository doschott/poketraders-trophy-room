import * as THREE from "three";

export type TexBag = {
  wood: THREE.Texture;
  plaster: THREE.Texture;
  sand: THREE.Texture;
  asphalt: THREE.Texture;
  mars: THREE.Texture;
  rock: THREE.Texture;
  facade: THREE.Texture;
  brick: THREE.Texture;
  sky: THREE.Texture;
  cards: THREE.Texture[];
};

export function tile(tex: THREE.Texture, rx: number, ry: number) {
  const t = tex.clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}

export function std(
  color: number,
  opts: { rough?: number; metal?: number; map?: THREE.Texture; opacity?: number; emissive?: number; em?: number } = {},
) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.55,
    metalness: opts.metal ?? 0.08,
    transparent: opts.opacity != null,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.em ?? 0,
  });
  if (opts.map) mat.map = opts.map;
  return mat;
}

export function addShadow<T extends THREE.Object3D>(mesh: T): T {
  mesh.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return mesh;
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry?.dispose();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    }
  });
}

export function latheTrophy(scale = 1, silver = 0xc8ccd4) {
  const g = new THREE.Group();
  const pts = [
    [0, 0],
    [0.12, 0],
    [0.11, 0.03],
    [0.05, 0.07],
    [0.035, 0.16],
    [0.03, 0.36],
    [0.048, 0.41],
    [0.035, 0.45],
    [0.06, 0.48],
    [0.12, 0.58],
    [0.14, 0.7],
    [0.13, 0.72],
  ].map(([x, y]) => new THREE.Vector2(x * scale, y * scale));
  const geo = new THREE.LatheGeometry(pts, 28);
  const cup = new THREE.Mesh(geo, std(silver, { metal: 0.88, rough: 0.18 }));
  g.add(cup);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14 * scale, 0.16 * scale, 0.08 * scale, 16),
    std(0x6b4a32, { rough: 0.7 }),
  );
  base.position.y = 0.04 * scale;
  g.add(base);
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.02 * scale, 16),
    std(0xc4a020, { metal: 0.7, rough: 0.3 }),
  );
  plate.position.y = 0.09 * scale;
  g.add(plate);
  if (scale > 0.75) {
    const handle = std(silver, { metal: 0.88, rough: 0.18 });
    for (const s of [-1, 1]) {
      const tor = new THREE.Mesh(new THREE.TorusGeometry(0.07 * scale, 0.016 * scale, 8, 18), handle);
      tor.position.set(0.13 * scale * s, 0.58 * scale, 0);
      tor.rotation.z = 0.55 * s;
      g.add(tor);
    }
  }
  return addShadow(g);
}

export function plantPot(h = 0.9) {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 12), std(0x8a4030, { rough: 0.7 }));
  pot.position.y = 0.12;
  g.add(pot);
  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12), std(0x3a2418, { rough: 0.95 }));
  dirt.position.y = 0.24;
  g.add(dirt);
  const leafMat = std(0x2f6a4a, { rough: 0.65 });
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), leafMat);
    leaf.scale.set(1, 1.5, 0.55);
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.12, 0.44 + (i % 2) * 0.14, Math.sin(a) * 0.12);
    g.add(leaf);
  }
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), leafMat);
  top.position.y = h * 0.72;
  g.add(top);
  return addShadow(g);
}

export function armchair(clothColor = 0x3a4554) {
  const g = new THREE.Group();
  const cloth = std(clothColor, { rough: 0.85 });
  const wood = std(0x6b4a32, { rough: 0.6 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 0.74), cloth);
  seat.position.y = 0.36;
  g.add(seat);
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.62), cloth);
  cushion.position.y = 0.46;
  g.add(cushion);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.62, 0.12), cloth);
  back.position.set(0, 0.68, -0.32);
  back.rotation.x = -0.12;
  g.add(back);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.68), cloth);
    arm.position.set(0.36 * s, 0.5, 0);
    g.add(arm);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.3, 8), wood);
    leg.position.set(0.3 * s, 0.15, 0.26);
    g.add(leg);
    const leg2 = leg.clone();
    leg2.position.z = -0.26;
    g.add(leg2);
  }
  return addShadow(g);
}

export function sofa(clothColor = 0x3a4554) {
  const g = new THREE.Group();
  const cloth = std(clothColor, { rough: 0.85 });
  const wood = std(0x4a3224, { rough: 0.6 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.18, 0.86), cloth);
  base.position.y = 0.28;
  g.add(base);
  for (const x of [-0.64, 0, 0.64]) {
    const cush = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.72), cloth);
    cush.position.set(x, 0.44, 0.02);
    g.add(cush);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.7, 0.16), cloth);
  back.position.set(0, 0.72, -0.36);
  back.rotation.x = -0.08;
  g.add(back);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.86), cloth);
    arm.position.set(1.02 * s, 0.5, 0);
    g.add(arm);
  }
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 8), wood);
      leg.position.set(0.9 * sx, 0.1, 0.32 * sz);
      g.add(leg);
    }
  }
  return addShadow(g);
}

export function bookcase() {
  const g = new THREE.Group();
  const wood = std(0x6b4a32, { rough: 0.55 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.28, 2.05, 0.36), wood);
  body.position.y = 1.02;
  g.add(body);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.92, 0.04), std(0x4a3224, { rough: 0.7 }));
  back.position.set(0, 1.02, -0.14);
  g.add(back);
  const colors = [0x2a8a8a, 0x1a2230, 0x8a3030, 0xc4a020, 0x3a4554, 0xece8e0];
  for (let i = 0; i < 5; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.32), wood);
    shelf.position.set(0, 0.22 + i * 0.42, 0.02);
    g.add(shelf);
    for (let b = 0; b < 7; b++) {
      const h = 0.22 + (b % 3) * 0.04;
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.2), std(colors[(i + b) % colors.length], { rough: 0.55 }));
      book.position.set(-0.48 + b * 0.15, 0.24 + i * 0.42 + h / 2, 0.04);
      g.add(book);
    }
  }
  return addShadow(g);
}

export function desk() {
  const g = new THREE.Group();
  const wood = std(0x6b4a32, { rough: 0.45 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.72), wood);
  top.position.y = 0.74;
  g.add(top);
  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.62), wood);
  drawer.position.set(0.42, 0.58, 0);
  g.add(drawer);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), std(0xc8ccd4, { metal: 0.7, rough: 0.3 }));
  knob.position.set(0.42, 0.58, 0.32);
  g.add(knob);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.72, 0.07), wood);
      leg.position.set(0.64 * sx, 0.36, 0.28 * sz);
      g.add(leg);
    }
  }
  return addShadow(g);
}

export function coffeeTable() {
  const g = new THREE.Group();
  const wood = std(0x6b4a32, { rough: 0.4, metal: 0.05 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.58), wood);
  top.position.y = 0.38;
  g.add(top);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.02, 0.5),
    std(0x7eb0c4, { metal: 0.1, rough: 0.08, opacity: 0.35 }),
  );
  glass.position.y = 0.42;
  g.add(glass);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.38, 8), wood);
      leg.position.set(0.46 * sx, 0.19, 0.22 * sz);
      g.add(leg);
    }
  }
  return addShadow(g);
}

export function floorLamp() {
  const g = new THREE.Group();
  const metal = std(0xc8ccd4, { metal: 0.72, rough: 0.28 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 1.5, 10), metal);
  pole.position.y = 0.75;
  g.add(pole);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16), metal);
  base.position.y = 0.02;
  g.add(base);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.26, 16, 1, true),
    std(0xece8e0, { rough: 0.8, emissive: 0xffe8c4, em: 0.35 }),
  );
  shade.position.y = 1.58;
  g.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 6),
    std(0xffe6c4, { emissive: 0xffe6c4, em: 0.9, rough: 0.3 }),
  );
  bulb.position.y = 1.5;
  g.add(bulb);
  return addShadow(g);
}

export function rug(color = 0x2a3a44) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 1.9), std(color, { rough: 0.95 }));
  m.position.y = 0.016;
  m.receiveShadow = true;
  const inner = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.032, 1.5), std(0xece8e0, { rough: 0.95 }));
  inner.position.y = 0.018;
  const g = new THREE.Group();
  g.add(m, inner);
  return g;
}

export function framedCard(tex: THREE.Texture, w = 0.5, h = 0.7) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.05), std(0x6b4a32, { rough: 0.4, metal: 0.1 }));
  g.add(frame);
  const inner = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, h + 0.02, 0.02), std(0xece8e0, { rough: 0.6 }));
  inner.position.z = 0.018;
  g.add(inner);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.05 });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.84, h * 0.84), mat);
  card.position.z = 0.032;
  g.add(card);
  const light = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.5, 0.04, 0.06),
    std(0x2a3038, { metal: 0.5, rough: 0.4, emissive: 0xffe6c4, em: 0.25 }),
  );
  light.position.set(0, h / 2 + 0.08, 0.04);
  g.add(light);
  return g;
}

export function bed() {
  const g = new THREE.Group();
  const wood = std(0x6b4a32, { rough: 0.55 });
  const linen = std(0xece8e0, { rough: 0.85 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.28, 1.55), wood);
  frame.position.y = 0.28;
  g.add(frame);
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.18, 1.4), linen);
  mattress.position.y = 0.5;
  g.add(mattress);
  const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 1.15), std(0x3a4554, { rough: 0.88 }));
  duvet.position.set(0.08, 0.62, 0.05);
  g.add(duvet);
  const head = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.85, 0.1), wood);
  head.position.set(0, 0.7, -0.72);
  g.add(head);
  for (const s of [-1, 1]) {
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.38), linen);
    pillow.position.set(0.42 * s, 0.68, -0.42);
    g.add(pillow);
  }
  return addShadow(g);
}

export function kitchenIsland() {
  const g = new THREE.Group();
  const stone = std(0xc8ccd4, { rough: 0.35, metal: 0.15 });
  const cab = std(0x3a322c, { rough: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.78, 0.72), cab);
  body.position.y = 0.39;
  g.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.8), stone);
  top.position.y = 0.81;
  g.add(top);
  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.32), std(0x8a9098, { metal: 0.7, rough: 0.25 }));
  sink.position.set(-0.4, 0.86, 0);
  g.add(sink);
  const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.22, 8), std(0xc8ccd4, { metal: 0.8, rough: 0.2 }));
  tap.position.set(-0.4, 0.98, -0.12);
  g.add(tap);
  return addShadow(g);
}

export function chandelier() {
  const g = new THREE.Group();
  const gold = std(0xc4a020, { metal: 0.75, rough: 0.28 });
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), gold);
  chain.position.y = 0.2;
  g.add(chain);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 20), gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.1;
  g.add(ring);
  const glass = std(0xece8e0, { rough: 0.2, metal: 0.1, emissive: 0xffe6c4, em: 0.55 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), glass);
    drop.position.set(Math.cos(a) * 0.32, -0.18, Math.sin(a) * 0.32);
    g.add(drop);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), gold);
    stem.position.set(Math.cos(a) * 0.32, -0.08, Math.sin(a) * 0.32);
    g.add(stem);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), glass);
  core.position.y = -0.1;
  g.add(core);
  return addShadow(g);
}

export function ceilingFan() {
  const g = new THREE.Group();
  const wood = std(0x6b4a32, { rough: 0.5 });
  const metal = std(0xc8ccd4, { metal: 0.6, rough: 0.3 });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), metal);
  rod.position.y = -0.1;
  g.add(rod);
  const hub = new THREE.Group();
  hub.name = "fanHub";
  hub.userData.spin = "y";
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), metal);
  hub.add(cap);
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.025, 0.16), wood);
    blade.rotation.y = (i * Math.PI) / 2;
    blade.position.set(Math.cos((i * Math.PI) / 2) * 0.55, -0.01, Math.sin((i * Math.PI) / 2) * 0.55);
    hub.add(blade);
  }
  hub.position.y = -0.32;
  g.add(hub);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 8),
    std(0xece8e0, { emissive: 0xffe6c4, em: 0.5, rough: 0.4 }),
  );
  lamp.position.y = -0.42;
  g.add(lamp);
  return addShadow(g);
}

export function iBeam(len: number) {
  const g = new THREE.Group();
  const steel = std(0x4a5058, { metal: 0.72, rough: 0.32 });
  const web = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, len), steel);
  const fl1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, len), steel);
  fl1.position.y = 0.14;
  const fl2 = fl1.clone();
  fl2.position.y = -0.14;
  g.add(web, fl1, fl2);
  return addShadow(g);
}

export function palmTree() {
  const g = new THREE.Group();
  const trunkMat = std(0x8a6a4a, { rough: 0.82 });
  let y = 0;
  for (let i = 0; i < 7; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.13 - i * 0.01, 0.15 - i * 0.01, 0.62, 8), trunkMat);
    seg.position.y = y + 0.31;
    seg.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.06;
    seg.rotation.x = (i % 3 === 0 ? 1 : -1) * 0.03;
    g.add(seg);
    y += 0.56;
  }
  const leaf = std(0x2f7a4a, { rough: 0.68 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 1.85), leaf);
    frond.position.set(Math.cos(a) * 0.45, y + 0.05, Math.sin(a) * 0.45);
    frond.lookAt(new THREE.Vector3(Math.cos(a) * 2.4, y - 0.7, Math.sin(a) * 2.4));
    g.add(frond);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.7), leaf);
    tip.position.set(Math.cos(a) * 1.15, y - 0.25, Math.sin(a) * 1.15);
    tip.lookAt(new THREE.Vector3(Math.cos(a) * 2.6, y - 1.1, Math.sin(a) * 2.6));
    g.add(tip);
  }
  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), leaf);
  crown.position.y = y + 0.1;
  g.add(crown);
  return addShadow(g);
}

export function cypress() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.9, 8), std(0x4a3224, { rough: 0.8 }));
  trunk.position.y = 0.45;
  g.add(trunk);
  const foliage = std(0x1f4a38, { rough: 0.75 });
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.62 - i * 0.09, 1.15, 8), foliage);
    c.position.y = 1.05 + i * 0.62;
    g.add(c);
  }
  return addShadow(g);
}

export function streetlamp() {
  const g = new THREE.Group();
  const metal = std(0x2a3038, { metal: 0.45, rough: 0.4 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.6, 8), metal);
  pole.position.y = 1.8;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.07, 0.07), metal);
  arm.position.set(0.42, 3.5, 0);
  g.add(arm);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.14, 10), metal);
  shade.position.set(0.85, 3.38, 0);
  g.add(shade);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 8),
    std(0xece8e0, { emissive: 0xffe6b0, em: 0.95, rough: 0.3 }),
  );
  lamp.position.set(0.85, 3.28, 0);
  g.add(lamp);
  return addShadow(g);
}

export function hydrant() {
  const g = new THREE.Group();
  const red = std(0x8a3030, { rough: 0.42, metal: 0.25 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.52, 10), red);
  body.position.y = 0.3;
  g.add(body);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), red);
  cap.position.y = 0.56;
  g.add(cap);
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6), std(0xc8ccd4, { metal: 0.6, rough: 0.3 }));
  nut.position.y = 0.64;
  g.add(nut);
  for (const s of [-1, 1]) {
    const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8), red);
    cap2.rotation.z = Math.PI / 2;
    cap2.position.set(0.16 * s, 0.38, 0);
    g.add(cap2);
  }
  return addShadow(g);
}

export function taxi() {
  const g = new THREE.Group();
  const yellow = std(0xc4a020, { rough: 0.38, metal: 0.15 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.48, 0.95), yellow);
  body.position.y = 0.42;
  g.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.42, 0.88),
    std(0x1a2230, { rough: 0.22, opacity: 0.82, metal: 0.1 }),
  );
  cabin.position.set(-0.12, 0.82, 0);
  g.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.22), std(0x1a1420, { rough: 0.5 }));
  roof.position.set(-0.1, 1.08, 0);
  g.add(roof);
  const rubber = std(0x1a1a1a, { rough: 0.9 });
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 12), rubber);
      w.rotation.z = Math.PI / 2;
      w.position.set(0.55 * sx, 0.17, 0.5 * sz);
      g.add(w);
    }
  }
  return addShadow(g);
}

export function rockBlob(s = 1, color = 0x6a5344) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 * s, 0), std(color, { rough: 0.92 }));
  m.scale.set(1.25, 0.72, 1.05);
  m.position.y = 0.24 * s;
  m.rotation.y = s;
  return addShadow(m);
}

export function habitatModule() {
  const g = new THREE.Group();
  const hull = std(0xc8ccd4, { metal: 0.58, rough: 0.32 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 2.5, 18), hull);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.82;
  g.add(body);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.06, 8, 18), std(0x4a5058, { metal: 0.6, rough: 0.35 }));
  ring.rotation.y = Math.PI / 2;
  ring.position.y = 0.82;
  g.add(ring);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.78, 14, 10), hull);
  cap.position.set(1.25, 0.82, 0);
  g.add(cap);
  const cap2 = cap.clone();
  cap2.position.x = -1.25;
  g.add(cap2);
  const win = new THREE.Mesh(
    new THREE.CircleGeometry(0.2, 14),
    std(0x2a8a8a, { emissive: 0x2a8a8a, em: 0.55, metal: 0.2 }),
  );
  win.position.set(0, 0.95, 0.79);
  g.add(win);
  const strut = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), hull);
  strut.position.set(0, 0.25, 0);
  g.add(strut);
  return addShadow(g);
}

export function lighthouse() {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.58, 5.2, 14), std(0xece8e0, { rough: 0.68 }));
  tower.position.y = 2.6;
  g.add(tower);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.45, 14), std(0x8a3030, { rough: 0.55 }));
  band.position.y = 3.1;
  g.add(band);
  const band2 = band.clone();
  band2.position.y = 1.4;
  g.add(band2);
  const walk = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 14), std(0xc8ccd4, { metal: 0.5, rough: 0.4 }));
  walk.position.y = 5.15;
  g.add(walk);
  const lantern = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.55, 12),
    std(0xece8e0, { emissive: 0xffe6b0, em: 0.85, opacity: 0.7 }),
  );
  lantern.position.y = 5.5;
  g.add(lantern);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.35, 12), std(0x8a3030, { rough: 0.5 }));
  cap.position.y = 5.95;
  g.add(cap);
  return addShadow(g);
}

export function waterTower() {
  const g = new THREE.Group();
  const metal = std(0x8a9098, { metal: 0.62, rough: 0.34 });
  for (const a of [0, 1, 2, 3]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6), metal);
    const t = (a / 4) * Math.PI * 2;
    leg.position.set(Math.cos(t) * 0.48, 1.25, Math.sin(t) * 0.48);
    g.add(leg);
  }
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.0, 14), metal);
  tank.position.y = 2.85;
  g.add(tank);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.38, 14), metal);
  cap.position.y = 3.5;
  g.add(cap);
  return addShadow(g);
}

export function hvacUnit() {
  const g = new THREE.Group();
  const metal = std(0x8a9098, { metal: 0.45, rough: 0.5 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 1.1), metal);
  box.position.y = 0.35;
  g.add(box);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), std(0x2a3038, { metal: 0.4, rough: 0.4 }));
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0, 0.42, 0.56);
  g.add(fan);
  const grate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.9), std(0x4a5058, { metal: 0.3, rough: 0.5 }));
  grate.position.y = 0.72;
  g.add(grate);
  return addShadow(g);
}

export function loungeChair() {
  const g = new THREE.Group();
  const cloth = std(0xece8e0, { rough: 0.8 });
  const wood = std(0x6b4a32, { rough: 0.55 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 1.5), cloth);
  seat.position.y = 0.32;
  seat.rotation.x = -0.12;
  g.add(seat);
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 1.55), wood);
    rail.position.set(0.32 * s, 0.28, 0);
    g.add(rail);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.05), wood);
    leg.position.set(0.32 * s, 0.16, 0.6);
    g.add(leg);
    const leg2 = leg.clone();
    leg2.position.z = -0.6;
    g.add(leg2);
  }
  return addShadow(g);
}

export function beachUmbrella(color = 0xece8e0) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.15, 8), std(0x6b4a32, { rough: 0.5 }));
  pole.position.y = 1.07;
  g.add(pole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.32, 14, 1, true), std(color, { rough: 0.65 }));
  shade.position.y = 2.05;
  g.add(shade);
  return addShadow(g);
}

export function ringMesh(color = 0x2a8a8a) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.09, 10, 32),
    std(color, { metal: 0.45, rough: 0.28, emissive: color, em: 0.45 }),
  );
  m.rotation.y = Math.PI / 2;
  g.add(m);
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.03, 8, 28),
    std(0xece8e0, { metal: 0.3, rough: 0.3, emissive: 0xece8e0, em: 0.2 }),
  );
  inner.rotation.y = Math.PI / 2;
  g.add(inner);
  return g;
}

export function coinMesh(color = 0xc4a020) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.05, 18),
    std(color, { metal: 0.85, rough: 0.22, emissive: color, em: 0.2 }),
  );
  m.rotation.x = Math.PI / 2;
  return m;
}

export function crystalMesh() {
  const g = new THREE.Group();
  const mat = std(0x2a8a8a, { metal: 0.25, rough: 0.18, emissive: 0x2a8a8a, em: 0.55, opacity: 0.85 });
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), mat);
  g.add(m);
  const m2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), mat);
  m2.position.y = 0.28;
  m2.rotation.y = 0.4;
  g.add(m2);
  return addShadow(g);
}

export function buoy() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 12), std(0xc45c4a, { rough: 0.38, metal: 0.1 }));
  body.position.y = 0.22;
  g.add(body);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 16), std(0xece8e0, { rough: 0.4 }));
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = 0.22;
  g.add(stripe);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6), std(0xece8e0));
  pole.position.y = 0.58;
  g.add(pole);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.02), std(0xc45c4a, { rough: 0.5 }));
  flag.position.set(0.1, 0.82, 0);
  g.add(flag);
  return g;
}

export function rampMesh(w: number, d: number, h: number) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, 0.18, Math.hypot(d, h));
  const m = new THREE.Mesh(geo, std(0x6a5344, { rough: 0.78 }));
  m.rotation.x = -Math.atan2(h, d);
  m.position.y = h / 2;
  g.add(m);
  const side = std(0x4a4038, { rough: 0.8 });
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, d), side);
    rail.position.set((w / 2) * s, h / 2, 0);
    g.add(rail);
  }
  return addShadow(g);
}

export function speedPad() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.08, 2.2),
    std(0x2a8a8a, { metal: 0.3, rough: 0.4, emissive: 0x2a8a8a, em: 0.45 }),
  );
  base.position.y = 0.04;
  g.add(base);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 3), std(0xece8e0, { emissive: 0xece8e0, em: 0.35 }));
  arrow.rotation.x = Math.PI / 2;
  arrow.position.set(0, 0.12, 0.15);
  g.add(arrow);
  return g;
}

export function dock() {
  const g = new THREE.Group();
  const wood = std(0x6b4a32, { rough: 0.7 });
  for (let i = 0; i < 10; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.28), wood);
    plank.position.set(0, 0.22, i * 0.32);
    g.add(plank);
  }
  for (const s of [-1, 1]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 3.2), wood);
    beam.position.set(0.85 * s, 0.12, 1.45);
    g.add(beam);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.9, 8), wood);
    post.position.set(0.85 * s, 0.45, 3.1);
    g.add(post);
  }
  return addShadow(g);
}
