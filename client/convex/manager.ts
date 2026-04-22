import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all staff members and their current shift status
 */
export const getStaffOverview = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "nurse"))
      .collect();
  },
});

/**
 * Get all patients with their assigned nurse names
 */
export const getWardStatus = query({
  handler: async (ctx) => {
    const patients = await ctx.db.query("patients").collect();
    const nurses = await ctx.db.query("users").collect();

    // Map the nurse name to each patient for the dashboard view
    return patients.map(patient => ({
      ...patient,
      nurseName: nurses.find(n => n._id === patient.assignedNurseId)?.name || "Unassigned"
    }));
  },
});

/**
 * Emergency Reassignment: Move a patient to a different nurse
 */
export const reassignPatient = mutation({
  args: { 
    patientId: v.id("patients"), 
    newNurseId: v.id("users") 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, { 
      assignedNurseId: args.newNurseId,
      lastUpdated: Date.now()
    });
  },
});