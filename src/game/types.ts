export const HOME_IDS = ["nyc", "cayman", "lajolla", "mars"] as const;
export type HomeId = (typeof HOME_IDS)[number];

export type VehicleId = "helicopter" | "paddle-board" | "wind-glider" | "rover";

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer?: (v: number) => void;
  setKeys?: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

export type PickupKind = "ring" | "coin" | "crystal" | "pad";

export type Pickup = {
  id: string;
  kind: PickupKind;
  x: number;
  y: number;
  z: number;
  r: number;
  taken: boolean;
  value: number;
  seq?: number;
  mesh?: unknown;
};

export type Ramp = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  yaw: number;
};

export type PeerPose = {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  boarded: boolean;
  vx: number;
  vy: number;
  vz: number;
  vyaw: number;
  vspeed: number;
  score: number;
  color: number;
};

export type NetState = {
  t: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  boarded: boolean;
  vx: number;
  vy: number;
  vz: number;
  vyaw: number;
  vspeed: number;
  score: number;
  name: string;
  color: number;
};

export type HudSnap = {
  score: number;
  best: number;
  remaining: number;
  total: number;
  boarded: boolean;
  vehicleLabel: string;
  prompt: string;
  location: "den" | "outside";
  roomCode: string;
  peers: number;
  toast: string;
  speed: number;
  altitude: number;
  courseDone: boolean;
  elapsed: number;
  muted: boolean;
  combo: number;
};

export const ROOM_X = { min: -5, max: 5 };
export const ROOM_Z = { min: -4, max: 4 };
export const STORY_H = 3.2;
export const PLAYER_R = 0.28;
export const WALK_SPEED = 3.15;
export const DOOR_HALF = 1.18;
export const BOARD_RANGE = 2.2;
export const WORLD = { minX: -48, maxX: 48, minZ: -22, maxZ: 92 };
export const EYE = 1.58;
