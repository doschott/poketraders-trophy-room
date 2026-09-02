import * as THREE from "three";
import { coinMesh, crystalMesh, rampMesh, ringMesh, speedPad } from "./meshes";
import type { HomeId, Pickup, Ramp } from "./types";

export type Course = {
  pickups: Pickup[];
  ramps: Ramp[];
  group: THREE.Group;
};

export function buildCourse(home: HomeId): Course {
  const group = new THREE.Group();
  group.name = "course";
  const pickups: Pickup[] = [];
  const ramps: Ramp[] = [];

  if (home === "nyc") {
    const rings: Array<[number, number, number]> = [
      [0, 7, 20],
      [-12, 11, 28],
      [-20, 16, 40],
      [-14, 22, 54],
      [0, 20, 68],
      [14, 18, 62],
      [22, 12, 48],
      [18, 10, 32],
      [8, 9, 22],
      [-6, 14, 36],
      [4, 24, 78],
      [-18, 15, 66],
    ];
    rings.forEach((p, i) => addRing(pickups, group, p, i));
    const coins: Array<[number, number, number]> = [
      [4, 5.5, 16],
      [-7, 8, 24],
      [10, 12, 40],
      [-16, 18, 50],
      [8, 16, 72],
      [0, 7, 26],
      [16, 11, 56],
      [-10, 9, 18],
    ];
    coins.forEach((p, i) => addCoin(pickups, group, p, i));
  } else if (home === "cayman") {
    const gates: Array<[number, number, number]> = [
      [0, 0.95, 20],
      [6.5, 0.95, 28],
      [-5, 0.95, 36],
      [9, 0.95, 44],
      [-7, 0.95, 52],
      [5, 0.95, 60],
      [0, 0.95, 70],
      [-10, 0.95, 64],
      [12, 0.95, 50],
      [-3, 0.95, 78],
    ];
    gates.forEach((p, i) => addRing(pickups, group, p, i, 0xece8e0));
    const coins: Array<[number, number, number]> = [
      [3, 0.5, 24],
      [-5, 0.5, 32],
      [8, 0.5, 40],
      [-3, 0.5, 48],
      [6, 0.5, 56],
      [1, 0.5, 66],
      [-12, 0.5, 42],
      [14, 0.5, 52],
      [0, 0.5, 18],
      [10, 0.5, 34],
      [-8, 0.5, 72],
    ];
    coins.forEach((p, i) => addCoin(pickups, group, p, i));
  } else if (home === "lajolla") {
    const rings: Array<[number, number, number]> = [
      [2, 5.5, 16],
      [10, 8, 24],
      [18, 11, 34],
      [10, 13, 46],
      [-4, 10, 40],
      [-14, 7, 30],
      [0, 12, 54],
      [14, 15, 64],
      [-8, 9, 50],
      [4, 11, 72],
      [20, 8, 48],
    ];
    rings.forEach((p, i) => addRing(pickups, group, p, i, 0xece8e0));
    const coins: Array<[number, number, number]> = [
      [6, 5, 20],
      [14, 9, 38],
      [-6, 6, 28],
      [2, 8, 48],
      [8, 12, 60],
      [-10, 7, 44],
    ];
    coins.forEach((p, i) => addCoin(pickups, group, p, i));
  } else {
    const rings: Array<[number, number, number]> = [
      [0, 1.3, 18],
      [-8, 1.3, 28],
      [10, 1.5, 36],
      [-4, 1.3, 48],
      [8, 1.7, 58],
      [0, 1.5, 70],
      [-14, 1.4, 54],
      [16, 1.6, 64],
    ];
    rings.forEach((p, i) => addRing(pickups, group, p, i, 0xc8ccd4));
    const crystals: Array<[number, number, number]> = [
      [4, 0.5, 16],
      [-10, 0.5, 24],
      [14, 0.5, 32],
      [-6, 0.5, 40],
      [12, 0.5, 52],
      [-12, 0.5, 60],
      [6, 0.5, 66],
      [0, 0.5, 44],
      [18, 0.5, 22],
    ];
    crystals.forEach((p, i) => addCrystal(pickups, group, p, i));
    const rampDefs: Ramp[] = [
      { x: 2, z: 22, w: 2.6, d: 3.4, h: 1.5, yaw: 0 },
      { x: -10, z: 34, w: 2.6, d: 3.4, h: 1.7, yaw: 0.4 },
      { x: 12, z: 46, w: 2.8, d: 3.6, h: 1.9, yaw: -0.3 },
      { x: 0, z: 62, w: 3.0, d: 3.8, h: 2.1, yaw: 0 },
    ];
    for (const r of rampDefs) {
      ramps.push(r);
      const m = rampMesh(r.w, r.d, r.h);
      m.position.set(r.x, 0, r.z);
      m.rotation.y = r.yaw;
      group.add(m);
    }
    const pads: Array<[number, number, number]> = [
      [0, 0, 26],
      [8, 0, 40],
      [-6, 0, 52],
    ];
    pads.forEach((p, i) => addPad(pickups, group, p, i));
  }

  return { pickups, ramps, group };
}

function addRing(list: Pickup[], group: THREE.Group, p: [number, number, number], i: number, color?: number) {
  const mesh = ringMesh(color);
  mesh.position.set(p[0], p[1], p[2]);
  group.add(mesh);
  list.push({
    id: `ring-${i}`,
    kind: "ring",
    x: p[0],
    y: p[1],
    z: p[2],
    r: 1.4,
    taken: false,
    value: 100,
    seq: i,
    mesh,
  });
}

function addCoin(list: Pickup[], group: THREE.Group, p: [number, number, number], i: number) {
  const mesh = coinMesh();
  mesh.position.set(p[0], p[1], p[2]);
  group.add(mesh);
  list.push({
    id: `coin-${i}`,
    kind: "coin",
    x: p[0],
    y: p[1],
    z: p[2],
    r: 0.55,
    taken: false,
    value: 25,
    mesh,
  });
}

function addCrystal(list: Pickup[], group: THREE.Group, p: [number, number, number], i: number) {
  const mesh = crystalMesh();
  mesh.position.set(p[0], p[1], p[2]);
  group.add(mesh);
  list.push({
    id: `xtal-${i}`,
    kind: "crystal",
    x: p[0],
    y: p[1],
    z: p[2],
    r: 0.6,
    taken: false,
    value: 40,
    mesh,
  });
}

function addPad(list: Pickup[], group: THREE.Group, p: [number, number, number], i: number) {
  const mesh = speedPad();
  mesh.position.set(p[0], p[1], p[2]);
  group.add(mesh);
  list.push({
    id: `pad-${i}`,
    kind: "pad",
    x: p[0],
    y: p[1] + 0.4,
    z: p[2],
    r: 1.1,
    taken: false,
    value: 50,
    mesh,
  });
}

export function bobPickups(list: Pickup[], t: number) {
  for (const p of list) {
    if (p.taken || !p.mesh) continue;
    const m = p.mesh as THREE.Object3D;
    if (p.kind === "ring") {
      m.rotation.y = t * 0.7;
    } else if (p.kind === "pad") {
      m.position.y = 0.02 + Math.sin(t * 4) * 0.03;
    } else {
      m.position.y = p.y + Math.sin(t * 3 + p.x) * 0.12;
      m.rotation.y = t * 2.2;
    }
  }
}
