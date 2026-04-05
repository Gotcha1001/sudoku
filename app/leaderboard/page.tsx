"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Trophy, Medal, Clock } from "lucide-react";
import { formatTime } from "@/lib/sudoku";
import { useState } from "react";

type Difficulty = "easy" | "medium" | "hard" | "expert";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

interface LeaderboardEntry {
  userId: string;
  bestTime: number;
  totalSolved: number;
  perfectSolves: number;
}

function buildLeaderboard(
  puzzles: Array<{ userId: string; difficulty: string; timeSeconds: number; hintsUsed: number; mistakes: number }>,
  difficulty: Difficulty,
): LeaderboardEntry[] {
  const stats: Record<string, { bestTime: number; total: number; perfect: number }> = {};

  for (const p of puzzles) {
    if (p.difficulty !== difficulty) continue;
    if (!stats[p.userId]) {
      stats[p.userId] = { bestTime: Infinity, total: 0, perfect: 0 };
    }
    if (p.timeSeconds < stats[p.userId].bestTime) {
      stats[p.userId].bestTime = p.timeSeconds;
    }
    stats[p.userId].total++;
    if (p.hintsUsed === 0 && p.mistakes === 0) stats[p.userId].perfect++;
  }

  return Object.entries(stats)
    .map(([userId, s]) => ({
      userId,
      bestTime: s.bestTime,
      totalSolved: s.total,
      perfectSolves: s.perfect,
    }))
    .sort((a, b) => a.bestTime - b.bestTime);
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="w-8 text-center text-sm font-bold text-gray-400 dark:text-blue-500">
      #{rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const puzzles = useQuery(api.puzzles.getAllPuzzles);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const leaderboard = puzzles ? buildLeaderboard(puzzles, difficulty) : null;
  const myRank = leaderboard?.findIndex((e) => e.userId === user?.id) ?? -1;
  const myEntry = myRank >= 0 ? leaderboard![myRank] : null;

  const DIFF_COLORS: Record<string, string> = {
    easy: "text-green-600 dark:text-green-400 border-green-300 dark:border-green-700",
    medium: "text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
    hard: "text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700",
    expert: "text-red-600 dark:text-red-400 border-red-300 dark:border-red-700",
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
        </h1>
        <p className="text-gray-500 dark:text-blue-300">Fastest solvers by difficulty</p>
      </div>

      {/* Difficulty tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-all
              ${difficulty === d
                ? `bg-white dark:bg-blue-950 ${DIFF_COLORS[d]} border-2`
                : "border-gray-200 dark:border-blue-800 text-gray-500 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-blue-900/30"
              }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* My ranking card */}
      {myEntry && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 rounded-2xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/60 flex items-center gap-4"
        >
          <RankIcon rank={myRank + 1} />
          <div className="flex-1">
            <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Your Ranking</p>
            <p className="text-xs text-gray-500 dark:text-blue-400">
              Rank #{myRank + 1} of {leaderboard!.length} players
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-black dark:text-white tabular-nums">
                {formatTime(myEntry.bestTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-blue-400">Best Time</div>
            </div>
            <div>
              <div className="text-lg font-bold text-black dark:text-white">
                {myEntry.totalSolved}
              </div>
              <div className="text-xs text-gray-500 dark:text-blue-400">Solved</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard table */}
      <div className="rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 overflow-hidden shadow-sm">
        {/* Column headers */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-gray-100 dark:border-blue-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-blue-400">
          <span>Rank</span>
          <span>Player</span>
          <span className="text-center flex items-center gap-1"><Clock size={11} /> Best</span>
          <span className="text-center">Solved</span>
          <span className="text-center">Perfect</span>
        </div>

        {puzzles === undefined && (
          <div className="text-center py-12 text-gray-400 dark:text-blue-400">
            Loading leaderboard...
          </div>
        )}

        {leaderboard?.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">🧩</div>
            <p className="font-semibold text-black dark:text-white mb-1">No data yet</p>
            <p className="text-gray-500 dark:text-blue-300">
              Be the first to complete a {difficulty} puzzle!
            </p>
          </div>
        )}

        {leaderboard?.map((entry, i) => {
          const isMe = entry.userId === user?.id;
          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-gray-50 dark:border-blue-900/50 last:border-0 ${isMe ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
            >
              <RankIcon rank={i + 1} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${isMe ? "text-blue-700 dark:text-blue-300 font-semibold" : "text-black dark:text-white"}`}>
                    {isMe ? "You" : `Player ${entry.userId.slice(-6)}`}
                  </span>
                  {isMe && <Medal size={13} className="text-blue-500 flex-shrink-0" />}
                </div>
              </div>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 text-center tabular-nums">
                {formatTime(entry.bestTime)}
              </span>
              <span className="text-sm text-gray-600 dark:text-blue-300 text-center">
                {entry.totalSolved}
              </span>
              <span className="text-sm text-yellow-600 dark:text-yellow-400 text-center font-semibold">
                {entry.perfectSolves > 0 ? `✨ ${entry.perfectSolves}` : "—"}
              </span>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-blue-600 mt-4">
        Ranked by fastest solve time · Last 200 completed puzzles · Updates live
      </p>
    </div>
  );
}
