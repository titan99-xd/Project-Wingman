import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
/**
 * TRIGGER SOS
 * Called by the Tablet when a nurse hits the emergency button.
 */
export const triggerSOS = mutation({
  args: { 
    patientId: v.id("patients"), 
    nurseId: v.string() // Using string to allow "SYSTEM" or custom IDs
  },
  handler: async (ctx, args) => {
    const emergencyId = await ctx.db.insert("emergencies", {
      patientId: args.patientId,
      nurseId: args.nurseId as Id<"users">, 
      status: "active",
      triggeredAt: Date.now(),
    });

    // 2. Log to Audit Ledger for legal accountability
    await ctx.db.insert("auditLogs", {
      action: "EMERGENCY_TRIGGERED",
      targetId: args.patientId,
      timestamp: Date.now(),
      userId: args.nurseId,
      metadata: { priority: "CRITICAL" }
    });

    return emergencyId;
  },
});

/**
 * GET ACTIVE EMERGENCIES
 * Used by the Emergency Hub to monitor the ward in real-time.
 */
export const getActiveEmergencies = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("emergencies")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

/**
 * RESOLVE EMERGENCY
 * Called by the Head Nurse to clear the alert.
 */
export const resolveEmergency = mutation({
  args: { 
    emergencyId: v.id("emergencies"), 
    notes: v.string() 
  },
  handler: async (ctx, args) => {
    // 1. Mark as resolved
    await ctx.db.patch(args.emergencyId, {
      status: "resolved",
      resolvedAt: Date.now(),
      resolutionNotes: args.notes,
    });
    
    // 2. Update Audit Ledger
    await ctx.db.insert("auditLogs", {
      action: "EMERGENCY_RESOLVED",
      targetId: args.emergencyId,
      timestamp: Date.now(),
      userId: "HEAD_NURSE",
      metadata: { notes: args.notes }
    });
  },
});

export const getLatestEmergencyForPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emergencies")
      .withIndex("by_status") // You might need to add an index for patientId if you want it faster
      .filter((q) => q.eq(q.field("patientId"), args.patientId))
      .order("desc")
      .first();
  },
});