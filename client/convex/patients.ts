import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ADMIT PATIENT
 * Adds a new patient to the ward with a specific triage status.
 */
export const admitPatient = mutation({
  args: { 
    name: v.string(), 
    age: v.number(), 
    sex: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    medicalHistory: v.string(),
    roomNumber: v.string(),
    status: v.string(), // "Stable", "Unstable", or "Critical"
  },
  handler: async (ctx, args) => {
    const patientId = await ctx.db.insert("patients", {
      name: args.name,
      age: args.age,
      sex: args.sex,
      medicalHistory: args.medicalHistory,
      roomNumber: args.roomNumber,
      status: args.status,
      active: true, // Patient is now live in the ward
    });

    // CLINICAL AUDIT: Log the admission
    await ctx.db.insert("auditLogs", {
      action: "PATIENT_ADMITTED",
      targetId: patientId,
      timestamp: Date.now(),
      userId: "SYSTEM" as any, 
      metadata: { triage: args.status },
    });

    return patientId;
  },
});

/**
 * GET ACTIVE PATIENTS
 * Pulls all patients currently admitted to the ward.
 */
export const getActivePatients = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc") // Shows newest admissions first
      .collect();
  },
});

/**
 * DISCHARGE PATIENT
 * Sets active to false. This moves the patient to "history" 
 * without deleting their medical data.
 */
export const dischargePatient = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, { active: false });
    
    // Log the discharge for the audit trail
    await ctx.db.insert("auditLogs", {
      action: "PATIENT_DISCHARGED",
      targetId: args.patientId,
      timestamp: Date.now(),
      userId: "SYSTEM" as any,
      metadata: { reason: "Standard Discharge" },
    });
  },
});