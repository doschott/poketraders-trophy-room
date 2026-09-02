import * as THREE from "three";
import {
  armchair,
  bed,
  bookcase,
  ceilingFan,
  chandelier,
  coffeeTable,
  desk,
  floorLamp,
  framedCard,
  iBeam,
  kitchenIsland,
  latheTrophy,
  plantPot,
  rug,
  sofa,
  std,
  tile,
  type TexBag,
} from "./meshes";
import { DOOR_HALF, ROOM_X, ROOM_Z, STORY_H } from "./types";
import type { HomeId } from "./types";

export type HouseBuild = {
  group: THREE.Group;
  colliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number; story: 0 | 1 }>;
};

type Hole = { along: number; sill: number; w: number; h: number };

const WIN = { w: 1.32, h: 1.48, sill: 1.02 };
const DOOR_W = DOOR_HALF * 2;
const DOOR_H = 2.38;
const THICK = 0.2;

const THEME: Record<
  HomeId,
  {
    wall: number;
    wallAlt: number;
    trim: number;
    ceil: number;
    door: number;
    glass: number;
    sofa: number;
    exterior: number;
    roof: number;
  }
> = {
  nyc: {
    wall: 0xc4b09a,
    wallAlt: 0x8a4030,
    trim: 0x3a2418,
    ceil: 0xddd4c8,
    door: 0x2b1a12,
    glass: 0x9bb4e8,
    sofa: 0x3a4554,
    exterior: 0x8a4030,
    roof: 0x2a3038,
  },
  cayman: {
    wall: 0xf3efe4,
    wallAlt: 0xe8d4b4,
    trim: 0xb08958,
    ceil: 0xfff8ee,
    door: 0xf3e6cf,
    glass: 0x9fe0e4,
    sofa: 0x2a8a8a,
    exterior: 0xf6efe2,
    roof: 0x8a6a4a,
  },
  lajolla: {
    wall: 0xf4f0e8,
    wallAlt: 0xe4d8c6,
    trim: 0x8a6a48,
    ceil: 0xfffaf3,
    door: 0xeee6d8,
    glass: 0xcfe8f4,
    sofa: 0xece8e0,
    exterior: 0xf6f1e8,
    roof: 0xa05038,
  },
  mars: {
    wall: 0x6a5348,
    wallAlt: 0x4a3228,
    trim: 0xb87333,
    ceil: 0x4e4038,
    door: 0x2e2420,
    glass: 0xe8b090,
    sofa: 0x3a322c,
    exterior: 0x8a9098,
    roof: 0xc8ccd4,
  },
};

