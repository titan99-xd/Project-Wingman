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
    status: v.string(), 
  },
  handler: async (ctx, args) => {
    const patientId = await ctx.db.insert("patients", {
      name: args.name,
      age: args.age,
      sex: args.sex,
      medicalHistory: args.medicalHistory,
      roomNumber: args.roomNumber,
      status: args.status,
      active: true, 
    });

    // CLINICAL AUDIT: Log the admission
    await ctx.db.insert("auditLogs", {
      action: "PATIENT_ADMITTED",
      targetId: patientId,
      timestamp: Date.now(),
      userId: "SYSTEM", 
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
      .order("desc") 
      .collect();
  },
});

/**
 * DISCHARGE PATIENT
 */
export const dischargePatient = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, { active: false });
    
    await ctx.db.insert("auditLogs", {
      action: "PATIENT_DISCHARGED",
      targetId: args.patientId,
      timestamp: Date.now(),
      userId: "SYSTEM",
      metadata: { reason: "Standard Discharge" },
    });
  },
});

/**
 * GET AUDIT LOGS
 * Required for the Security & Audit page
 */
export const getAuditLogs = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("auditLogs")
      .order("desc") 
      .take(50);     
  },
});