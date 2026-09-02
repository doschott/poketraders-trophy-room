import * as THREE from "three";
import { GameAudio } from "./audio";
import { buildAvatar } from "./buildAvatar";
import { buildExterior, groundHeight } from "./buildExterior";
import { buildHouse, inStairs, stairY } from "./buildHouse";
import { buildVehicle, spinVehicle } from "./buildVehicle";
import { bobPickups, buildCourse } from "./challenges";
import { HOMES, readBest, writeBest, type HomeDef } from "./homes";
import { Input } from "./input";
import { disposeObject, type TexBag } from "./meshes";
import {
  BOARD_RANGE,
  DOOR_HALF,
  EYE,
  PLAYER_R,
  ROOM_X,
  ROOM_Z,
  STORY_H,
  WALK_SPEED,
  WORLD,
  type HomeId,
  type HudSnap,
  type NetState,
  type PeerPose,
  type Pickup,
} from "./types";

export type EngineOpts = {
  canvas: HTMLCanvasElement;
  home: HomeId;
  roomCode: string;
  selfId: string;
  playerName: string;
  onHud: (h: HudSnap) => void;
  onBroadcast?: (s: NetState) => void;
};

const LOOK_SENS = 0.0022;
const FIXED = 1 / 60;
const _f = new THREE.Vector3();
const _r = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _desired = new THREE.Vector3();
const _look = new THREE.Vector3();
const _cam = new THREE.Vector3();

