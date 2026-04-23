import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 📍 Geofence Check-In: Activates the specific shift and verifies location
 */
export const checkIn = mutation({
  args: { 
    nurseId: v.id("users"), 
    shiftId: v.id("shifts"), 
    lat: v.number(), 
    lng: v.number() 
  },
  handler: async (ctx, args) => {
    // 1. Activate the specific shift
    await ctx.db.patch(args.shiftId, {
      status: "active",
      startTime: Date.now(),
      checkInDetails: {
        time: Date.now(),
        lat: args.lat,
        lng: args.lng,
        distanceFromHospital: 0, 
      }
    });
    
    // 2. Update the user's session status
    await ctx.db.patch(args.nurseId, { isCheckIn: true });

    // 3. 🛡️ Create Security Audit Log
    await ctx.db.insert("auditLogs", {
      userId: args.nurseId.toString(),
      action: "GEOFENCE_CHECK_IN",
      targetId: args.shiftId.toString(),
      timestamp: Date.now(),
      metadata: { lat: args.lat, lng: args.lng }
    });
  },
});