import * as THREE from "three";
import { addShadow, std } from "./meshes";
import type { VehicleId } from "./types";

export function buildVehicle(id: VehicleId): THREE.Group {
  switch (id) {
    case "helicopter":
      return heli();
    case "paddle-board":
      return paddle();
    case "wind-glider":
      return glider();
    case "rover":
      return rover();
  }
}

function heli() {
  const g = new THREE.Group();
  const hull = std(0x2a3038, { metal: 0.5, rough: 0.32 });
  const stripe = std(0x2a8a8a, { metal: 0.35, rough: 0.4 });
  const silver = std(0xc8ccd4, { metal: 0.72, rough: 0.22 });
  const glass = std(0x7eb0c4, { metal: 0.25, rough: 0.08, opacity: 0.5 });

  const fuseGeo = new THREE.CapsuleGeometry(0.5, 1.85, 6, 16);
  fuseGeo.rotateX(Math.PI / 2);
  const fuse = new THREE.Mesh(fuseGeo, hull);
  fuse.position.set(0, 0.58, 0.12);
  g.add(fuse);
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.12, 1.4), stripe);
  band.position.set(0, 0.52, 0.2);
  g.add(band);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), glass);
  nose.position.set(0, 0.6, 1.12);
  nose.scale.set(1, 0.92, 1.2);
  g.add(nose);

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.18, 2.05, 10), hull);
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0, 0.74, -1.7);
  g.add(tail);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.4), hull);
  fin.position.set(0, 1.02, -2.55);
  g.add(fin);
  const stab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.22), hull);
  stab.position.set(0, 0.72, -2.5);
  g.add(stab);

  const rotor = new THREE.Group();
  rotor.name = "rotor";
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), silver);
  mast.position.y = 0.2;
  rotor.add(mast);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 12), silver);
  hub.position.y = 0.4;
  rotor.add(hub);
  const bladeMat = std(0x1a1420, { rough: 0.45, metal: 0.25 });
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 3.7), bladeMat);
    blade.rotation.y = (i * Math.PI) / 2;
    blade.position.y = 0.42;
    rotor.add(blade);
  }
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.85, 24),
    std(0x1a1420, { opacity: 0.12, rough: 0.8 }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.43;
  rotor.add(disc);
  rotor.position.set(0, 1.12, 0.12);
  g.add(rotor);

  const tailRotor = new THREE.Group();
  tailRotor.name = "tailRotor";
  for (let i = 0; i < 4; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.03), bladeMat);
    b.rotation.z = (i * Math.PI) / 2;
    tailRotor.add(b);
  }
  tailRotor.position.set(0.14, 1.0, -2.58);
  g.add(tailRotor);

  for (const s of [-1, 1]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.35, 8), silver);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(0.46 * s, 0.08, 0.12);
    g.add(skid);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.46, 6), silver);
    strut.position.set(0.46 * s, 0.3, 0.45);
    g.add(strut);
    const strut2 = strut.clone();
    strut2.position.z = -0.38;
    g.add(strut2);
  }

  const light = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 8, 6),
    std(0xc45c4a, { emissive: 0xc45c4a, em: 1 }),
  );
  light.position.set(0, 0.4, 1.48);
  g.add(light);

  g.userData.kind = "helicopter";
  return addShadow(g);
}

function paddle() {
  const g = new THREE.Group();
  const deck = std(0xece8e0, { rough: 0.42 });
  const rail = std(0x2a8a8a, { rough: 0.38 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.09, 2.85), deck);
  board.position.y = 0.08;
  g.add(board);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.39, 14, 10), deck);
  nose.scale.set(1, 0.2, 0.72);
  nose.position.set(0, 0.08, 1.32);
  g.add(nose);
  const tail = nose.clone();
  tail.position.z = -1.32;
  g.add(tail);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 2.4), rail);
  stripe.position.y = 0.1;
  g.add(stripe);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.78), std(0x1a2230, { rough: 0.9 }));
  pad.position.set(0, 0.14, -0.12);
  g.add(pad);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 6, 12), std(0x2a3038, { metal: 0.4, rough: 0.4 }));
  handle.position.set(0, 0.16, 0.95);
  handle.rotation.x = Math.PI / 2;
  g.add(handle);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.3), std(0x1a1420, { rough: 0.5 }));
  fin.position.set(0, -0.06, -1.1);
  g.add(fin);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.7, 6), std(0x6b4a32, { rough: 0.5 }));
  shaft.position.set(0.32, 0.78, 0.18);
  shaft.rotation.z = 0.28;
  g.add(shaft);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.03), std(0x2a8a8a, { rough: 0.4 }));
  blade.position.set(0.48, 0.04, 0.18);
  blade.rotation.z = 0.28;
  g.add(blade);
  g.userData.kind = "paddle-board";
  return addShadow(g);
}

