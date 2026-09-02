#!/usr/bin/env node
/**
 * On a source-only Vercel deploy the JPEG/PNG textures are not in the file
 * tree. Pull them from the public GitHub repo so `public/` is complete before
 * Vite copies it. Local preview already has the files, so this is a no-op.
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  process.env.TROPHY_ASSETS_BASE ??
  "https://raw.githubusercontent.com/doschott/poketraders-trophy-room/main";

const ASSETS = [
  "public/og.jpg",
  "public/x-banner.jpg",
  "public/homes/nyc.jpg",
  "public/homes/cayman.jpg",
  "public/homes/lajolla.jpg",
  "public/homes/mars.jpg",
  "public/cards/fox.jpg",
  "public/cards/dragon.jpg",
  "public/cards/owl.jpg",
  "public/textures/wood.jpg",
  "public/textures/plaster.jpg",
  "public/textures/sand.jpg",
  "public/textures/asphalt.jpg",
  "public/textures/mars.jpg",
  "public/textures/rock.jpg",
  "public/textures/brick.jpg",
  "public/textures/nyc-facade.jpg",
  "public/textures/nyc-sky.jpg",
  "public/textures/cayman-sky.jpg",
  "public/textures/lajolla-sky.jpg",
  "public/textures/mars-sky.jpg",
  "public/__grok/icon-180.png",
  "public/__grok/install/assets/homescreen/ob-phone.png",
  "public/__grok/install/assets/homescreen/ob-ipad.png",
];

async function main() {
  for (const rel of ASSETS) {
    const dest = join(ROOT, rel);
    if (existsSync(dest) && statSync(dest).size > 1024) continue;
    mkdirSync(dirname(dest), { recursive: true });
    const url = `${BASE}/${rel}`;
    console.log("[assets] fetch", rel);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`asset fetch failed ${res.status} ${url}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
}

main().catch((err) => {
  console.error("[assets]", err);
  process.exit(1);
});
