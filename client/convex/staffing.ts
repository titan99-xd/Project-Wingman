import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 1. GET FIFTEEN-DAY ROSTER
 * Used by the Manager Hub to populate the master grid.
 */
export const getFifteenDayRoster = query({
  handler: async (ctx) => {
    return await ctx.db.query("shifts").collect();
  },
});

/**
 *  2. ASSIGN SHIFT
 * Handles assigning or updating a nurse's floor and shift type.
 */
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
      await ctx.db.patch(existing._id, { 
        status: "pending", 
        floorNumber: args.floorNumber, 
        shiftType: args.shiftType,     
        isOverrideUsed: false 
      });
    } else {
      await ctx.db.insert("shifts", {
        nurseId: args.nurseId,
        date: args.date,
        floorNumber: args.floorNumber, 
        shiftType: args.shiftType,    
        startTime: 0, // Placeholder for future time-tracking
        endTime: 0,
        status: "pending",
      });
    }
  },
});

/**
 *  3. GET TODAY'S SHIFT
 * Specifically for the Gatekeeper to verify the current check-in.
 */
export const getTodayShift = query({
  args: { nurseId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]; 
    
    return await ctx.db
      .query("shifts")
      .withIndex("by_nurse", (q) => q.eq("nurseId", args.nurseId))
      .filter((q) => q.eq(q.field("date"), today))
      .first();
  },
});

/**
 *  4. GET NURSE SCHEDULE
 * Shows the next 15 days of work for the nurse's Gatekeeper view.
 */
export const getNurseSchedule = query({
  args: { nurseId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    
    return await ctx.db
      .query("shifts")
      .withIndex("by_nurse", (q) => q.eq("nurseId", args.nurseId))
      .filter((q) => q.gte(q.field("date"), today))
      .order("asc")
      .take(15); 
  },
});

/**
 * 5. REPORT SICK LEAVE (BULK SELECTION)
 * Flags multiple shifts and creates formal leave requests for the Manager.
 */
export const reportSick = mutation({
  args: { 
    shiftIds: v.array(v.id("shifts")), 
    nurseId: v.id("users"), 
    reason: v.string() 
  },
  handler: async (ctx, args) => {
    for (const shiftId of args.shiftIds) {
      // 1. Mark the shift as flagged for sick leave
      await ctx.db.patch(shiftId, { 
        status: "flagged", 
        leaveRequested: true, 
        leaveReason: args.reason 
      });

      // 2. Create the leave request record
      await ctx.db.insert("leaveRequests", {
        userId: args.nurseId,
        shiftId: shiftId,
        reason: args.reason,
        status: "pending",
        requestTime: Date.now(),
      });
    }

    // 3. Log a single audit entry for the entire absence report
    await ctx.db.insert("auditLogs", {
      userId: args.nurseId.toString(),
      action: "SICK_LEAVE_BULK_REPORT",
      targetId: "MULTIPLE", 
      timestamp: Date.now(),
      metadata: { 
        reason: args.reason, 
        shiftsCount: args.shiftIds.length 
      }
    });
  },
});

/**
 *  6. GET EMERGENCY ABSENCES (WITH NAMES)
 * The "Brain" of the Manager Alert Banner. Looks up nurse names on-the-fly.
 */
export const getEmergencyAbsences = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    
    // 1. Fetch all flagged shifts for today
    const flaggedShifts = await ctx.db
      .query("shifts")
      .filter((q) => 
        q.and(
          q.eq(q.field("date"), today),
          q.eq(q.field("status"), "flagged")
        )
      )
      .collect();

    // 2. Enrich the data by looking up the User associated with each shift
    const absencesWithNames = await Promise.all(
      flaggedShifts.map(async (shift) => {
        const nurse = await ctx.db.get(shift.nurseId);
        return {
          ...shift,
          nurseName: nurse?.name || "Unknown Staff Member",
        };
      })
    );

    return absencesWithNames;
  },
});
/**
 * 🗑️ 7. REMOVE SHIFT
 * Deletes a shift entry entirely.
 */
export const removeShift = mutation({
  args: { shiftId: v.id("shifts") },
  handler: async (ctx, args) => {
    // Optional: Fetch shift info before deleting to make the audit log more detailed
    const shift = await ctx.db.get(args.shiftId);

    await ctx.db.delete(args.shiftId);

    await ctx.db.insert("auditLogs", {
      action: "SHIFT_REMOVED",
      targetId: args.shiftId.toString(),
      timestamp: Date.now(),
      userId: "MANAGER_COMMAND", 
      metadata: { 
        date: shift?.date, 
        floor: shift?.floorNumber 
      }
    });
  },
});