import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // Each completed puzzle is stored here for history/leaderboard
  puzzles: defineTable({
    userId: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert"),
    ),
    // Time taken in seconds
    timeSeconds: v.number(),
    // Number of hints used
    hintsUsed: v.number(),
    // Number of mistakes made
    mistakes: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_difficulty", ["difficulty"])
    .index("by_completed_at", ["completedAt"]),
});
