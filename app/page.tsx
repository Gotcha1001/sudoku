"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const FEATURES = [
  {
    title: "Daily Puzzles",
    description:
      "Fresh randomly generated puzzles every session. Four difficulty levels from Easy to Expert.",
    icon: "🧩",
  },
  {
    title: "Track Your Progress",
    description:
      "Every completed puzzle is saved. See your best times, average difficulty, and personal records.",
    icon: "📈",
  },
  {
    title: "Leaderboard",
    description:
      "Compete globally for the fastest solve times. Filter by difficulty and see where you rank.",
    icon: "🏆",
  },
];

// Demo sudoku mini-grid numbers for hero
const DEMO_CELLS = [5, 3, 0, 0, 7, 0, 6, 1, 4, 9, 8, 0, 3, 0, 2, 0, 5, 0];

export default function Home() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.prefetch("/play");
  }, [isSignedIn, router]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden bg-white dark:bg-slate-950">
      {/* Animated background blobs (dark mode) */}
      <div className="hidden dark:block absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-250px] left-[-250px] w-[700px] h-[700px] rounded-full bg-blue-900 opacity-30"
          animate={{ scale: [1, 1.3, 1], x: [0, 120, 0], y: [0, -80, 0] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }}
        />
        <motion.div
          className="absolute bottom-[-300px] right-[-300px] w-[800px] h-[800px] rounded-full bg-indigo-950 opacity-30"
          animate={{ scale: [1, 1.25, 1], x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "mirror" }}
        />
      </div>

      {/* Mini sudoku grid hero */}
      <div className="relative mb-10">
        <motion.div
          className="grid grid-cols-9 gap-[2px] rounded-xl overflow-hidden border-2 border-blue-500/40 dark:border-blue-400/30 shadow-2xl"
          style={{ width: 198 }}
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
        >
          {DEMO_CELLS.map((val, i) => (
            <motion.div
              key={i}
              className={`w-[20px] h-[20px] flex items-center justify-center text-[9px] font-bold
                ${val === 0
                  ? "bg-gray-50 dark:bg-slate-800 text-transparent"
                  : i === 4
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-slate-700 text-gray-700 dark:text-blue-200"
                }`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              {val || ""}
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-sm shadow-lg"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          9
        </motion.div>
      </div>

      {/* Hero text */}
      <motion.h1
        className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl text-black dark:text-white drop-shadow-lg relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Sudoku Arena
        <span className="block text-blue-600 dark:text-blue-400 mt-2">
          Train Your Mind
        </span>
      </motion.h1>

      <motion.p
        className="mt-5 text-gray-600 dark:text-blue-200 text-lg max-w-xl relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        Endlessly generated puzzles with four difficulty levels. Track your best
        times, climb the leaderboard, and sharpen your logic.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        className="mt-8 flex flex-wrap gap-4 justify-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
      >
        {isSignedIn ? (
          <Button
            size="lg"
            className="text-lg px-10 py-6 bg-blue-600 hover:bg-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg"
            onClick={() => router.push("/play")}
          >
            Play Now →
          </Button>
        ) : (
          <>
            <SignInButton mode="modal" forceRedirectUrl="/play">
              <Button
                size="lg"
                className="text-lg px-10 py-6 bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
              >
                Sign In to Play
              </Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-6 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                Create Account
              </Button>
            </Link>
          </>
        )}
      </motion.div>

      {/* Feature cards */}
      <motion.div
        className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            className="p-6 rounded-2xl border border-blue-200 dark:border-blue-800 bg-white/70 dark:bg-blue-950/50 shadow-lg backdrop-blur-sm text-left"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-blue-200">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer CTA */}
      <motion.div
        className="mt-20 mb-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-black dark:text-white">
          Ready to Solve?
        </h2>
        <Link href={isSignedIn ? "/play" : "/sign-up"}>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 text-lg shadow-xl"
          >
            Start a Puzzle →
          </Button>
        </Link>
      </motion.div>
    </main>
  );
}
