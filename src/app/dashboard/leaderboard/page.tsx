import type { Metadata } from "next";
import { LeaderboardBoard } from "@/components/leaderboard/LeaderboardBoard";

export const metadata: Metadata = { title: "Leaderboard" };

export default function DashboardLeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Leaderboard</h2>
        <p className="text-sm text-muted">See how you rank against 27,400 funded and evaluation traders.</p>
      </div>
      <LeaderboardBoard showYou />
    </div>
  );
}