export function buildHouse(home: HomeId, tex: TexBag): HouseBuild {
  const g = new THREE.Group();
  g.name = "house";
  const colliders: HouseBuild["colliders"] = [];
  const t = THEME[home];
  const wallH = STORY_H * 2;
  const wallMat = std(t.wall, { map: tile(tex.plaster, 2, 2), rough: 0.86 });
  const altMat = home === "nyc" ? std(0x8a4030, { map: tile(tex.brick, 2.2, 1.6), rough: 0.82 }) : std(t.wallAlt, { map: tile(tex.plaster, 2, 2), rough: 0.84 });
  const extMat =
    home === "nyc"
      ? std(0x8a5040, { map: tile(tex.brick, 3, 2.4), rough: 0.78 })
      : home === "mars"
        ? std(0x8a9098, { metal: 0.55, rough: 0.38 })
        : std(t.exterior, { map: tile(tex.plaster, 2, 2), rough: 0.8 });
  const trimMat = std(t.trim, { rough: 0.48, metal: 0.08 });
  const woodMat = std(0x8a6a4a, { map: tile(tex.wood, 3, 2.4), rough: 0.58 });
  const ceilMat = std(t.ceil, { rough: 0.9 });
  const glassMat = std(t.glass, { metal: 0.12, rough: 0.06, opacity: 0.22 });
  glassMat.side = THREE.DoubleSide;
  const doorMat = std(t.door, { rough: 0.45, metal: 0.06 });

  const floor = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.1, 8.2), woodMat);
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  g.add(floor);

  const ceil = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.1, 8.2), ceilMat);
  ceil.position.y = wallH;
  g.add(ceil);

  const winLow: Hole[] = [
    { along: -3.05, sill: WIN.sill, w: WIN.w, h: WIN.h },
    { along: 3.05, sill: WIN.sill, w: WIN.w, h: WIN.h },
  ];
  const doorHole: Hole = { along: 0, sill: 0, w: DOOR_W, h: DOOR_H };
  const sideHoles: Hole[] = [
    { along: -1.55, sill: WIN.sill, w: WIN.w, h: WIN.h },
    { along: 1.55, sill: WIN.sill, w: WIN.w, h: WIN.h },
  ];

  composeWallX(g, ROOM_Z.max, 0, ROOM_X.min, ROOM_X.max, STORY_H, [...winLow, doorHole], wallMat, THICK);
  composeWallX(g, ROOM_Z.max, STORY_H, ROOM_X.min, ROOM_X.max, STORY_H, winLow, wallMat, THICK);
  composeWallX(g, ROOM_Z.min, 0, ROOM_X.min, ROOM_X.max, STORY_H, winLow, altMat, THICK);
  composeWallX(g, ROOM_Z.min, STORY_H, ROOM_X.min, ROOM_X.max, STORY_H, winLow, altMat, THICK);
  composeWallZ(g, ROOM_X.min, 0, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, wallMat, THICK);
  composeWallZ(g, ROOM_X.min, STORY_H, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, wallMat, THICK);
  composeWallZ(g, ROOM_X.max, 0, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, wallMat, THICK);
  composeWallZ(g, ROOM_X.max, STORY_H, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, wallMat, THICK);

  const extOff = 0.16;
  composeWallX(g, ROOM_Z.max + extOff, 0, ROOM_X.min, ROOM_X.max, STORY_H, [...winLow, doorHole], extMat, 0.12);
  composeWallX(g, ROOM_Z.max + extOff, STORY_H, ROOM_X.min, ROOM_X.max, STORY_H, winLow, extMat, 0.12);
  composeWallX(g, ROOM_Z.min - extOff, 0, ROOM_X.min, ROOM_X.max, STORY_H, winLow, extMat, 0.12);
  composeWallX(g, ROOM_Z.min - extOff, STORY_H, ROOM_X.min, ROOM_X.max, STORY_H, winLow, extMat, 0.12);
  composeWallZ(g, ROOM_X.min - extOff, 0, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, extMat, 0.12);
  composeWallZ(g, ROOM_X.min - extOff, STORY_H, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, extMat, 0.12);
  composeWallZ(g, ROOM_X.max + extOff, 0, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, extMat, 0.12);
  composeWallZ(g, ROOM_X.max + extOff, STORY_H, ROOM_Z.min, ROOM_Z.max, STORY_H, sideHoles, extMat, 0.12);

  for (const story of [0, 1]) {
    const y0 = story * STORY_H;
    for (const hole of winLow) {
      addWindow(g, hole.along, y0 + hole.sill + hole.h / 2, ROOM_Z.max, 0, glassMat, trimMat, home);
      addWindow(g, hole.along, y0 + hole.sill + hole.h / 2, ROOM_Z.min, Math.PI, glassMat, trimMat, home);
    }
    for (const hole of sideHoles) {
      addWindow(g, ROOM_X.min, y0 + hole.sill + hole.h / 2, hole.along, Math.PI / 2, glassMat, trimMat, home);
      addWindow(g, ROOM_X.max, y0 + hole.sill + hole.h / 2, hole.along, -Math.PI / 2, glassMat, trimMat, home);
    }
  }

  addDoors(g, doorMat, glassMat, trimMat);
  addTrim(g, trimMat, wallH);
  addStairs(g, woodMat, trimMat);
  addUpperFloor(g, woodMat);
  addBalcony(g, home, woodMat, trimMat, extMat);
  addRoof(g, home, t.roof, extMat);
  if (home === "nyc") addLoftBeams(g);
  if (home === "cayman") {
    const fan = ceilingFan();
    fan.position.set(0, wallH - 0.08, 0.2);
    g.add(fan);
  } else if (home === "lajolla") {
    const ch = chandelier();
    ch.position.set(0.2, wallH - 0.15, 0.3);
    g.add(ch);
  } else {
    const lightMat = std(0xece8e0, { emissive: 0xffe6c4, em: 0.7, rough: 0.3 });
    for (const x of [-2.2, 2.2]) {
      for (const z of [-1.4, 1.6]) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), lightMat);
        p.position.set(x, wallH - 0.08, z);
        g.add(p);
      }
    }
  }

  furnish(g, home, tex, colliders, t.sofa);
  addTrophies(g, tex, colliders);

  const lampL = new THREE.PointLight(0xffd9a0, 1.6, 9, 2);
  lampL.position.set(-3.4, 1.7, -2.6);
  g.add(lampL);
  const lampR = new THREE.PointLight(0xffe6c4, 1.1, 8, 2);
  lampR.position.set(2.6, 1.8, 1.4);
  g.add(lampR);

  return { group: g, colliders };
}

