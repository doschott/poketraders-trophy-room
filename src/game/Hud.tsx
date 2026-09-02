import { ArrowUp, Copy, Volume2, VolumeX } from "lucide-react";
import type { HudSnap } from "./types";

type Props = {
  hud: HudSnap;
  coarse: boolean;
  onBoard: (down: boolean) => void;
  onLift: (v: number) => void;
  onMute: () => void;
  onCopy: () => void;
};

export function Hud({ hud, coarse, onBoard, onLift, onMute, onCopy }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-paper">
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2 sm:left-5 sm:top-5">
        <div className="rounded-lg border border-line bg-ink/80 px-3 py-2 backdrop-blur-sm">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted">Score</p>
          <p className="font-mono text-2xl font-medium tabular-nums leading-none">{hud.score}</p>
          <p className="mt-1 text-xs text-muted">
            Best <span className="tabular-nums text-silver">{hud.best}</span>
            {hud.combo > 1 ? <span className="ml-2 text-teal">x{hud.combo}</span> : null}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-ink/80 px-3 py-2 backdrop-blur-sm">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted">Course</p>
          <p className="text-sm tabular-nums">
            {hud.total - hud.remaining} / {hud.total}
          </p>
          <p className="text-xs text-muted">{hud.location === "den" ? "In the den" : hud.vehicleLabel}</p>
        </div>
      </div>

      <div className="pointer-events-auto absolute right-3 top-3 flex flex-col items-end gap-2 sm:right-5 sm:top-5">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-ink/80 px-3 text-xs font-medium tracking-wide backdrop-blur-sm"
        >
          <Copy className="size-3.5" strokeWidth={1.75} />
          <span className="font-mono">{hud.roomCode}</span>
        </button>
        <p className="rounded-md border border-line bg-ink/70 px-2 py-1 text-[0.7rem] text-muted">
          {hud.peers === 0 ? "Waiting for a friend" : `${hud.peers} with you`}
        </p>
        <button
          type="button"
          onClick={onMute}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-line bg-ink/80 backdrop-blur-sm"
          aria-label={hud.muted ? "Unmute" : "Mute"}
        >
          {hud.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      {hud.prompt ? (
        <div className="absolute bottom-28 left-1/2 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 rounded-lg border border-line bg-ink/80 px-4 py-2 text-center text-sm backdrop-blur-sm sm:bottom-10">
          {hud.prompt}
        </div>
      ) : null}

      {hud.courseDone ? (
        <div className="absolute left-1/2 top-1/3 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-line bg-loft/90 p-5 text-center backdrop-blur-sm">
          <p className="font-display text-2xl">Course clear</p>
          <p className="mt-1 font-mono text-xl tabular-nums">{hud.score}</p>
          <p className="mt-2 text-xs text-muted">Keep exploring or hop off with E</p>
        </div>
      ) : null}

      {coarse ? (
        <div className="pointer-events-auto absolute inset-x-0 bottom-4 flex items-end justify-between px-4">
          <div className="size-28 rounded-full border border-line bg-ink/40" aria-hidden />
          <div className="flex flex-col gap-2">
            {hud.boarded ? (
              <>
                <button
                  type="button"
                  className="inline-flex size-12 items-center justify-center rounded-full border border-line bg-ink/80"
                  onPointerDown={() => onLift(1)}
                  onPointerUp={() => onLift(0)}
                  onPointerCancel={() => onLift(0)}
                >
                  <ArrowUp className="size-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 min-w-20 items-center justify-center rounded-full border border-line bg-paper px-4 text-xs font-semibold text-ink"
                  onPointerDown={() => onBoard(true)}
                  onPointerUp={() => onBoard(false)}
                  onPointerCancel={() => onBoard(false)}
                >
                  Hop off
                </button>
              </>
            ) : (
              <button
                type="button"
                className="inline-flex h-12 min-w-20 items-center justify-center rounded-full border border-line bg-paper px-4 text-xs font-semibold text-ink"
                onPointerDown={() => onBoard(true)}
                onPointerUp={() => onBoard(false)}
                onPointerCancel={() => onBoard(false)}
              >
                Board
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-silver/80" />
    </div>
  );
}
