"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Hash, Star, Lightbulb } from "lucide-react";
import { formatTime } from "@/lib/sudoku";
import { useEffect } from "react";

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const DIFF_COLORS: Record<string, string> = {
  easy: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  hard: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  expert: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function HistoryPage() {
  const { user } = useUser();
  const router = useRouter();
  const puzzles = useQuery(
    api.puzzles.getPuzzlesForUser,
    user ? { userId: user.id } : "skip",
  );

useEffect(() => {
  if (user === null) router.push("/");
}, [user, router]);

if (!user) return null;

  const total = puzzles?.length ?? 0;
  const perfect = puzzles?.filter((p) => p.hintsUsed === 0 && p.mistakes === 0).length ?? 0;
  const avgTime =
    puzzles && puzzles.length > 0
      ? Math.round(puzzles.reduce((s, p) => s + p.timeSeconds, 0) / puzzles.length)
      : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">Puzzle History</h1>
        <p className="text-gray-500 dark:text-blue-300">Your completed Sudoku puzzles</p>
      </div>

      {/* Summary cards */}
      <motion.div
        className="grid grid-cols-3 gap-4 mb-8"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {[
          { label: "Total Solved", value: puzzles?.length ?? "—", icon: Hash, color: "text-blue-600 dark:text-blue-400" },
          { label: "Perfect Solves", value: perfect || "—", icon: Star, color: "text-yellow-500 dark:text-yellow-400" },
          { label: "Avg. Time", value: avgTime ? formatTime(avgTime) : "—", icon: Clock, color: "text-green-600 dark:text-green-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            className="p-4 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          >
            <Icon className={`h-5 w-5 mb-1 ${color}`} />
            <div className="text-2xl font-bold text-black dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-blue-300">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Puzzle list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-blue-300 mb-4">
          Recent Puzzles ({total})
        </h2>

        {puzzles === undefined && (
          <div className="text-center py-12 text-gray-400 dark:text-blue-400">Loading history...</div>
        )}

        {puzzles?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40"
          >
            <div className="text-5xl mb-4">🧩</div>
            <p className="font-semibold text-black dark:text-white mb-1">No puzzles yet</p>
            <p className="text-gray-500 dark:text-blue-300">Complete a puzzle to see it here!</p>
          </motion.div>
        )}

        <AnimatePresence>
          {puzzles?.map((puzzle, i) => (
            <motion.div
              key={puzzle._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm"
            >
              {/* Difficulty badge */}
              <div className={`w-14 h-12 rounded-xl flex items-center justify-center text-xs font-bold capitalize flex-shrink-0 ${DIFF_COLORS[puzzle.difficulty]}`}>
                {puzzle.difficulty}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-black dark:text-white capitalize">
                    {puzzle.difficulty}
                  </span>
                  {puzzle.hintsUsed === 0 && puzzle.mistakes === 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium">
                      ✨ Perfect
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-blue-400">
                  {puzzle.hintsUsed > 0 && (
                    <span className="flex items-center gap-1">
                      <Lightbulb size={10} /> {puzzle.hintsUsed} hint{puzzle.hintsUsed !== 1 ? "s" : ""}
                    </span>
                  )}
                  {puzzle.mistakes > 0 && (
                    <span className="text-red-400">{puzzle.mistakes} mistake{puzzle.mistakes !== 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-1 text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-sm font-bold text-black dark:text-white tabular-nums">
                  <Clock size={12} />
                  {formatTime(puzzle.timeSeconds)}
                </div>
                <div className="text-xs text-gray-400 dark:text-blue-500">
                  {timeAgo(puzzle.completedAt)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