function panel(g: THREE.Group, w: number, h: number, x: number, y: number, z: number, mat: THREE.Material, thick: number, alongZ = false) {
  if (w < 0.06 || h < 0.06) return;
  const mesh = new THREE.Mesh(alongZ ? new THREE.BoxGeometry(thick, h, w) : new THREE.BoxGeometry(w, h, thick), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
}

function composeWallX(
  g: THREE.Group,
  z: number,
  y0: number,
  x0: number,
  x1: number,
  height: number,
  holes: Hole[],
  mat: THREE.Material,
  thick: number,
) {
  const sorted = [...holes].sort((a, b) => a.along - b.along);
  let cursor = x0;
  for (const op of sorted) {
    const left = op.along - op.w / 2;
    const right = op.along + op.w / 2;
    panel(g, left - cursor, height, (cursor + left) / 2, y0 + height / 2, z, mat, thick);
    if (op.sill > 0.05) panel(g, op.w, op.sill, op.along, y0 + op.sill / 2, z, mat, thick);
    const headerH = height - (op.sill + op.h);
    if (headerH > 0.05) panel(g, op.w, headerH, op.along, y0 + op.sill + op.h + headerH / 2, z, mat, thick);
    cursor = right;
  }
  panel(g, x1 - cursor, height, (cursor + x1) / 2, y0 + height / 2, z, mat, thick);
}

function composeWallZ(
  g: THREE.Group,
  x: number,
  y0: number,
  z0: number,
  z1: number,
  height: number,
  holes: Hole[],
  mat: THREE.Material,
  thick: number,
) {
  const sorted = [...holes].sort((a, b) => a.along - b.along);
  let cursor = z0;
  for (const op of sorted) {
    const left = op.along - op.w / 2;
    const right = op.along + op.w / 2;
    panel(g, left - cursor, height, x, y0 + height / 2, (cursor + left) / 2, mat, thick, true);
    if (op.sill > 0.05) panel(g, op.w, op.sill, x, y0 + op.sill / 2, op.along, mat, thick, true);
    const headerH = height - (op.sill + op.h);
    if (headerH > 0.05) panel(g, op.w, headerH, x, y0 + op.sill + op.h + headerH / 2, op.along, mat, thick, true);
    cursor = right;
  }
  panel(g, z1 - cursor, height, x, y0 + height / 2, (cursor + z1) / 2, mat, thick, true);
}

function addWindow(
  g: THREE.Group,
  x: number,
  y: number,
  z: number,
  rotY: number,
  glass: THREE.Material,
  trim: THREE.Material,
  home: HomeId,
) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  grp.rotation.y = rotY;
  const f = 0.06;
  const w = WIN.w;
  const h = WIN.h;
  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, f, 0.12), trim);
  sill.position.set(0, -h / 2 - f / 2, 0);
  grp.add(sill);
  const header = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, f, 0.1), trim);
  header.position.set(0, h / 2 + f / 2, 0);
  grp.add(header);
  for (const s of [-1, 1]) {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(f, h, 0.1), trim);
    jamb.position.set((w / 2 + f / 2) * s, 0, 0);
    grp.add(jamb);
  }
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, h - 0.04), glass);
  pane.position.z = 0.01;
  grp.add(pane);
  const muntin = std(home === "mars" ? 0xc8ccd4 : 0x3a2418, { rough: 0.45, metal: home === "mars" ? 0.5 : 0.05 });
  const barH = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 0.03, 0.03), muntin);
  grp.add(barH);
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.03, h - 0.08, 0.03), muntin);
  grp.add(barV);
  if (home === "nyc") {
    const barH2 = barH.clone();
    barH2.position.y = h * 0.22;
    const barH3 = barH.clone();
    barH3.position.y = -h * 0.22;
    grp.add(barH2, barH3);
  }
  const drape = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, h + 0.1, 0.04),
    std(0xf6efe4, { rough: 0.9, opacity: 0.35 }),
  );
  drape.position.set(-w / 2 + 0.02, 0, 0.06);
  grp.add(drape);
  g.add(grp);
}

