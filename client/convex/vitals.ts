import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addVitals = mutation({
  args: {
    patientId: v.id("patients"),
    nurseId: v.string(),
    type: v.union(v.literal("BP"), v.literal("HR"), v.literal("Temp"), v.literal("SpO2")),
    value: v.string(),
    unit: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Insert the vital sign record
    const vitalId = await ctx.db.insert("vitals", args);

    // 2. Create an automatic audit log
    await ctx.db.insert("auditLogs", {
      userId: args.nurseId,
      action: `Recorded Vital: ${args.type}`,
      targetId: args.patientId,
      timestamp: args.timestamp,
      metadata: { value: args.value, unit: args.unit }
    });

    return vitalId;
  },
});

export const getPatientVitals = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    // REMOVED .collect() because .take(10) already returns the array
    return await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(10); 
  },
});