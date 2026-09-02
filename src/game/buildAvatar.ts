import * as THREE from "three";
import { addShadow, std } from "./meshes";
import type { HomeId } from "./types";

const OUTFIT: Record<HomeId, { shirt: number; pants: number; accent: number }> = {
  nyc: { shirt: 0x1a2230, pants: 0x2a3038, accent: 0xc8ccd4 },
  cayman: { shirt: 0x2a8a8a, pants: 0xece8e0, accent: 0x6b4a32 },
  lajolla: { shirt: 0xece8e0, pants: 0x3a4554, accent: 0x2a8a8a },
  mars: { shirt: 0xc8ccd4, pants: 0xc8ccd4, accent: 0x6a4030 },
};

export function buildAvatar(home: HomeId, colorOverride?: number) {
  const g = new THREE.Group();
  const o = OUTFIT[home];
  const shirt = std(colorOverride ?? o.shirt, { rough: 0.7 });
  const pants = std(o.pants, { rough: 0.75 });
  const skin = std(0xd4b08c, { rough: 0.65 });
  const hair = std(0x1a1420, { rough: 0.8 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 6, 10), shirt);
  torso.position.y = 1.05;
  g.add(torso);

  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), pants);
  hips.position.y = 0.78;
  hips.scale.set(1.05, 0.7, 0.85);
  g.add(hips);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), skin);
  head.position.y = 1.52;
  g.add(head);
  const scalp = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 10), hair);
  scalp.position.y = 1.58;
  scalp.scale.set(1, 0.7, 1);
  g.add(scalp);

  const eyeMat = std(0x1a1420, { rough: 0.4 });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), eyeMat);
    eye.position.set(0.055 * s, 1.54, 0.14);
    g.add(eye);
  }

  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.38, 4, 8), shirt);
    arm.position.set(0.3 * s, 1.12, 0);
    arm.rotation.z = 0.18 * s;
    g.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skin);
    hand.position.set(0.36 * s, 0.86, 0.02);
    g.add(hand);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.42, 4, 8), pants);
    leg.position.set(0.12 * s, 0.42, 0);
    g.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), std(0x1a1420, { rough: 0.6 }));
    shoe.position.set(0.12 * s, 0.05, 0.04);
    g.add(shoe);
  }

  if (home === "mars") {
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      std(0x2a8a8a, { metal: 0.4, rough: 0.2, opacity: 0.55, emissive: 0x2a8a8a, em: 0.15 }),
    );
    visor.position.y = 1.54;
    visor.rotation.x = Math.PI;
    g.add(visor);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.12), std(0xc8ccd4, { metal: 0.4, rough: 0.4 }));
    pack.position.set(0, 1.08, -0.24);
    g.add(pack);
  }

  g.userData.walk = { t: 0 };
  return addShadow(g);
}

export function bobAvatar(g: THREE.Group, moving: boolean, dt: number) {
  const d = g.userData.walk as { t: number };
  d.t += dt * (moving ? 10 : 2);
  const swing = moving ? Math.sin(d.t) * 0.35 : 0;
  const limbs = g.children.filter((c) => c instanceof THREE.Mesh);
  // capsule limbs are indices around 6-11; keep a light bounce on the group
  g.position.y = moving ? Math.abs(Math.sin(d.t * 2)) * 0.04 : 0;
  void limbs;
  void swing;
}