export class TrophyEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(70, 1, 0.08, 420);
  private input: Input;
  private audio = new GameAudio();
  private home: HomeDef;
  private roomCode: string;
  private selfId: string;
  private playerName: string;
  private onHud: (h: HudSnap) => void;
  onBroadcast?: (s: NetState) => void;
  private canvas: HTMLCanvasElement;

  private px = 0;
  private py = 0;
  private pz = 0.6;
  private yaw = 0;
  private pitch = -0.08;
  private walkSpeed = 0;
  private boarded = false;
  private vx = 0;
  private vy = 0.45;
  private vz = 14.2;
  private vyaw = 0;
  private vspeed = 0;
  private driving = true;
  private score = 0;
  private best = 0;
  private elapsed = 0;
  private startedAt = 0;
  private courseDone = false;
  private muted = false;
  private toast = "";
  private toastT = 0;
  private prompt = "";
  private trauma = 0;
  private lastHud = 0;
  private lastNet = 0;
  private acc = 0;
  private lastT = 0;
  private running = false;
  private disposed = false;

  private vehicle!: THREE.Group;
  private localAvatar!: THREE.Group;
  private houseColliders: Array<{ minX: number; maxX: number; minZ: number; maxZ: number; story: 0 | 1 }> = [];
  private pickups: Pickup[] = [];
  private worldRoot = new THREE.Group();
  private remoteRoot = new THREE.Group();
  private remotes = new Map<string, { group: THREE.Group; pose: PeerPose; target: PeerPose }>();
  private floaters: Array<{ mesh: THREE.Sprite; t: number }> = [];
  private color: number;
  private textures: TexBag | null = null;
  private roverAir = 0;
  private combo = 0;
  private comboT = 0;
  private nextRing = 0;
  private water: THREE.Mesh | null = null;
  private padMesh: THREE.Mesh | null = null;

  constructor(opts: EngineOpts) {
    this.canvas = opts.canvas;
    this.home = HOMES[opts.home];
    this.roomCode = opts.roomCode;
    this.selfId = opts.selfId;
    this.playerName = opts.playerName;
    this.onHud = opts.onHud;
    this.onBroadcast = opts.onBroadcast;
    this.best = readBest(opts.home);
    this.color = this.home.accent;
    this.input = new Input(opts.canvas);
    this.yaw = Math.PI;
    this.vyaw = Math.PI;

    this.renderer = new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(opts.canvas.clientWidth || 800, opts.canvas.clientHeight || 600, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene.fog = new THREE.Fog(this.home.fog, 48, 160);
    this.scene.background = new THREE.Color(this.home.fog);

    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVis);
    this.startShell();
    void this.loadWorld();
  }

  unlockAudio() {
    this.audio.unlock();
  }

  setTouchBoard(v: boolean) {
    this.input.setTouchBoard(v);
  }

  setTouchLift(v: number) {
    this.input.setTouchLift(v);
  }

  toggleMute() {
    this.muted = !this.muted;
    this.audio.setMuted(this.muted);
  }

  private startShell() {
    this.scene.add(new THREE.HemisphereLight(this.home.hemi, 0x1a1420, 1.05));
    const sun0 = new THREE.DirectionalLight(this.home.sun, 1.35);
    sun0.position.set(32, 48, 22);
    sun0.castShadow = true;
    sun0.shadow.mapSize.set(1536, 1536);
    sun0.shadow.camera.near = 4;
    sun0.shadow.camera.far = 140;
    sun0.shadow.camera.left = -60;
    sun0.shadow.camera.right = 60;
    sun0.shadow.camera.top = 60;
    sun0.shadow.camera.bottom = -60;
    this.scene.add(sun0);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.28));
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140),
      new THREE.MeshStandardMaterial({ color: this.home.fog, roughness: 0.95 }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, -0.06, 32);
    pad.receiveShadow = true;
    pad.name = "bootPad";
    this.padMesh = pad;
    this.scene.add(pad);

    this.vehicle = buildVehicle(this.home.vehicle);
    this.vx = 0;
    this.vz = 14.2;
    this.vy = this.home.flying ? 1.2 : 0.35;
    this.vehicle.position.set(this.vx, this.vy, this.vz);
    this.scene.add(this.vehicle);
    this.localAvatar = buildAvatar(this.home.id);
    this.scene.add(this.localAvatar);
    this.scene.add(this.remoteRoot);

    this.wireProbe();
    this.onResize();
    this.running = true;
    this.lastT = performance.now();
    this.startedAt = this.lastT;
    this.renderer.setAnimationLoop(this.loop);
    this.pushHud(true);
  }

  setPeerGone(id: string) {
    const r = this.remotes.get(id);
    if (r) {
      this.remoteRoot.remove(r.group);
      disposeObject(r.group);
      this.remotes.delete(id);
    }
  }

  applyRemote(from: string, data: unknown) {
    const s = data as NetState;
    if (!s || typeof s.x !== "number") return;
    const pose: PeerPose = {
      id: from,
      name: s.name || "Friend",
      x: s.x,
      y: s.y,
      z: s.z,
      yaw: s.yaw,
      boarded: !!s.boarded,
      vx: s.vx,
      vy: s.vy,
      vz: s.vz,
      vyaw: s.vyaw,
      vspeed: s.vspeed,
      score: s.score ?? 0,
      color: s.color || 0xc8ccd4,
    };
    let slot = this.remotes.get(from);
    if (!slot) {
      const group = buildAvatar(this.home.id, pose.color);
      this.remoteRoot.add(group);
      slot = { group, pose, target: pose };
      this.remotes.set(from, slot);
    }
    slot.target = pose;
  }

  dispose() {
    this.disposed = true;
    this.running = false;
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVis);
    this.input.dispose();
    if (window.__controlsTest) delete window.__controlsTest;
    disposeObject(this.scene);
    this.renderer.dispose();
  }

  private async loadWorld() {
    try {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const load = (url: string) =>
      new Promise<THREE.Texture>((res, rej) => {
        loader.load(
          url,
          (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            res(t);
          },
          undefined,
          rej,
        );
      });
    const [wood, plaster, sand, asphalt, mars, rock, facade, brick, sky, fox, dragon, owl] = await Promise.all([
      load("/textures/wood.jpg"),
      load("/textures/plaster.jpg"),
      load("/textures/sand.jpg"),
      load("/textures/asphalt.jpg"),
      load("/textures/mars.jpg"),
      load("/textures/rock.jpg"),
      load("/textures/nyc-facade.jpg"),
      load("/textures/brick.jpg"),
      load(this.home.sky),
      load("/cards/fox.jpg"),
      load("/cards/dragon.jpg"),
      load("/cards/owl.jpg"),
    ]);
    if (this.disposed) return;
    this.textures = { wood, plaster, sand, asphalt, mars, rock, facade, brick, sky, cards: [fox, dragon, owl] };

    const skyMat = new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, depthWrite: false, fog: false });
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 28, 18), skyMat));
    const house = buildHouse(this.home.id, this.textures);
    this.houseColliders = house.colliders;
    this.worldRoot.add(house.group);
    const ext = buildExterior(this.home.id, this.textures);
    this.worldRoot.add(ext);
    const water = ext.getObjectByName("water");
    if (water instanceof THREE.Mesh) this.water = water;
    const course = buildCourse(this.home.id);
    this.pickups = course.pickups;
    this.worldRoot.add(course.group);
    this.scene.add(this.worldRoot);
    if (this.padMesh) {
      this.scene.remove(this.padMesh);
      this.padMesh.geometry.dispose();
      (this.padMesh.material as THREE.Material).dispose();
      this.padMesh = null;
    }
    } catch (err) {
      console.warn("Trophy room textures failed", err);
    }
  }

  private wireProbe() {
    window.__controlsTest = {
      getYaw: () => (this.boarded ? this.vyaw : this.yaw),
      getSpeed: () => (this.boarded ? Math.abs(this.vspeed) : this.walkSpeed),
      setSteer: (v) => {
        this.input.steerOverride = v;
      },
      setKeys: (codes) => {
        this.input.setKeys(codes);
        if (codes.includes("KeyW") || codes.includes("KeyA") || codes.includes("KeyD") || codes.includes("KeyS")) {
          this.forceBoard();
        }
        if (codes.length === 0) this.input.clearInjected();
      },
    };
  }

  private forceBoard() {
    if (this.boarded) return;
    this.boarded = true;
    this.driving = true;
    this.px = this.vx;
    this.pz = this.vz;
    this.py = this.vy;
    this.toast = "Boarded";
    this.toastT = 1.2;
  }

  private loop = (now: number) => {
    if (!this.running || this.disposed) return;
    let dt = (now - this.lastT) / 1000;
    this.lastT = now;
    if (!Number.isFinite(dt) || dt <= 0) dt = FIXED;
    dt = Math.min(dt, 0.1);
    this.acc += dt;
    let steps = 0;
    while (this.acc >= FIXED && steps < 5) {
      this.fixed(FIXED);
      this.acc -= FIXED;
      steps++;
    }
    this.present(dt, now);
    this.renderer.render(this.scene, this.camera);
  };

  private fixed(dt: number) {
    const a = this.input.sample();
    if (a.mute) {
      this.muted = !this.muted;
      this.audio.setMuted(this.muted);
    }
    this.elapsed += dt;
    this.toastT = Math.max(0, this.toastT - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    this.comboT = Math.max(0, this.comboT - dt);
    if (this.comboT <= 0) this.combo = 0;

    const near = Math.hypot(this.px - this.vx, this.pz - this.vz) < BOARD_RANGE;
    if (a.board) {
      if (this.boarded) this.exitVehicle();
      else if (near || this.outside()) this.forceBoard();
    }

    if (this.boarded && this.driving) this.drive(a, dt);
    else if (!this.boarded) this.walk(a, dt);
    else this.ridePassenger(dt);

    this.collect();
    this.syncVehicleMesh(dt);
    this.syncLocalAvatar();
  }

  private walk(a: ReturnType<Input["sample"]>, dt: number) {
    this.yaw -= a.lookX * LOOK_SENS;
    this.pitch -= a.lookY * LOOK_SENS;
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch));

    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    const rx = Math.cos(this.yaw);
    const rz = -Math.sin(this.yaw);
    let mx = rx * a.moveX + fx * a.moveY;
    let mz = rz * a.moveX + fz * a.moveY;
    const mag = Math.hypot(mx, mz);
    if (mag > 1) {
      mx /= mag;
      mz /= mag;
    }
    const sprint = 1;
    const nx = this.px + mx * WALK_SPEED * sprint * dt;
    const nz = this.pz + mz * WALK_SPEED * sprint * dt;
    if (!this.blocked(nx, this.py, this.pz)) this.px = nx;
    if (!this.blocked(this.px, this.py, nz)) this.pz = nz;
    this.walkSpeed = Math.hypot(mx, mz) * WALK_SPEED;

    if (inStairs(this.px, this.pz)) this.py = stairY(this.pz);
    else if (this.py > STORY_H - 0.4 && !this.outside()) this.py = STORY_H;
    else if (!this.outside()) this.py = 0;
    else this.py = groundHeight(this.home.id, this.px, this.pz);

    this.prompt = Math.hypot(this.px - this.vx, this.pz - this.vz) < BOARD_RANGE ? `Board ${this.home.vehicleLabel}  ·  E` : this.outside() ? "" : "Walk through the door";
  }

  private drive(a: ReturnType<Input["sample"]>, dt: number) {
    const flying = this.home.flying;
    const max = flying ? 14 : this.home.vehicle === "rover" ? 9 : 6.2;
    const accel = flying ? 10 : 8;
    const turnRate = 2.4;
    this.vspeed += a.throttle * accel * dt;
    this.vspeed *= Math.exp(-1.6 * dt);
    this.vspeed = Math.max(-max * 0.4, Math.min(max, this.vspeed));
    const reverse = this.vspeed >= 0 ? 1 : -1;
    const speedFactor = 0.5 + 0.5 * Math.min(1, Math.abs(this.vspeed) / Math.max(0.4, max));
    this.vyaw += a.steer * turnRate * speedFactor * reverse * dt;

    const fx = -Math.sin(this.vyaw);
    const fz = -Math.cos(this.vyaw);
    this.vx += fx * this.vspeed * dt;
    this.vz += fz * this.vspeed * dt;
    this.vx = clamp(this.vx, WORLD.minX + 1.2, WORLD.maxX - 1.2);
    this.vz = clamp(this.vz, ROOM_Z.max + 0.8, WORLD.maxZ - 1.2);

    if (flying) {
      this.vy += a.lift * 4.2 * dt;
      this.vy = clamp(this.vy, 0.4, 22);
    } else if (this.home.vehicle === "paddle-board") {
      this.vy = groundHeight(this.home.id, this.vx, this.vz) + 0.12;
    } else {
      const gh = groundHeight(this.home.id, this.vx, this.vz);
      const ramp = this.rampBoost();
      if (ramp > 0) {
        this.vy += ramp * dt;
        this.roverAir += dt;
        if (this.roverAir > 0.45) {
          this.addScore(10, this.vx, this.vy + 1, this.vz);
          this.roverAir = 0;
        }
      } else {
        this.vy += -12 * dt;
        this.roverAir = 0;
      }
      this.vy = Math.max(gh + 0.32, this.vy);
    }

    this.px = this.vx;
    this.pz = this.vz;
    this.py = this.vy;
    this.yaw = this.vyaw;
    this.walkSpeed = Math.abs(this.vspeed);
    this.prompt = "Steer A / D  ·  E to hop off";
  }

  private rampBoost() {
    // Simple lift when driving over a ramp AABB
    if (this.home.vehicle !== "rover") return 0;
    for (const o of this.pickups) {
      void o;
    }
    // Approximate: if near known ramp z-bands and moving forward
    if (this.vspeed > 2) {
      const zs = [22, 34, 46, 62];
      for (const z of zs) {
        if (Math.abs(this.vz - z) < 1.6) return 9;
      }
    }
    return 0;
  }

  private ridePassenger(dt: number) {
    // Follow the lowest-id boarded remote if they claim the vehicle
    let driver: PeerPose | null = null;
    for (const r of this.remotes.values()) {
      if (r.target.boarded) {
        if (!driver || r.target.id < driver.id) driver = r.target;
      }
    }
    if (driver && driver.id < this.selfId) {
      this.vx = driver.vx;
      this.vy = driver.vy;
      this.vz = driver.vz;
      this.vyaw = driver.vyaw;
      this.vspeed = driver.vspeed;
    }
    this.px = this.vx;
    this.py = this.vy;
    this.pz = this.vz;
    this.yaw = this.vyaw;
    void dt;
  }

  private exitVehicle() {
    this.boarded = false;
    const fx = -Math.sin(this.vyaw);
    const fz = -Math.cos(this.vyaw);
    this.px = this.vx - fx * 1.4;
    this.pz = this.vz - fz * 1.4;
    this.py = groundHeight(this.home.id, this.px, this.pz);
    this.vspeed *= 0.2;
    this.audio.thump();
    this.prompt = "";
  }

  private collect() {
    if (!this.boarded && !this.outside()) return;
    const x = this.boarded ? this.vx : this.px;
    const y = this.boarded ? this.vy : this.py + 1.2;
    const z = this.boarded ? this.vz : this.pz;
    for (const p of this.pickups) {
      if (p.taken) continue;
      const d = Math.hypot(x - p.x, y - p.y, z - p.z);
      if (d < p.r + 0.7) {
        p.taken = true;
        const mesh = p.mesh as THREE.Object3D | undefined;
        if (mesh) mesh.visible = false;
        if (p.kind === "pad") this.vspeed = Math.max(this.vspeed, 11);
        let mult = 1;
        if (p.kind === "ring") {
          if (p.seq === this.nextRing) {
            this.combo = Math.min(8, this.combo + 1);
            this.nextRing += 1;
          } else {
            this.combo = 1;
            this.nextRing = (p.seq ?? 0) + 1;
          }
          this.comboT = 4.2;
          mult = this.combo;
        } else if (this.comboT > 0) {
          this.comboT = 4.2;
          mult = Math.max(1, this.combo);
        }
        this.addScore(p.value * mult, p.x, p.y, p.z);
        this.audio.collect(p.kind === "ring");
        this.trauma = Math.min(1, this.trauma + (p.kind === "ring" ? 0.28 : 0.12));
      }
    }
    if (!this.courseDone) {
      const left = this.pickups.filter((p) => !p.taken).length;
      if (left === 0 && this.pickups.length > 0) {
        this.courseDone = true;
        const bonus = Math.max(0, Math.round(300 - this.elapsed * 4));
        this.addScore(500 + bonus, x, y + 1.4, z);
        this.audio.complete();
        this.toast = bonus > 0 ? `Course clear  +${500 + bonus}` : "Course clear";
        this.toastT = 3;
        writeBest(this.home.id, this.score);
        this.best = Math.max(this.best, this.score);
      }
    }
  }

  private addScore(n: number, x: number, y: number, z: number) {
    this.score += n;
    writeBest(this.home.id, this.score);
    this.best = Math.max(this.best, this.score);
    this.spawnFloater(x, y + 0.6, z, `+${n}`);
  }

  private spawnFloater(x: number, y: number, z: number, text: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 256, 128);
    ctx.fillStyle = "#ece8e0";
    ctx.font = "700 64px Figtree, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, 128, 84);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const spr = new THREE.Sprite(mat);
    spr.position.set(x, y, z);
    spr.scale.set(1.6, 0.8, 1);
    this.scene.add(spr);
    this.floaters.push({ mesh: spr, t: 0.9 });
  }

  private syncVehicleMesh(dt: number) {
    this.vehicle.position.set(this.vx, this.vy, this.vz);
    const fx = -Math.sin(this.vyaw);
    const fz = -Math.cos(this.vyaw);
    _f.set(fx, 0, fz);
    this.vehicle.lookAt(this.vx + _f.x, this.vy, this.vz + _f.z);
    if (this.home.vehicle === "wind-glider") {
      this.vehicle.rotation.z *= Math.exp(-4 * dt);
    }
    spinVehicle(this.vehicle, this.vspeed, dt);
  }

  private syncLocalAvatar() {
    this.localAvatar.visible = !this.boarded;
    if (!this.boarded) {
      this.localAvatar.position.set(this.px, this.py, this.pz);
      const fx = -Math.sin(this.yaw);
      const fz = -Math.cos(this.yaw);
      this.localAvatar.lookAt(this.px + fx, this.py, this.pz + fz);
    }
  }

  private present(dt: number, now: number) {
    bobPickups(this.pickups, now / 1000);
    if (this.water) {
      const mat = this.water.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.offset.x = (now / 18000) % 1;
        mat.map.offset.y = (now / 24000) % 1;
      }
    }
    this.worldRoot.traverse((o) => {
      if (o.userData.spin === "y") o.rotation.y += dt * 5.5;
    });
    for (const f of this.floaters) {
      f.t -= dt;
      f.mesh.position.y += dt * 1.2;
      const mat = f.mesh.material as THREE.SpriteMaterial;
      mat.opacity = Math.max(0, f.t / 0.9);
    }
    this.floaters = this.floaters.filter((f) => {
      if (f.t > 0) return true;
      this.scene.remove(f.mesh);
      (f.mesh.material as THREE.SpriteMaterial).map?.dispose();
      (f.mesh.material as THREE.Material).dispose();
      return false;
    });

    for (const r of this.remotes.values()) {
      r.pose.x += (r.target.x - r.pose.x) * (1 - Math.exp(-10 * dt));
      r.pose.y += (r.target.y - r.pose.y) * (1 - Math.exp(-10 * dt));
      r.pose.z += (r.target.z - r.pose.z) * (1 - Math.exp(-10 * dt));
      r.pose.yaw = r.target.yaw;
      r.group.visible = !r.target.boarded;
      r.group.position.set(r.pose.x, r.pose.y, r.pose.z);
      const fx = -Math.sin(r.pose.yaw);
      const fz = -Math.cos(r.pose.yaw);
      r.group.lookAt(r.pose.x + fx, r.pose.y, r.pose.z + fz);
    }

    this.updateCamera(dt);
    if (now - this.lastHud > 80) {
      this.lastHud = now;
      this.pushHud();
    }
    if (now - this.lastNet > 50) {
      this.lastNet = now;
      this.onBroadcast?.({
        t: now,
        x: this.px,
        y: this.py,
        z: this.pz,
        yaw: this.yaw,
        boarded: this.boarded,
        vx: this.vx,
        vy: this.vy,
        vz: this.vz,
        vyaw: this.vyaw,
        vspeed: this.vspeed,
        score: this.score,
        name: this.playerName,
        color: this.color,
      });
    }
  }

  private updateCamera(dt: number) {
    const shake = this.trauma * this.trauma;
    const ox = (Math.random() * 2 - 1) * shake * 0.12;
    const oy = (Math.random() * 2 - 1) * shake * 0.08;
    if (this.boarded) {
      const fx = -Math.sin(this.vyaw);
      const fz = -Math.cos(this.vyaw);
      _f.set(fx, 0, fz);
      const dist = this.home.flying ? 8.5 : 6.4;
      const height = this.home.flying ? 3.2 : 2.3;
      _desired.set(this.vx - _f.x * dist, this.vy + height, this.vz - _f.z * dist);
      _cam.lerp(_desired, 1 - Math.exp(-6 * dt));
      this.camera.position.copy(_cam);
      this.camera.position.x += ox;
      this.camera.position.y += oy;
      _look.set(this.vx, this.vy + 0.6, this.vz);
      this.camera.lookAt(_look);
    } else {
      const fx = -Math.sin(this.yaw);
      const fy = Math.sin(this.pitch);
      const fz = -Math.cos(this.yaw);
      const cp = Math.cos(this.pitch);
      this.camera.position.set(this.px + ox, this.py + EYE + oy, this.pz);
      this.camera.lookAt(this.px + fx * cp, this.py + EYE + fy, this.pz + fz * cp);
    }
  }

  private outside() {
    return this.pz > ROOM_Z.max + 0.2;
  }

  private blocked(x: number, y: number, z: number) {
    const r = PLAYER_R;
    const story: 0 | 1 = y >= STORY_H - 0.45 ? 1 : 0;
    if (inStairs(x, z) && story !== 1) return false;
    if (z > ROOM_Z.max + 0.12) {
      if (x < WORLD.minX + r || x > WORLD.maxX - r) return true;
      if (z > WORLD.maxZ - r) return true;
      return false;
    }
    const inDoor = Math.abs(x) <= DOOR_HALF && z >= ROOM_Z.max - r - 0.2 && z <= ROOM_Z.max + 0.5;
    if (inDoor && story === 0) return false;
    if (x < ROOM_X.min + r || x > ROOM_X.max - r || z < ROOM_Z.min + r || z > ROOM_Z.max - r) return true;
    return this.houseColliders.some(
      (c) => (c.story ?? 0) === story && x > c.minX && x < c.maxX && z > c.minZ && z < c.maxZ,
    );
  }

  private pushHud(force = false) {
    const remaining = this.pickups.filter((p) => !p.taken).length;
    const snap: HudSnap = {
      score: this.score,
      best: this.best,
      remaining,
      total: this.pickups.length,
      boarded: this.boarded,
      vehicleLabel: this.home.vehicleLabel,
      prompt: this.toastT > 0 ? this.toast : this.prompt,
      location: this.outside() || this.boarded ? "outside" : "den",
      roomCode: this.roomCode,
      peers: this.remotes.size,
      toast: this.toastT > 0 ? this.toast : "",
      speed: Math.abs(this.boarded ? this.vspeed : this.walkSpeed),
      altitude: this.vy,
      courseDone: this.courseDone,
      elapsed: this.elapsed,
      muted: this.muted,
      combo: this.combo,
    };
    this.onHud(snap);
    void force;
  }

  private onResize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  private onVis = () => {
    if (document.visibilityState === "visible") this.audio.resume();
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

void _r;
void _up;
