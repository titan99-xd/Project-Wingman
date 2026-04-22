import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { type Doc, type Id } from "./_generated/dataModel"; 

/**
 * TRIGGER SOS
 */
export const triggerSOS = mutation({
  args: { 
    patientId: v.id("patients"), 
    nurseId: v.id("users") 
  },
  handler: async (ctx, args) => {
    const emergencyId = await ctx.db.insert("emergencies", {
      patientId: args.patientId,
      nurseId: args.nurseId, 
      status: "active",
      triggeredAt: Date.now(),
    });

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
 */
export const getActiveEmergencies = query({
  handler: async (ctx) => {
    const alerts = await ctx.db
      .query("emergencies")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return Promise.all(
      alerts.map(async (alert) => {
        const nurse = await ctx.db.get(alert.nurseId as Id<"users">);
        const patient = await ctx.db.get(alert.patientId as Id<"patients">);

        return {
          ...alert,
          nurseName: (nurse as Doc<"users"> | null)?.name ?? "Staff Member",
          roomNumber: (patient as Doc<"patients"> | null)?.roomNumber ?? "Mobile Unit",
        };
      })
    );
  },
});

/**
 * RESOLVE EMERGENCY
 */
export const resolveEmergency = mutation({
  args: { 
    emergencyId: v.id("emergencies"), 
    notes: v.string() 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.emergencyId, {
      status: "resolved",
      resolvedAt: Date.now(),
      resolutionNotes: args.notes,
    });
    
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
      .filter((q) => q.eq(q.field("patientId"), args.patientId))
      .order("desc")
      .first();
  },
});