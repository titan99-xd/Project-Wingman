import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ADD VITALS
 * Records a new clinical observation and creates a human-readable audit log.
 */
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
    // 1. Fetch the patient record to get the name for the audit log
    const patient = await ctx.db.get(args.patientId);

    // 2. Insert the vital sign record into the 'vitals' table
    const vitalId = await ctx.db.insert("vitals", args);

    // 3. Create an automatic audit log with the human-readable patient name
    await ctx.db.insert("auditLogs", {
      userId: args.nurseId,
      action: `Recorded Vital: ${args.type}`,
      targetId: args.patientId,
      patientName: patient?.name || "Unknown Patient", // Captured for Security Ledger
      timestamp: args.timestamp,
      metadata: { value: args.value, unit: args.unit }
    });

    return vitalId;
  },
});

/**
 * GET PATIENT VITALS
 * Pulls the last 10 readings for a specific patient to show trends on the tablet.
 */
export const getPatientVitals = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(10); 
  },
});