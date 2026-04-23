import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFifteenDayRoster = query({
  handler: async (ctx) => {
    return await ctx.db.query("shifts").collect();
  },
});

export const assignShift = mutation({
  args: {
    nurseId: v.id("users"),
    date: v.string(),
    floorNumber: v.number(),
    shiftType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shifts")
      .withIndex("by_nurse", (q) => q.eq("nurseId", args.nurseId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    if (existing) {
      // 🟢 Update existing record with the new floor
      await ctx.db.patch(existing._id, { 
        status: "pending", 
        floorNumber: args.floorNumber, // Save it here!
        shiftType: args.shiftType,     // Save it here!
        isOverrideUsed: false 
      });
    } else {
      // 🟢 Insert new record with the floor
      await ctx.db.insert("shifts", {
        nurseId: args.nurseId,
        date: args.date,
        floorNumber: args.floorNumber, // Save it here!
        shiftType: args.shiftType,     // Save it here!
        startTime: 0,
        endTime: 0,
        status: "pending",
      });
    }
  },
});