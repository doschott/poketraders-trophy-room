import { useCallback, useEffect, useRef, useState } from "react";
import { useP2PRoom, type PeerInfo } from "@/lib/multiplayer";
import { TrophyEngine, type EngineOpts } from "./engine";
import { Hud } from "./Hud";
import { HOMES, makeRoomCode, parseRoomCode } from "./homes";
import { StartScreen } from "./StartScreen";
import type { HomeId, HudSnap, NetState } from "./types";

const emptyHud: HudSnap = {
  score: 0,
  best: 0,
  remaining: 0,
  total: 0,
  boarded: false,
  vehicleLabel: "",
  prompt: "",
  location: "den",
  roomCode: "",
  peers: 0,
  toast: "",
  speed: 0,
  altitude: 0,
  courseDone: false,
  elapsed: 0,
  muted: false,
  combo: 0,
};

type Session = {
  home: HomeId;
  roomCode: string;
  name: string;
};

export function TrophyRoom() {
  const [selected, setSelected] = useState<HomeId>("nyc");
  const [name, setName] = useState("Host");
  const [join, setJoin] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  const startHost = () => {
    setError("");
    setSession({ home: selected, roomCode: makeRoomCode(selected), name: name.trim() || "Host" });
  };

  const startJoin = () => {
    const parsed = parseRoomCode(join);
    if (!parsed) {
      setError("Use a code like NYC-AB12CD");
      return;
    }
    setError("");
    setSession({
      home: parsed.home,
      roomCode: `${parsed.home}-${parsed.code}`,
      name: name.trim() || "Guest",
    });
  };

  if (!session) {
    return (
      <StartScreen
        selected={selected}
        onSelect={setSelected}
        name={name}
        onName={setName}
        join={join}
        onJoin={setJoin}
        onStart={startHost}
        onJoinRoom={startJoin}
        error={error}
      />
    );
  }

  return <PlayInner key={session.roomCode} session={session} />;
}

function PlayInner({ session }: { session: Session }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TrophyEngine | null>(null);
  const [hud, setHud] = useState<HudSnap>({
    ...emptyHud,
    roomCode: session.roomCode.toUpperCase(),
    vehicleLabel: HOMES[session.home].vehicleLabel,
  });
  const [coarse, setCoarse] = useState(false);
  const p2p = useP2PRoom({ room: roomKey(session.roomCode), name: session.name });
  const p2pRef = useRef(p2p);
  p2pRef.current = p2p;

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const opts: EngineOpts = {
      canvas,
      home: session.home,
      roomCode: session.roomCode.toUpperCase(),
      selfId: p2p.selfId,
      playerName: session.name,
      onHud: (h) => setHud({ ...h, peers: p2pRef.current.peers.length }),
      onBroadcast: (s) => p2pRef.current.broadcast(s),
    };
    const engine = new TrophyEngine(opts);
    engine.unlockAudio();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [session.home, session.roomCode, session.name, p2p.selfId]);

  useEffect(() => {
    return p2p.onMessage((from, data, channel) => {
      if (channel !== "state") return;
      engineRef.current?.applyRemote(from, data as NetState);
    });
  }, [p2p.onMessage]);

  const seen = useRef(new Set<string>());
  useEffect(() => {
    const ids = new Set(p2p.peers.map((p: PeerInfo) => p.id));
    for (const id of seen.current) {
      if (!ids.has(id)) engineRef.current?.setPeerGone(id);
    }
    seen.current = ids;
  }, [p2p.peers]);

  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(session.roomCode.toUpperCase());
  }, [session.roomCode]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-ink">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" style={{ touchAction: "none" }} />
      <Hud
        hud={{ ...hud, peers: p2p.peers.length, roomCode: session.roomCode.toUpperCase() }}
        coarse={coarse}
        onBoard={(v) => engineRef.current?.setTouchBoard(v)}
        onLift={(v) => engineRef.current?.setTouchLift(v)}
        onMute={() => engineRef.current?.toggleMute()}
        onCopy={onCopy}
      />
    </div>
  );
}

function roomKey(code: string): string {
  return `tr-${code.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 60)}`;
}
