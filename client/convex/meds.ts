import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. Get meds for a specific patient
export const getPatientMeds = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medications")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

// 2. Mark medication as given
export const administerMed = mutation({
  args: { medId: v.id("medications"), nurseId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.medId, {
      status: "administered",
      administeredAt: Date.now(),
      administeredBy: args.nurseId,
    });

    // Also log this to the main Audit Log
    await ctx.db.insert("auditLogs", {
      action: "MED_ADMINISTERED",
      targetId: args.medId,
      timestamp: Date.now(),
      userId: args.nurseId,
      metadata: { msg: "Medication successfully delivered to patient." }
    });
  },
});