function addDoors(g: THREE.Group, doorMat: THREE.Material, glass: THREE.Material, trim: THREE.Material) {
  const leafW = DOOR_W / 2 - 0.03;
  const leafH = DOOR_H - 0.08;
  for (const sign of [-1, 1] as const) {
    const leaf = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.05), doorMat);
    body.position.x = (sign * leafW) / 2;
    leaf.add(body);
    const lite = new THREE.Mesh(new THREE.PlaneGeometry(leafW * 0.55, leafH * 0.62), glass);
    lite.position.set((sign * leafW) / 2, 0.08, 0.03);
    leaf.add(lite);
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), std(0xc4a020, { metal: 0.8, rough: 0.25 }));
    handle.position.set(sign * (leafW - 0.16), -0.1, 0.05);
    leaf.add(handle);
    leaf.position.set(sign * (DOOR_W / 2), leafH / 2 + 0.04, ROOM_Z.max - 0.02);
    leaf.rotation.y = sign * 1.18;
    g.add(leaf);
  }
  const transom = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.16, 0.08, 0.12), trim);
  transom.position.set(0, DOOR_H + 0.04, ROOM_Z.max);
  g.add(transom);
}

function addTrim(g: THREE.Group, trim: THREE.Material, wallH: number) {
  for (const z of [ROOM_Z.min + 0.04, ROOM_Z.max - 0.04]) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.12, 0.04), trim);
    base.position.set(0, 0.06, z);
    g.add(base);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.08, 0.05), trim);
    crown.position.set(0, wallH - 0.06, z);
    g.add(crown);
  }
}

function addStairs(g: THREE.Group, wood: THREE.Material, trim: THREE.Material) {
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.07, 0.2), wood);
    step.position.set(-4.05, 0.04 + t * STORY_H, -3.55 + t * 2.35);
    step.castShadow = true;
    g.add(step);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 2.55), trim);
  rail.position.set(-3.42, 1.15, -2.4);
  rail.rotation.x = -Math.atan2(STORY_H, 2.35);
  g.add(rail);
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7 + t * 0.2, 0.04), trim);
    post.position.set(-3.42, 0.45 + t * STORY_H * 0.55, -3.4 + t * 2.0);
    g.add(post);
  }
  const newel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), trim);
  newel.position.set(-3.42, 0.5, -3.5);
  g.add(newel);
}

function addUpperFloor(g: THREE.Group, wood: THREE.Material) {
  const hole = { minX: -4.75, maxX: -3.3, minZ: -3.7, maxZ: -1.2 };
  const slabs: Array<[number, number, number, number]> = [
    [10.2, hole.minZ - ROOM_Z.min, 0, (ROOM_Z.min + hole.minZ) / 2],
    [10.2, ROOM_Z.max - hole.maxZ, 0, (ROOM_Z.max + hole.maxZ) / 2],
    [hole.minX - ROOM_X.min, hole.maxZ - hole.minZ, (ROOM_X.min + hole.minX) / 2, (hole.minZ + hole.maxZ) / 2],
    [ROOM_X.max - hole.maxX, hole.maxZ - hole.minZ, (ROOM_X.max + hole.maxX) / 2, (hole.minZ + hole.maxZ) / 2],
  ];
  for (const [w, d, x, z] of slabs) {
    if (w < 0.2 || d < 0.2) continue;
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), wood);
    s.position.set(x, STORY_H, z);
    s.receiveShadow = true;
    g.add(s);
  }
  const railMat = std(0x6b4a32, { rough: 0.5 });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.05), railMat);
  rail.position.set(-4.0, STORY_H + 0.9, hole.maxZ);
  g.add(rail);
  for (const x of [-4.6, -3.5]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.05), railMat);
    post.position.set(x, STORY_H + 0.45, hole.maxZ);
    g.add(post);
  }
}

