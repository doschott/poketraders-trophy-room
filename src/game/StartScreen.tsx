import { Compass, DoorOpen, Users } from "lucide-react";
import { HOME_LIST, parseRoomCode, type HomeDef } from "./homes";
import type { HomeId } from "./types";

type Props = {
  selected: HomeId;
  onSelect: (id: HomeId) => void;
  name: string;
  onName: (v: string) => void;
  join: string;
  onJoin: (v: string) => void;
  onStart: () => void;
  onJoinRoom: () => void;
  error: string;
};

export function StartScreen({
  selected,
  onSelect,
  name,
  onName,
  join,
  onJoin,
  onStart,
  onJoinRoom,
  error,
}: Props) {
  const parsed = parseRoomCode(join);
  return (
    <div className="relative min-h-dvh overflow-y-auto bg-ink text-paper">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, color-mix(in oklab, var(--color-teal) 22%, transparent), transparent 42%), radial-gradient(ellipse at 90% 80%, color-mix(in oklab, var(--color-wood) 18%, transparent), transparent 40%)",
        }}
      />
      <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">PokeTraders</p>
          <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            Trophy Room
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Walk the den, step outside into a real 3D yard, board the house vehicle, and run a scored
            course. Invite a friend with a room code — they can ride along.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2">
          {HOME_LIST.map((h) => (
            <HomeCard key={h.id} home={h} active={selected === h.id} onSelect={() => onSelect(h.id)} />
          ))}
        </section>

        <section className="grid gap-4 rounded-xl border border-line bg-loft/80 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Your name</span>
            <input
              value={name}
              onChange={(e) => onName(e.target.value.slice(0, 24))}
              maxLength={24}
              className="h-11 rounded-md border border-line bg-ink px-3 text-sm text-paper outline-none ring-teal/0 transition focus:border-teal focus:ring-2 focus:ring-teal/40"
              placeholder="Host"
              autoComplete="nickname"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Join a friend</span>
            <input
              value={join}
              onChange={(e) => onJoin(e.target.value.toUpperCase())}
              className="h-11 rounded-md border border-line bg-ink px-3 font-mono text-sm tracking-wide text-paper outline-none ring-teal/0 transition focus:border-teal focus:ring-2 focus:ring-teal/40"
              placeholder="NYC-AB12CD"
              autoCapitalize="characters"
              autoCorrect="off"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onJoinRoom}
              disabled={!parsed}
              className="inline-flex h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-md border border-line bg-ink px-4 text-sm font-medium text-paper transition hover:border-line-strong disabled:opacity-40 sm:flex-none"
            >
              <Users className="size-4" strokeWidth={1.75} />
              Join
            </button>
            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-11 min-w-28 flex-1 items-center justify-center gap-2 rounded-md bg-paper px-5 text-sm font-semibold text-ink transition hover:bg-silver sm:flex-none"
            >
              <DoorOpen className="size-4" strokeWidth={1.75} />
              Start
            </button>
          </div>
        </section>
        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <ul className="mt-auto grid gap-3 pb-4 text-xs text-muted sm:grid-cols-3">
          <li className="rounded-lg border border-line bg-loft/60 p-3">
            <Compass className="mb-2 size-4 text-silver" strokeWidth={1.75} />
            WASD to walk. Mouse look. E boards the vehicle. A turns left from behind.
          </li>
          <li className="rounded-lg border border-line bg-loft/60 p-3">
            Rings, coins, and ramps score points. Best score stays on this device.
          </li>
          <li className="rounded-lg border border-line bg-loft/60 p-3">
            Share the room code after you enter. A friend can ride shotgun.
          </li>
        </ul>
      </main>
    </div>
  );
}

function HomeCard({ home, active, onSelect }: { home: HomeDef; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "group flex overflow-hidden rounded-xl border text-left transition " +
        (active ? "border-silver bg-loft" : "border-line bg-loft/50 hover:border-line-strong")
      }
    >
      <img
        src={home.thumb}
        alt=""
        className="h-28 w-28 shrink-0 object-cover sm:h-36 sm:w-40"
        crossOrigin="anonymous"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-4">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted">{home.place}</span>
        <span className="font-display text-lg font-medium leading-snug text-paper">{home.name}</span>
        <span className="text-xs leading-relaxed text-muted">{home.vehicleLabel}</span>
        <span className="mt-auto hidden text-xs text-muted sm:block">{home.challenge}</span>
      </span>
    </button>
  );
}
