import { createFileRoute } from "@tanstack/react-router";
import { TrophyRoom } from "@/game/TrophyRoom";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <TrophyRoom />;
}
