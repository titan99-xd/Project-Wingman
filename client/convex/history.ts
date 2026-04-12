import { query } from "./_generated/server";
import { v } from "convex/values";

export const getClinicalTimeline = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    // 1. Fetch Vitals
    const vitals = await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(10);

    // 2. Fetch Meds that have been administered
    const meds = await ctx.db
      .query("medications")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.neq(q.field("administeredAt"), undefined))
      .collect();

    // 3. Combine into one format
    const timeline = [
      ...vitals.map((v) => ({
        id: v._id,
        time: v.timestamp,
        type: "VITAL",
        label: v.type,
        value: `${v.value} ${v.unit}`,
        staff: v.nurseId,
      })),
      ...meds.map((m) => ({
        id: m._id,
        time: m.administeredAt!,
        type: "MED",
        label: m.name,
        value: `${m.dosage} (Dose ${m.dosesGiven}/${m.totalDoses})`,
        staff: m.administeredBy || "NURSE_01",
      })),
    ];

    // 4. Sort by time (Newest first)
    return timeline.sort((a, b) => b.time - a.time);
  },
});