function addBalcony(g: THREE.Group, home: HomeId, wood: THREE.Material, trim: THREE.Material, ext: THREE.Material) {
  const deck = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.1, 3.2), home === "cayman" ? wood : ext);
  deck.position.set(0, -0.02, ROOM_Z.max + 1.7);
  deck.receiveShadow = true;
  g.add(deck);
  const glass = std(0xece8e0, { metal: 0.1, rough: 0.08, opacity: 0.28 });
  for (const x of [-4.1, -1.4, 1.4, 4.1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.05, 0.06), trim);
    post.position.set(x, 0.52, ROOM_Z.max + 3.2);
    g.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.04, 0.04), trim);
  rail.position.set(0, 1.02, ROOM_Z.max + 3.2);
  g.add(rail);
  const pane = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.85, 0.03), glass);
  pane.position.set(0, 0.55, ROOM_Z.max + 3.2);
  g.add(pane);
  for (const s of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.85, 3.0), glass);
    side.position.set(4.15 * s, 0.55, ROOM_Z.max + 1.7);
    g.add(side);
  }
}

function addRoof(g: THREE.Group, home: HomeId, roofColor: number, ext: THREE.Material) {
  const wallH = STORY_H * 2;
  if (home === "nyc") {
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.55, 8.8), ext);
    parapet.position.y = wallH + 0.2;
    g.add(parapet);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.08, 8.4), std(roofColor, { rough: 0.7 }));
    cap.position.y = wallH + 0.5;
    g.add(cap);
    return;
  }
  if (home === "mars") {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(5.6, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.42),
      std(roofColor, { metal: 0.55, rough: 0.32 }),
    );
    dome.position.y = wallH - 0.4;
    g.add(dome);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.12, 8, 24), std(0x4a5058, { metal: 0.6, rough: 0.35 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = wallH - 0.2;
    g.add(ring);
    return;
  }
  const mat = std(roofColor, { rough: 0.62, metal: home === "cayman" ? 0.35 : 0.05 });
  const rise = 1.8;
  const left = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.12, 6.2), mat);
  left.rotation.x = 0.42;
  left.position.set(0, wallH + rise * 0.45, -1.6);
  g.add(left);
  const right = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.12, 6.2), mat);
  right.rotation.x = -0.42;
  right.position.set(0, wallH + rise * 0.45, 1.8);
  g.add(right);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.1, 0.18), std(0x4a3224, { rough: 0.5 }));
  ridge.position.set(0, wallH + rise * 0.95, 0.1);
  g.add(ridge);
  if (home === "cayman") {
    const eave = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.08, 9.4), std(0x6b4a32, { rough: 0.6 }));
    eave.position.set(0, wallH + 0.05, 0.2);
    g.add(eave);
  }
}

function addLoftBeams(g: THREE.Group) {
  for (const z of [-2.4, -0.4, 1.6, 3.2]) {
    const b = iBeam(10.0);
    b.position.set(0, STORY_H * 2 - 0.22, z);
    g.add(b);
  }
}

