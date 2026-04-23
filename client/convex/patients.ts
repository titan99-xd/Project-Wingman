import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * ADMIT PATIENT
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
      handoverNotes: "", 
    });

    await ctx.db.insert("auditLogs", {
      action: "PATIENT_ADMITTED",
      targetId: patientId.toString(),
      patientName: args.name,
      timestamp: Date.now(),
      userId: "SYSTEM", 
      metadata: { triage: args.status },
    });

    return patientId;
  },
});

/**
 *  GET MY ASSIGNED PATIENTS (RBAC Enhanced)
 * - Admins (Head Nurses) see ALL active patients.
 * - Nurses see only those on their assigned floor after check-in.
 */
export const getMyAssignedPatients = query({
  args: { nurseId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.nurseId);
    if (!user) return [];

    //  ROLE-BASED OVERRIDE: 
    // If the user is an admin/Head Nurse, return all active patients immediately.
    if (user.role === "admin") {
      return await ctx.db
        .query("patients")
        .filter((q) => q.eq(q.field("active"), true))
        .collect();
    }
    
    //  NURSE SECURITY: If not checked in via Gatekeeper, return nothing.
    if (!user.isCheckIn) return [];

    //  LOGISTICS: Find today's shift to know the assigned floor
    const today = new Date().toISOString().split("T")[0];
    const shift = await ctx.db
      .query("shifts")
      .withIndex("by_nurse", (q) => q.eq("nurseId", args.nurseId))
      .filter((q) => q.eq(q.field("date"), today))
      .first();

    if (!shift || !shift.floorNumber) return [];

    // 🏥 DATA: Fetch all active patients and filter by floor digit
    const allPatients = await ctx.db
      .query("patients")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    
    return allPatients.filter(p => 
      p.roomNumber.startsWith(shift.floorNumber!.toString())
    );
  },
});

/**
 *  UPDATE HANDOVER NOTES
 */
export const updateHandoverNotes = mutation({
  args: { patientId: v.id("patients"), notes: v.string(), nurseId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, { 
      handoverNotes: args.notes,
      lastUpdated: Date.now() 
    });

    await ctx.db.insert("auditLogs", {
      action: "HANDOVER_UPDATED",
      targetId: args.patientId.toString(),
      timestamp: Date.now(),
      userId: args.nurseId.toString(),
      metadata: { notePreview: args.notes.substring(0, 30) }
    });
  },
});

/**
 *  GET ACTIVE PATIENTS (Global View for Manager Hub)
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
 *  DISCHARGE PATIENT
 */
export const dischargePatient = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    
    await ctx.db.patch(args.patientId, { active: false });
    
    await ctx.db.insert("auditLogs", {
      action: "PATIENT_DISCHARGED",
      targetId: args.patientId.toString(),
      patientName: patient?.name || "Unknown Patient",
      timestamp: Date.now(),
      userId: "SYSTEM",
      metadata: { reason: "Standard Discharge" }, 
    });
  },
});

/**
 *  GET AUDIT LOGS
 */
export const getAuditLogs = query({
  handler: async (ctx) => {
    return await ctx.db.query("auditLogs").order("desc").take(50);
  },
});