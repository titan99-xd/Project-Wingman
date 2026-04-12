import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPatientMeds = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medications")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

/**
 * Increments the dose count. Marks as 'administered' only when 
 * dosesGiven reaches totalDoses.
 */
export const administerMed = mutation({
  args: { medId: v.id("medications"), nurseId: v.string() },
  handler: async (ctx, args) => {
    const med = await ctx.db.get(args.medId);
    if (!med) return;

    const newDosesGiven = (med.dosesGiven ?? 0) + 1;
    const isComplete = newDosesGiven >= (med.totalDoses ?? 1);

    await ctx.db.patch(args.medId, {
      dosesGiven: newDosesGiven,
      status: isComplete ? "administered" : "scheduled",
      administeredAt: Date.now(),
      administeredBy: args.nurseId,
    });

    // Log to Audit Ledger
    await ctx.db.insert("auditLogs", {
      action: "MED_ADMINISTERED",
      targetId: args.medId,
      timestamp: Date.now(),
      userId: args.nurseId,
      metadata: { dose: newDosesGiven, total: med.totalDoses }
    });
  },
});

/**
 * Adds a new prescription with a set number of required doses.
 */
export const addMedication = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    totalDoses: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medications", {
      patientId: args.patientId,
      name: args.name,
      dosage: args.dosage,
      frequency: args.frequency,
      totalDoses: args.totalDoses,
      dosesGiven: 0,
      status: "scheduled",
      scheduledFor: Date.now(),
    });
  },
});