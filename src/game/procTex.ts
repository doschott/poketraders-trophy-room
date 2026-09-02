import * as THREE from "three";

function canvasTex(size: number, draw: (ctx: CanvasRenderingContext2D, n: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (ctx) draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

export function waterTex() {
  return canvasTex(256, (ctx, n) => {
    ctx.fillStyle = "#1a6a78";
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 28; i++) {
      ctx.strokeStyle = i % 2 ? "rgba(80,200,196,0.22)" : "rgba(20,70,90,0.28)";
      ctx.lineWidth = 2 + (i % 3);
      ctx.beginPath();
      const y = (i * 19) % n;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(n * 0.3, y + 12, n * 0.7, y - 14, n, y + 4);
      ctx.stroke();
    }
  });
}

export function noiseTex(a: string, b: string, specks = 1800) {
  return canvasTex(256, (ctx, n) => {
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < specks; i++) {
      ctx.fillStyle = b;
      ctx.globalAlpha = 0.08 + (i % 5) * 0.03;
      ctx.fillRect((i * 47) % n, (i * 91) % n, 2 + (i % 3), 2);
    }
    ctx.globalAlpha = 1;
  });
}

export function metalPanelTex() {
  return canvasTex(256, (ctx, n) => {
    ctx.fillStyle = "#8a9098";
    ctx.fillRect(0, 0, n, n);
    ctx.strokeStyle = "rgba(20,20,24,0.35)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(4, 4 + i * 64, n - 8, 56);
    }
    ctx.fillStyle = "rgba(200,200,210,0.35)";
    for (let y = 0; y < 4; y++) {
      for (const x of [12, n - 16]) {
        ctx.beginPath();
        ctx.arc(x, 32 + y * 64, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}
