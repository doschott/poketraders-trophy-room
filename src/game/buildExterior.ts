import * as THREE from "three";
import {
  beachUmbrella,
  cypress,
  dock,
  habitatModule,
  hvacUnit,
  hydrant,
  lighthouse,
  loungeChair,
  palmTree,
  rockBlob,
  std,
  streetlamp,
  taxi,
  tile,
  waterTower,
  type TexBag,
} from "./meshes";
import { waterTex } from "./procTex";
import type { HomeId } from "./types";
import { WORLD } from "./types";

export function buildExterior(home: HomeId, tex: TexBag): THREE.Group {
  const g = new THREE.Group();
  g.name = "exterior";

  if (home === "nyc") nyc(g, tex);
  else if (home === "cayman") cayman(g, tex);
  else if (home === "lajolla") lajolla(g, tex);
  else mars(g, tex);

  return g;
}

function nyc(g: THREE.Group, tex: TexBag) {
  const roofMat = std(0x4a4e54, { map: tile(tex.asphalt, 10, 10), rough: 0.92 });
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(28, 0.16, 22), roofMat);
  terrace.position.set(0, -0.08, 10);
  terrace.receiveShadow = true;
  g.add(terrace);

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.1, 36), std(0x2a3038, { rough: 0.55 }));
  pad.position.set(0, 0.05, 14);
  pad.receiveShadow = true;
  g.add(pad);
  const H = std(0xece8e0, { rough: 0.35 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.03, 0.2), H);
  bar.position.set(0, 0.12, 14);
  g.add(bar);
  for (const x of [-0.8, 0.8]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 1.5), H);
    b.position.set(x, 0.12, 14);
    g.add(b);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.04, 8, 40), std(0xc45c4a, { rough: 0.4 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.12, 14);
  g.add(ring);

  const facade = std(0x8a9098, { map: tile(tex.facade, 1.4, 2.2), rough: 0.55, metal: 0.08 });
  const facade2 = std(0x6a7078, { map: tile(tex.facade, 1.1, 2.6), rough: 0.5 });
  const facade3 = std(0x9aa0a8, { map: tile(tex.facade, 1.6, 1.8), rough: 0.58 });
  const towers: Array<[number, number, number, number, number, THREE.Material]> = [
    [-22, 36, 9, 28, 11, facade],
    [-32, 58, 11, 36, 12, facade2],
    [24, 38, 10, 26, 11, facade],
    [34, 60, 12, 40, 12, facade3],
    [-16, 74, 8, 22, 10, facade2],
    [16, 78, 9, 24, 10, facade],
    [0, 88, 7, 18, 9, facade3],
    [-38, 28, 10, 20, 10, facade],
    [40, 30, 9, 22, 10, facade2],
    [-26, 16, 8, 16, 9, facade3],
    [28, 16, 8, 18, 9, facade],
    [-20, -16, 10, 24, 10, facade2],
    [22, -16, 9, 20, 10, facade],
    [0, -18, 12, 16, 8, facade3],
  ];
  for (const [x, z, w, h, d, mat] of towers) {
    addTower(g, x, z, w, h, d, mat);
  }

  g.add(at(taxi(), -7.2, 16.5, 0.35));
  g.add(at(hydrant(), 3.4, 8.6));
  g.add(at(streetlamp(), 7.2, 11));
  g.add(at(streetlamp(), -9, 20));
  g.add(at(streetlamp(), 11, 32));
  g.add(at(hvacUnit(), -8, 8));
  g.add(at(hvacUnit(), 9.5, 22));
  const wt = waterTower();
  wt.position.set(-10, 0, 26);
  g.add(wt);
  const planterMat = std(0x4a4038, { rough: 0.7 });
  const dirt = std(0x3a2418, { rough: 0.95 });
  const leaf = std(0x2f6a4a, { rough: 0.7 });
  for (const [x, z] of [
    [-10, 7],
    [10, 7],
    [-6, 18],
    [6, 18],
  ] as const) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.7), planterMat);
    box.position.set(x, 0.2, z);
    g.add(box);
    const soil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.5), dirt);
    soil.position.set(x, 0.42, z);
    g.add(soil);
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), leaf);
    bush.position.set(x, 0.7, z);
    g.add(bush);
  }
}

