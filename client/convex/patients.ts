import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ADMIT PATIENT
 * Adds a new patient to the ward and logs the event with the patient's name.
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
    // 1. Insert the patient into the 'patients' table
    const patientId = await ctx.db.insert("patients", {
      name: args.name,
      age: args.age,
      sex: args.sex,
      medicalHistory: args.medicalHistory,
      roomNumber: args.roomNumber,
      status: args.status,
      active: true, 
    });

    // 2. CLINICAL AUDIT: Log the admission with the human-readable name
    await ctx.db.insert("auditLogs", {
      action: "PATIENT_ADMITTED",
      targetId: patientId,
      patientName: args.name, // Captured for the Security Ledger
      timestamp: Date.now(),
      userId: "SYSTEM", 
      metadata: { triage: args.status },
    });

    return patientId;
  },
});

/**
 * GET ACTIVE PATIENTS
 * Pulls all patients currently admitted to the ward for the Sidebar.
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
 * Sets 'active' to false and records the event in the audit trail.
 */
export const dischargePatient = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    // 1. Fetch the patient record to get their name before we update them
    const patient = await ctx.db.get(args.patientId);
    
    // 2. Set active to false (Archive)
    await ctx.db.patch(args.patientId, { active: false });
    
    // 3. Log the discharge for the audit trail
    await ctx.db.insert("auditLogs", {
      action: "PATIENT_DISCHARGED",
      targetId: args.patientId,
      patientName: patient?.name || "Unknown Patient",
      timestamp: Date.now(),
      userId: "SYSTEM",
      metadata: { reason: "Standard Discharge" },
    });
  },
});

/**
 * GET AUDIT LOGS
 * Required for the Security & Audit page.
 */
export const getAuditLogs = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("auditLogs")
      .order("desc") 
      .take(50); // Limits to last 50 for better performance during demo
  },
});