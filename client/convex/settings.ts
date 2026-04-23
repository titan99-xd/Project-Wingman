import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 1. GET SETTINGS
 * Fetches the global configuration (PIN, GPS limits, Ward Name).
 */
export const getSettings = query({
  handler: async (ctx) => {
    return await ctx.db.query("settings").first();
  },
});

/**
 * 2. UPDATE SETTINGS
 * Allows the Head Nurse to change the ward's security parameters.
 */
export const updateSettings = mutation({
  args: {
    id: v.id("settings"),
    overridePin: v.string(),
    gpsRadius: v.number(), // Required accuracy in meters
    wardName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      overridePin: args.overridePin,
      gpsRadius: args.gpsRadius,
      wardName: args.wardName,
    });

    // Log the change in the security ledger
    await ctx.db.insert("auditLogs", {
      action: "SETTINGS_UPDATED",
      userId: "HEAD_NURSE_ADMIN",
      targetId: args.id,
      timestamp: Date.now(),
      metadata: { ward: args.wardName }
    });
  },
});