function addTower(g: THREE.Group, x: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
  const baseH = Math.min(4.2, h * 0.18);
  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 1.1, baseH, d + 1.1), mat);
  base.position.set(x, baseH / 2, z);
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(w, h - baseH - 1.6, d), mat);
  shaft.position.set(x, baseH + (h - baseH - 1.6) / 2, z);
  shaft.castShadow = true;
  g.add(shaft);
  const crownH = 1.6;
  const crown = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, crownH, d + 0.6), mat);
  crown.position.set(x, h - crownH / 2, z);
  g.add(crown);
  if (h > 22) {
    const t = waterTower();
    t.position.set(x, h, z);
    t.scale.setScalar(1.15);
    g.add(t);
  } else {
    const unit = hvacUnit();
    unit.position.set(x, h, z);
    g.add(unit);
  }
  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.4, 0.18, d + 0.4),
    std(0x4a5058, { metal: 0.3, rough: 0.5 }),
  );
  ledge.position.set(x, h * 0.55, z);
  g.add(ledge);
}

function cayman(g: THREE.Group, tex: TexBag) {
  const sandMat = std(0xc8b48a, { map: tile(tex.sand, 14, 14), rough: 0.95 });
  const beach = new THREE.Mesh(new THREE.CircleGeometry(18, 36), sandMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, 0, 12);
  beach.receiveShadow = true;
  g.add(beach);
  const spit = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 16), sandMat);
  spit.position.set(0, -0.04, 10);
  spit.receiveShadow = true;
  g.add(spit);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 90, 1, 1),
    std(0x2a8a8a, { map: waterTex(), rough: 0.18, metal: 0.22, opacity: 0.78 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.18, 48);
  water.name = "water";
  water.receiveShadow = true;
  g.add(water);
  const deep = new THREE.Mesh(new THREE.PlaneGeometry(110, 90), std(0x164858, { rough: 0.4 }));
  deep.rotation.x = -Math.PI / 2;
  deep.position.set(0, -0.55, 48);
  g.add(deep);

  for (const [x, z, s] of [
    [-9, 12, 1],
    [10, 16, 1.1],
    [-15, 24, 0.9],
    [17, 30, 1.2],
    [-7, 36, 1],
    [13, 42, 0.85],
    [-18, 48, 1.15],
    [8, 56, 1],
    [0, 22, 0.8],
  ] as const) {
    const p = palmTree();
    p.position.set(x, 0, z);
    p.scale.setScalar(s);
    g.add(p);
  }

  g.add(at(loungeChair(), 3.4, 9.2, 0.2));
  g.add(at(loungeChair(), 4.2, 10.4, -0.15));
  g.add(at(beachUmbrella(0xece8e0), -2.2, 11.2));
  g.add(at(beachUmbrella(0xc45c4a), 6.4, 13.5));
  const d = dock();
  d.position.set(-1.2, 0, 16);
  g.add(d);

  for (const [x, z, r] of [
    [14, 28, 2.4],
    [-16, 40, 3.1],
    [10, 62, 2.8],
    [-8, 70, 3.4],
  ] as const) {
    const isle = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.6, 0.5, 14), sandMat);
    isle.position.set(x, -0.05, z);
    g.add(isle);
    const p = palmTree();
    p.position.set(x, 0.2, z);
    p.scale.setScalar(0.7);
    g.add(p);
  }

  g.add(at(rockBlob(1.1, 0x8a7a68), -4, 18));
  g.add(at(rockBlob(0.8, 0x7a6a58), 8, 20));
}

function lajolla(g: THREE.Group, tex: TexBag) {
  const stone = std(0x8a7a68, { map: tile(tex.rock, 8, 8), rough: 0.9 });
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(22, 0.18, 16), stone);
  terrace.position.set(0, -0.06, 10);
  terrace.receiveShadow = true;
  g.add(terrace);

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 70),
    std(0x2a6a7a, { map: waterTex(), rough: 0.2, metal: 0.18, opacity: 0.74 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -1.35, 64);
  water.name = "water";
  g.add(water);

  const cliffs: Array<[number, number, number, number, number, number]> = [
    [-12, 16, 7, 3.2, 6, 0.2],
    [13, 18, 8, 3.8, 7, -0.15],
    [-18, 28, 9, 4.6, 8, 0.3],
    [20, 32, 8, 3.4, 7, -0.25],
    [0, 42, 12, 5.2, 9, 0.05],
    [-24, 22, 7, 3.0, 6, 0.4],
    [26, 26, 8, 3.6, 6, -0.3],
    [-10, 50, 10, 6.0, 8, 0.1],
    [14, 54, 9, 5.4, 8, -0.1],
  ];
  for (const [x, z, w, h, d, rot] of cliffs) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
    c.position.set(x, h / 2 - 0.4, z);
    c.rotation.y = rot;
    c.castShadow = true;
    c.receiveShadow = true;
    g.add(c);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.35, d * 0.92), std(0x6a5a4a, { rough: 0.92 }));
    cap.position.set(x, h - 0.2, z);
    cap.rotation.y = rot;
    g.add(cap);
  }

  g.add(at(cypress(), -6.5, 12));
  g.add(at(cypress(), 8.2, 14.5));
  g.add(at(cypress(), -12, 24));
  g.add(at(cypress(), 15, 30));
  g.add(at(cypress(), -4, 20));
  const lh = lighthouse();
  lh.position.set(20, 0, 48);
  g.add(lh);
  g.add(at(rockBlob(1.5), -5, 19));
  g.add(at(rockBlob(1.2, 0x7a6a58), 7, 26));
  g.add(at(rockBlob(1.8, 0x8a7a68), 2, 34));
  g.add(at(loungeChair(), 3.2, 9));
}

