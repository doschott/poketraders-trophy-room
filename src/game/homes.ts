import type { HomeId, VehicleId } from "./types";

export type HomeDef = {
  id: HomeId;
  name: string;
  place: string;
  blurb: string;
  vehicle: VehicleId;
  vehicleLabel: string;
  challenge: string;
  thumb: string;
  sky: string;
  ground: string;
  fog: number;
  hemi: number;
  sun: number;
  accent: number;
  water?: boolean;
  flying: boolean;
};

export const HOMES: Record<HomeId, HomeDef> = {
  nyc: {
    id: "nyc",
    name: "Fifth Avenue Loft",
    place: "New York",
    blurb: "A wood-and-steel penthouse above Midtown. The helicopter waits on the pad.",
    vehicle: "helicopter",
    vehicleLabel: "Rooftop helicopter",
    challenge: "Thread rooftop rings. Stay low enough to read the city.",
    thumb: "/homes/nyc.jpg",
    sky: "/textures/nyc-sky.jpg",
    ground: "/textures/asphalt.jpg",
    fog: 0x1a2230,
    hemi: 0xb8c4d4,
    sun: 0xffe6c8,
    accent: 0x2a8a8a,
    flying: true,
  },
  cayman: {
    id: "cayman",
    name: "Coral Reach",
    place: "Grand Cayman",
    blurb: "Open shutters, salt air, a paddle board on teal water just past the sand.",
    vehicle: "paddle-board",
    vehicleLabel: "Paddle board",
    challenge: "Slalom the buoys and scoop coins off the lagoon.",
    thumb: "/homes/cayman.jpg",
    sky: "/textures/cayman-sky.jpg",
    ground: "/textures/sand.jpg",
    fog: 0x7eb8c8,
    hemi: 0xd8f0f4,
    sun: 0xfff1c8,
    accent: 0x2a8a8a,
    water: true,
    flying: false,
  },
  lajolla: {
    id: "lajolla",
    name: "Cliff House",
    place: "La Jolla",
    blurb: "White plaster over the Pacific. A wind glider leans on the terrace rail.",
    vehicle: "wind-glider",
    vehicleLabel: "Wind glider",
    challenge: "Ride the cliff lift and punch coastal rings.",
    thumb: "/homes/lajolla.jpg",
    sky: "/textures/lajolla-sky.jpg",
    ground: "/textures/rock.jpg",
    fog: 0x8aa8b8,
    hemi: 0xd0e4ee,
    sun: 0xffe8c4,
    accent: 0x2a8a8a,
    flying: true,
  },
  mars: {
    id: "mars",
    name: "Tharsis Dome",
    place: "Mars",
    blurb: "A sealed den under rust sky. The rover is parked on packed regolith.",
    vehicle: "rover",
    vehicleLabel: "Surface rover",
    challenge: "Hit the ramps, grab crystals, thread the canyon gates.",
    thumb: "/homes/mars.jpg",
    sky: "/textures/mars-sky.jpg",
    ground: "/textures/mars.jpg",
    fog: 0x6a4030,
    hemi: 0xe0b090,
    sun: 0xffd0a0,
    accent: 0xc8ccd4,
    flying: false,
  },
};

export const HOME_LIST = Object.values(HOMES);

export function isHomeId(v: string): v is HomeId {
  return v === "nyc" || v === "cayman" || v === "lajolla" || v === "mars";
}

export function parseRoomCode(raw: string): { home: HomeId; code: string } | null {
  const s = raw.trim().toUpperCase().replace(/\s+/g, "");
  const m = s.match(/^(NYC|CAYMAN|LAJOLLA|MARS)-([A-Z0-9]{4,8})$/i);
  if (!m) return null;
  return { home: m[1].toLowerCase() as HomeId, code: m[2].toUpperCase() };
}

export function makeRoomCode(home: HomeId): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `${home}-${code}`;
}

export function roomKey(code: string): string {
  return `tr-${code.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60)}`;
}

const BEST_KEY = "trophy-room-best-v1";

export function readBest(home: HomeId): number {
  try {
    const raw = localStorage.getItem(`${BEST_KEY}:${home}`);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function writeBest(home: HomeId, score: number) {
  try {
    const prev = readBest(home);
    if (score > prev) localStorage.setItem(`${BEST_KEY}:${home}`, String(score));
  } catch {
    /* ignore */
  }
}