function glider() {
  const g = new THREE.Group();
  const sail = std(0xece8e0, { rough: 0.52 });
  const boom = std(0x6b4a32, { rough: 0.48 });
  const wing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.05, 1.7), sail);
  wing.position.y = 1.22;
  g.add(wing);
  const keel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 2.15), sail);
  keel.position.set(0, 1.18, 0.15);
  g.add(keel);
  for (const s of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.85, 8), sail);
    tip.rotation.z = (Math.PI / 2) * s;
    tip.position.set(2.7 * s, 1.22, 0);
    g.add(tip);
  }
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.02, 0.14), std(0x2a8a8a, { rough: 0.4 }));
  stripe.position.set(0, 1.26, 0.2);
  g.add(stripe);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.35, 8), boom);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 0.52;
  g.add(bar);
  const down = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.78, 6), boom);
  down.position.set(0, 0.88, 0);
  g.add(down);
  for (const s of [-1, 1]) {
    const stay = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.5, 5), boom);
    stay.position.set(0.55 * s, 0.88, 0);
    stay.rotation.z = 0.85 * s;
    g.add(stay);
  }
  const harness = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.72), std(0x1a2230, { rough: 0.7 }));
  harness.position.y = 0.46;
  g.add(harness);
  g.userData.kind = "wind-glider";
  return addShadow(g);
}

function rover() {
  const g = new THREE.Group();
  const hull = std(0xc8ccd4, { metal: 0.58, rough: 0.32 });
  const dark = std(0x2a3038, { metal: 0.32, rough: 0.48 });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.3, 2.2), hull);
  chassis.position.y = 0.58;
  g.add(chassis);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.52, 0.95),
    std(0x7eb0c4, { metal: 0.22, rough: 0.12, opacity: 0.48 }),
  );
  cabin.position.set(0, 0.96, 0.18);
  g.add(cabin);
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.04, 1.15),
    std(0x1a2230, { metal: 0.45, rough: 0.28, emissive: 0x1a2230, em: 0.22 }),
  );
  panel.position.set(0, 1.24, -0.58);
  panel.rotation.x = -0.38;
  g.add(panel);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), hull);
  mast.position.set(0.38, 1.42, 0.42);
  g.add(mast);
  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.16), dark);
  cam.position.set(0.38, 1.92, 0.42);
  g.add(cam);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hull);
  dish.position.set(-0.4, 1.55, -0.2);
  dish.rotation.x = Math.PI;
  g.add(dish);

  const wheels = new THREE.Group();
  wheels.name = "wheels";
  const rubber = std(0x1a1420, { rough: 0.9 });
  const spots = [
    [-0.78, 0.24, 0.82],
    [0.78, 0.24, 0.82],
    [-0.78, 0.24, 0],
    [0.78, 0.24, 0],
    [-0.78, 0.24, -0.82],
    [0.78, 0.24, -0.82],
  ];
  for (const [x, y, z] of spots) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.55), hull);
    arm.position.set(x * 0.55, 0.4, z);
    g.add(arm);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 14), rubber);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    wheels.add(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 10), dark);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, y, z);
    wheels.add(hub);
  }
  g.add(wheels);

  const lightL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), std(0xece8e0, { emissive: 0xece8e0, em: 0.9 }));
  lightL.position.set(-0.42, 0.58, 1.14);
  g.add(lightL);
  const lightR = lightL.clone();
  lightR.position.x = 0.42;
  g.add(lightR);

  g.userData.kind = "rover";
  return addShadow(g);
}

export function spinVehicle(g: THREE.Group, speed: number, dt: number) {
  const rotor = g.getObjectByName("rotor");
  const tail = g.getObjectByName("tailRotor");
  const wheels = g.getObjectByName("wheels");
  if (rotor) rotor.rotation.y += (10 + Math.abs(speed) * 2.4) * dt;
  if (tail) tail.rotation.x += (16 + Math.abs(speed) * 3) * dt;
  if (wheels) {
    for (const c of wheels.children) {
      c.rotation.x += speed * 2.6 * dt;
    }
  }
}
