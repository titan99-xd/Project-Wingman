import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Updates a nurse's shift status to 'active' once they pass 
 * the Geofence or PIN check.
 */
export const checkIn = mutation({
  args: { 
    nurseId: v.id("users"), 
    lat: v.number(), 
    lng: v.number() 
  },
  handler: async (ctx, args) => {
    // Find the most recent 'pending' shift for this nurse
    const activeShift = await ctx.db
      .query("shifts")
      .withIndex("by_nurse", (q) => q.eq("nurseId", args.nurseId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (activeShift) {
      await ctx.db.patch(activeShift._id, {
        status: "active",
        checkInDetails: {
          time: Date.now(),
          lat: args.lat,
          lng: args.lng,
          distanceFromHospital: 0, 
        }
      });
      
      // Also update the user's check-in status
      await ctx.db.patch(args.nurseId, { isCheckIn: true });
    }
  },
});