function furnish(
  g: THREE.Group,
  home: HomeId,
  tex: TexBag,
  colliders: HouseBuild["colliders"],
  sofaColor: number,
) {
  const r = rug(home === "cayman" ? 0x2a8a8a : home === "lajolla" ? 0x8a6a48 : 0x2a3a44);
  r.position.set(0.3, 0, 0.5);
  g.add(r);

  const sf = sofa(sofaColor);
  sf.position.set(-1.6, 0, 2.15);
  sf.rotation.y = Math.PI;
  g.add(sf);
  colliders.push({ minX: -2.7, maxX: -0.5, minZ: 1.6, maxZ: 2.7, story: 0 });

  const chair = armchair(sofaColor);
  chair.position.set(1.8, 0, 2.0);
  chair.rotation.y = -1.1;
  g.add(chair);
  colliders.push({ minX: 1.35, maxX: 2.25, minZ: 1.55, maxZ: 2.5, story: 0 });

  const table = coffeeTable();
  table.position.set(0.1, 0, 1.15);
  g.add(table);

  const case1 = bookcase();
  case1.position.set(-4.45, 0, 0.35);
  case1.rotation.y = Math.PI / 2;
  g.add(case1);
  colliders.push({ minX: -5, maxX: -3.95, minZ: -0.35, maxZ: 1.15, story: 0 });

  const dsk = desk();
  dsk.position.set(3.55, 0, -2.4);
  dsk.rotation.y = -0.2;
  g.add(dsk);
  colliders.push({ minX: 2.7, maxX: 4.4, minZ: -2.85, maxZ: -1.9, story: 0 });

  const lamp = floorLamp();
  lamp.position.set(-4.2, 0, -3.15);
  g.add(lamp);
  const plant = plantPot();
  plant.position.set(4.35, 0, -3.25);
  g.add(plant);
  const plant2 = plantPot(1.1);
  plant2.position.set(4.3, 0, 3.3);
  g.add(plant2);

  if (tex.cards[0]) {
    const c0 = framedCard(tex.cards[0], 0.58, 0.82);
    c0.position.set(-1.55, 1.62, ROOM_Z.min + 0.14);
    g.add(c0);
  }
  if (tex.cards[1]) {
    const c1 = framedCard(tex.cards[1], 0.46, 0.64);
    c1.position.set(1.55, 1.68, ROOM_Z.min + 0.14);
    g.add(c1);
  }

  const bd = bed();
  bd.position.set(-2.15, STORY_H, -1.55);
  g.add(bd);
  colliders.push({ minX: -3.3, maxX: -1.0, minZ: -2.35, maxZ: -0.7, story: 1 });

  const island = kitchenIsland();
  island.position.set(2.55, STORY_H, 1.5);
  g.add(island);
  colliders.push({ minX: 1.55, maxX: 3.55, minZ: 1.05, maxZ: 1.95, story: 1 });
}

function addTrophies(g: THREE.Group, tex: TexBag, colliders: HouseBuild["colliders"]) {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.42), std(0x6b4a32, { rough: 0.5 }));
  shelf.position.set(0.15, 0.92, -1.35);
  g.add(shelf);
  const sizes = [1.05, 0.82, 0.7, 0.9, 0.62];
  const metals = [0xc4a020, 0xc8ccd4, 0xb87333, 0xc8ccd4, 0xc4a020];
  sizes.forEach((s, i) => {
    const cup = latheTrophy(s, metals[i]);
    cup.position.set(-0.95 + i * 0.52, 0.96, -1.35);
    g.add(cup);
  });
  colliders.push({ minX: -1.2, maxX: 1.5, minZ: -1.65, maxZ: -1.05, story: 0 });
  if (tex.cards[2]) {
    const c2 = framedCard(tex.cards[2], 0.2, 0.28);
    c2.position.set(0.15, 1.18, -1.16);
    g.add(c2);
  }
  const ped = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.3, 1.05, 14),
    std(0xc8ccd4, { metal: 0.45, rough: 0.32 }),
  );
  ped.position.set(-2.35, 0.52, -1.2);
  g.add(ped);
  const hero = latheTrophy(1.2, 0xc4a020);
  hero.position.set(-2.35, 1.05, -1.2);
  g.add(hero);
  colliders.push({ minX: -2.7, maxX: -2.0, minZ: -1.5, maxZ: -0.9, story: 0 });
}

export function inStairs(x: number, z: number) {
  return x >= -4.7 && x <= -3.35 && z >= -3.6 && z <= -1.25;
}

export function stairY(z: number) {
  const t = (z - -3.6) / (-1.25 - -3.6);
  return Math.max(0, Math.min(STORY_H, t * STORY_H));
}
