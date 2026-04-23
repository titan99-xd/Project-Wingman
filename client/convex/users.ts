import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user by email (Used for Login)
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

/**
 *  List all Nurses (Used for the 15-Day Roster)
 */
export const listNurses = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "nurse"))
      .collect();
  },
});