"use client";

import { useUserContext } from "../context/UserContext";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Gamepad2, Trophy, Clock, TrendingUp, Star } from "lucide-react";
import { formatTime } from "@/lib/sudoku";

function getBestStreak(results: boolean[]): number {
  let best = 0, cur = 0;
  for (const r of results) {
    if (r) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }
  return best;
}

export default function DashboardPage() {
  const user = useUserContext();
  const { user: clerkUser } = useUser();
  const puzzles = useQuery(
    api.puzzles.getPuzzlesForUser,
    clerkUser ? { userId: clerkUser.id } : "skip",
  );
  const bestTimes = useQuery(
    api.puzzles.getBestTimes,
    clerkUser ? { userId: clerkUser.id } : "skip",
  );

  const total = puzzles?.length ?? 0;
  const noHints = puzzles?.filter((p) => p.hintsUsed === 0).length ?? 0;
  const perfectSolves = puzzles?.filter((p) => p.hintsUsed === 0 && p.mistakes === 0).length ?? 0;
  const avgTime =
    puzzles && puzzles.length > 0
      ? Math.round(puzzles.reduce((s, p) => s + p.timeSeconds, 0) / puzzles.length)
      : null;

  // Current streak (consecutive solves from most recent)
  const streak = (() => {
    if (!puzzles || puzzles.length === 0) return null;
    const sorted = [...puzzles].sort((a, b) => b.completedAt - a.completedAt);
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      // streak = consecutive days (within 24h gaps)
      const gap = sorted[i - 1].completedAt - sorted[i].completedAt;
      if (gap < 86400000 * 2) count++;
      else break;
    }
    return count;
  })();

  const isLoading = puzzles === undefined;

  const STAT_CARDS = [
    {
      label: "Puzzles Solved",
      value: isLoading ? "..." : total || "—",
      icon: Gamepad2,
      color: "text-blue-600 dark:text-blue-400",
      sub: total > 0 ? `${perfectSolves} perfect` : null,
    },
    {
      label: "No-Hint Solves",
      value: isLoading ? "..." : noHints || "—",
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      sub: total > 0 ? `${Math.round((noHints / total) * 100)}% of games` : null,
    },
    {
      label: "Best Streak",
      value: isLoading ? "..." : streak || "—",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      sub: streak && streak > 1 ? "puzzles in a row" : null,
    },
    {
      label: "Avg. Solve Time",
      value: isLoading ? "..." : avgTime ? formatTime(avgTime) : "—",
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      sub: total > 0 ? `over ${total} puzzles` : null,
    },
  ];

  const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
  const diffColors: Record<string, string> = {
    easy: "text-green-600 dark:text-green-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    hard: "text-orange-600 dark:text-orange-400",
    expert: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
        </h1>
        <p className="text-gray-500 dark:text-blue-300 mt-1">
          Ready to train your brain? Pick a difficulty and start solving.
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {STAT_CARDS.map(({ label, value, icon: Icon, color, sub }) => (
          <motion.div
            key={label}
            className="p-5 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <Icon className={`h-6 w-6 mb-2 ${color}`} />
            <div className="text-2xl font-bold text-black dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-blue-300">{label}</div>
            {sub && <div className="text-xs text-gray-400 dark:text-blue-500 mt-0.5">{sub}</div>}
          </motion.div>
        ))}
      </motion.div>

      {/* Best times per difficulty */}
      {bestTimes && Object.keys(bestTimes).length > 0 && (
        <motion.div
          className="p-5 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold text-black dark:text-white">Personal Bests</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIFFICULTIES.map((d) => (
              <div key={d} className="text-center">
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${diffColors[d]}`}>
                  {d}
                </div>
                <div className="text-lg font-bold text-black dark:text-white tabular-nums">
                  {bestTimes[d] ? formatTime(bestTimes[d]) : "—"}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent puzzles mini-chart */}
      {puzzles && puzzles.length > 0 && (
        <motion.div
          className="p-5 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-black dark:text-white">Recent Solves</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[...puzzles]
              .sort((a, b) => b.completedAt - a.completedAt)
              .slice(0, 10)
              .map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  title={`${p.difficulty} · ${formatTime(p.timeSeconds)}${p.hintsUsed === 0 ? " · no hints" : ""}`}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold capitalize
                    ${p.difficulty === "easy"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : p.difficulty === "medium"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : p.difficulty === "hard"
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}
                >
                  {p.difficulty[0].toUpperCase()}
                </motion.div>
              ))}
            {puzzles.length > 10 && (
              <span className="text-xs text-gray-400 dark:text-blue-500 ml-1">
                +{puzzles.length - 10} more
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div
        className="p-6 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/play">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <Gamepad2 className="h-4 w-4 mr-2" /> Play Now
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4 mr-2" /> View History
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
              <Trophy className="h-4 w-4 mr-2" /> Leaderboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
