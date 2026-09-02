const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyE",
  "KeyC",
  "KeyM",
  "KeyR",
  "Escape",
]);

export type Actions = {
  throttle: number;
  steer: number;
  lift: number;
  moveX: number;
  moveY: number;
  board: boolean;
  mute: boolean;
  lookX: number;
  lookY: number;
};

function radialDeadzone(x: number, y: number, dz = 0.15) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export class Input {
  keys = new Set<string>();
  injected: Set<string> | null = null;
  steerOverride: number | null = null;
  lookX = 0;
  lookY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  touchLookX = 0;
  touchLookY = 0;
  touchBoard = false;
  touchLift = 0;
  private prevBoard = false;
  private prevMute = false;
  private stickId: number | null = null;
  private lookId: number | null = null;
  private stickOrigin = { x: 0, y: 0 };
  private lookLast = { x: 0, y: 0 };
  private boardHeld = false;
  private liftHeld = 0;
  private canvas: HTMLElement;
  private onBlur = () => {
    this.keys.clear();
  };

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    document.addEventListener("visibilitychange", this.onBlur);
    canvas.addEventListener("mousemove", this.onMouse);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    document.removeEventListener("visibilitychange", this.onBlur);
    this.canvas.removeEventListener("mousemove", this.onMouse);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
  }

  setKeys(codes: string[]) {
    this.injected = new Set(codes);
  }

  clearInjected() {
    this.injected = null;
    this.steerOverride = null;
  }

  sample(): Actions {
    const k = this.injected ?? this.keys;
    let throttle = 0;
    let steer = 0;
    let lift = 0;
    let moveX = 0;
    let moveY = 0;
    if (k.has("KeyW") || k.has("ArrowUp")) {
      throttle += 1;
      moveY += 1;
    }
    if (k.has("KeyS") || k.has("ArrowDown")) {
      throttle -= 1;
      moveY -= 1;
    }
    if (k.has("KeyA") || k.has("ArrowLeft")) steer += 1;
    if (k.has("KeyD") || k.has("ArrowRight")) steer -= 1;
    if (k.has("Space")) lift += 1;
    if (k.has("ShiftLeft") || k.has("ShiftRight")) lift -= 1;
    if (this.steerOverride != null) steer = this.steerOverride;

    moveX += this.touchMoveX;
    moveY += this.touchMoveY;
    if (Math.abs(this.touchMoveX) > 0.05 || Math.abs(this.touchMoveY) > 0.05) {
      throttle += this.touchMoveY;
      steer += -this.touchMoveX;
    }

    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : [];
    if (pads) {
      for (const pad of pads) {
        if (!pad || pad.mapping !== "standard") continue;
        const st = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
        moveX += st.x;
        moveY += -st.y;
        throttle += -st.y;
        steer += -st.x;
        if (pad.buttons[0]?.pressed) lift += 1;
        if (pad.buttons[1]?.pressed) lift -= 1;
        if (pad.buttons[12]?.pressed) {
          throttle += 1;
          moveY += 1;
        }
        if (pad.buttons[13]?.pressed) {
          throttle -= 1;
          moveY -= 1;
        }
        if (pad.buttons[14]?.pressed) steer += 1;
        if (pad.buttons[15]?.pressed) steer -= 1;
      }
    }

    lift += this.touchLift + this.liftHeld;
    const boardEdge = (k.has("KeyE") || this.touchBoard || this.boardHeld) && !this.prevBoard;
    const muteEdge = k.has("KeyM") && !this.prevMute;
    this.prevBoard = k.has("KeyE") || this.touchBoard || this.boardHeld;
    this.prevMute = k.has("KeyM");

    const lookX = this.lookX + this.touchLookX;
    const lookY = this.lookY + this.touchLookY;
    this.lookX = 0;
    this.lookY = 0;
    this.touchLookX = 0;
    this.touchLookY = 0;
    this.touchBoard = false;

    return {
      throttle: clamp(throttle, -1, 1),
      steer: clamp(steer, -1, 1),
      lift: clamp(lift, -1, 1),
      moveX: clamp(moveX, -1, 1),
      moveY: clamp(moveY, -1, 1),
      board: boardEdge,
      mute: muteEdge,
      lookX,
      lookY,
    };
  }

  setTouchBoard(v: boolean) {
    this.boardHeld = v;
    if (v) this.touchBoard = true;
  }

  setTouchLift(v: number) {
    this.liftHeld = v;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (GAME_CODES.has(e.code)) e.preventDefault();
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onMouse = (e: MouseEvent) => {
    if (document.pointerLockElement !== this.canvas) return;
    this.lookX += e.movementX;
    this.lookY += e.movementY;
  };

  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse") {
      if (this.canvas.requestPointerLock) void this.canvas.requestPointerLock();
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.42) {
      this.stickId = e.pointerId;
      this.stickOrigin = { x: e.clientX, y: e.clientY };
      this.canvas.setPointerCapture(e.pointerId);
    } else {
      this.lookId = e.pointerId;
      this.lookLast = { x: e.clientX, y: e.clientY };
      this.canvas.setPointerCapture(e.pointerId);
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerId === this.stickId) {
      const dx = (e.clientX - this.stickOrigin.x) / 56;
      const dy = (e.clientY - this.stickOrigin.y) / 56;
      const v = radialDeadzone(clamp(dx, -1.4, 1.4), clamp(dy, -1.4, 1.4), 0.08);
      this.touchMoveX = clamp(v.x, -1, 1);
      this.touchMoveY = clamp(-v.y, -1, 1);
    } else if (e.pointerId === this.lookId) {
      this.touchLookX += e.clientX - this.lookLast.x;
      this.touchLookY += e.clientY - this.lookLast.y;
      this.lookLast = { x: e.clientX, y: e.clientY };
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId === this.stickId) {
      this.stickId = null;
      this.touchMoveX = 0;
      this.touchMoveY = 0;
    }
    if (e.pointerId === this.lookId) {
      this.lookId = null;
    }
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
