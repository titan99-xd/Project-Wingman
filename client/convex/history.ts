import { query } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel"; // 

/**
 *  1. GET CLINICAL TIMELINE
 * Used on the Nurse Tablet to show a patient's recent vitals and meds.
 */
export const getClinicalTimeline = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    // 1. Fetch Vitals
    const vitals = await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(15);

    // 2. Fetch administered medications
    const meds = await ctx.db
      .query("medications")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.gt(q.field("dosesGiven"), 0))
      .collect();

    // 3. Combine into one unified format
    const timeline = [
      ...vitals.map((v) => ({
        id: v._id,
        time: v.timestamp,
        type: "VITAL",
        label: v.type,
        value: `${v.value}${v.unit}`,
        staff: v.nurseId,
      })),
      ...meds.map((m) => ({
        id: m._id,
        time: m.administeredAt || Date.now(),
        type: "MED",
        label: m.name,
        value: `Administered ${m.dosage}`,
        staff: m.administeredBy || "Clinical Staff",
      })),
    ];

    // 4. Sort by time (Newest first)
    return timeline.sort((a, b) => b.time - a.time);
  },
});

/**
 *  2. GET SYSTEM AUDIT LOGS
 * Global ledger for the Security page. 
 * Now includes Staff Name lookups with strict TypeScript IDs.
 */
export const getAuditLogs = query({
  handler: async (ctx) => {
    // 1. Fetch the 100 most recent logs
    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(100);

    // 2. Enrich the logs by looking up User IDs
    return await Promise.all(
      logs.map(async (log) => {
        let staffName = "System";
        
        try {
          const user = await ctx.db.get(log.userId as Id<"users">);
          if (user) {
            staffName = user.name;
          }
        } catch  {
          // If the user lookup fails, we just keep "System" as the name.
        }

        return {
          ...log,
          userName: staffName,
        };
      })
    );
  },
});