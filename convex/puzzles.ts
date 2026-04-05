import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save a completed puzzle result
export const savePuzzle = mutation({
  args: {
    userId: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert"),
    ),
    timeSeconds: v.number(),
    hintsUsed: v.number(),
    mistakes: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("puzzles", {
      ...args,
      completedAt: Date.now(),
    });
  },
});

// Get all completed puzzles for a user
export const getPuzzlesForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("puzzles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

// Get all puzzles (for leaderboard)
export const getAllPuzzles = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("puzzles")
      .withIndex("by_completed_at")
      .order("desc")
      .take(200);
  },
});

// Get best times per difficulty for a user
export const getBestTimes = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const puzzles = await ctx.db
      .query("puzzles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const best: Record<string, number> = {};
    for (const p of puzzles) {
      if (!best[p.difficulty] || p.timeSeconds < best[p.difficulty]) {
        best[p.difficulty] = p.timeSeconds;
      }
    }
    return best;
  },
});

