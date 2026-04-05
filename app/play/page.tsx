"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBackground } from "@/app/context/BackgroundContext";
import type { Difficulty } from "@/lib/sudoku";
import { SudokuBoard } from "../components/SudokuBoard";

export default function PlayPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const savePuzzle = useMutation(api.puzzles.savePuzzle);
  const { selected: boardBg } = useBackground();

  useEffect(() => {
    if (isLoaded && !user) router.push("/");
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) return null;

  const handleComplete = async (
    timeSeconds: number,
    hintsUsed: number,
    mistakes: number,
    difficulty: Difficulty,
  ) => {
    try {
      await savePuzzle({
        userId: user.id,
        difficulty,
        timeSeconds,
        hintsUsed,
        mistakes,
      });
    } catch (e) {
      console.error("Failed to save puzzle:", e);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={!boardBg.src ? {
        background: "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
      } : undefined}
    >
      {boardBg.src && (
        <img
          src={boardBg.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />
      )}
      {boardBg.src && boardBg.overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: boardBg.overlay, zIndex: 1 }}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          zIndex: 2,
        }}
      />
      <div className="relative py-6 px-4" style={{ zIndex: 3 }}>
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white drop-shadow">Play Sudoku</h1>
            <p className="text-white/60 text-sm mt-1">
              Select a difficulty, fill in the grid — arrow keys and number keys work too!
            </p>
          </div>
          <SudokuBoard onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
}