function mars(g: THREE.Group, tex: TexBag) {
  const ground = std(0xb05a38, { map: tile(tex.mars, 16, 16), rough: 0.95 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), ground);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, -0.02, 36);
  plane.receiveShadow = true;
  g.add(plane);

  for (const [x, z, r] of [
    [-14, 24, 3.4],
    [18, 32, 4.2],
    [4, 50, 5.4],
    [-22, 42, 3.8],
    [26, 60, 4.6],
    [-8, 72, 3.2],
  ] as const) {
    const crater = new THREE.Mesh(new THREE.RingGeometry(r * 0.4, r, 24), std(0x8a4030, { rough: 0.96 }));
    crater.rotation.x = -Math.PI / 2;
    crater.position.set(x, 0.04, z);
    g.add(crater);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.7, 0.28, 8, 20), std(0xa05038, { rough: 0.94 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, 0.12, z);
    g.add(rim);
  }

  g.add(at(habitatModule(), 9, 18, 0.4));
  const m2 = habitatModule();
  m2.position.set(-16, 0, 34);
  m2.rotation.y = 0.8;
  g.add(m2);
  const m3 = habitatModule();
  m3.position.set(14, 0, 44);
  m3.rotation.y = -0.5;
  g.add(m3);

  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 5.2, 8), std(0xc8ccd4, { metal: 0.65, rough: 0.28 }));
  ant.position.set(6, 2.6, 14);
  g.add(ant);
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    std(0xc8ccd4, { metal: 0.6, rough: 0.28 }),
  );
  dish.position.set(6, 5.2, 14);
  dish.rotation.x = Math.PI;
  g.add(dish);

  const solar = std(0x1a2230, { metal: 0.5, rough: 0.25, emissive: 0x1a2230, em: 0.15 });
  for (const [x, z] of [
    [-8, 12],
    [-11, 14],
    [12, 22],
  ] as const) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 1.4), solar);
    p.position.set(x, 1.1, z);
    p.rotation.x = -0.4;
    g.add(p);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.1, 6), std(0xc8ccd4, { metal: 0.5, rough: 0.4 }));
    mast.position.set(x, 0.55, z);
    g.add(mast);
  }

  g.add(at(rockBlob(1.7, 0xb05a38), -6, 16));
  g.add(at(rockBlob(1.3, 0x8a4030), 12, 26));
  g.add(at(rockBlob(2.1, 0xa05038), -8, 44));
  g.add(at(rockBlob(1.4, 0x6a4030), 20, 40));
  g.add(at(rockBlob(1.8, 0xb05a38), 4, 58));
  g.add(at(rockBlob(1.2, 0x8a4030), -18, 28));

  for (const [x, z, h] of [
    [-30, 36, 8],
    [32, 48, 10],
    [-28, 70, 7],
    [30, 78, 9],
  ] as const) {
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(6, h, 7), std(0x8a4030, { rough: 0.95 }));
    mtn.position.set(x, h / 2 - 0.4, z);
    g.add(mtn);
  }
}

function at(obj: THREE.Object3D, x: number, z: number, yaw = 0) {
  obj.position.set(x, 0, z);
  if (yaw) obj.rotation.y = yaw;
  return obj;
}

export function groundHeight(home: HomeId, x: number, z: number): number {
  if (home === "cayman") {
    if (z > 17) return -0.08;
    return 0;
  }
  if (home === "lajolla") {
    if (z > 52) return -1.2;
    return Math.max(0, 0.35 * Math.sin(x * 0.08) * Math.cos(z * 0.05));
  }
  if (home === "mars") {
    return 0.14 * Math.sin(x * 0.12) + 0.1 * Math.cos(z * 0.09);
  }
  return 0;
}
