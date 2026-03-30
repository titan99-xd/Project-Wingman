import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. User Management (Admins & Nurses)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("nurse")),
    tokenIdentifier: v.string(), // For Auth integration (Clerk/Auth0)
  }).index("by_token", ["tokenIdentifier"]),

  // 2. Patient Information (Managed by Head Nurse)
  patients: defineTable({
    name: v.string(),
    age: v.number(),
    sex: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    medicalHistory: v.string(),
    roomNumber: v.string(),
    active: v.boolean(),
  }),

  // 3. Medications (Linked to Patients)
  medications: defineTable({
    patientId: v.id("patients"),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(), // e.g., "Twice daily"
  }).index("by_patient", ["patientId"]),

  // 4. Shifts (The Geofenced Container)
  shifts: defineTable({
    nurseId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    startTime: v.number(), // Scheduled start timestamp
    endTime: v.number(),   // Scheduled end timestamp
    status: v.union(
      v.literal("pending"),   // Assigned but not started
      v.literal("active"),    // Geofence verified
      v.literal("completed"), // Finished
      v.literal("flagged")    // Geofence or time anomaly
    ),
    checkInDetails: v.optional(v.object({
      time: v.number(),
      lat: v.number(),
      lng: v.number(),
      distanceFromHospital: v.number(),
    })),
  }).index("by_nurse", ["nurseId"]).index("by_status", ["status"]),

  // 5. Shift Assignments (Linking 1 Nurse/Shift to Many Patients)
  assignments: defineTable({
    shiftId: v.id("shifts"),
    patientId: v.id("patients"),
    tasksCompleted: v.number(),
    totalTasks: v.number(),
  }).index("by_shift", ["shiftId"]),

  // 6. Clinical Vitals 
  vitals: defineTable({
    patientId: v.id("patients"),
    nurseId: v.id("users"),
    type: v.union(v.literal("BP"), v.literal("HR"), v.literal("Temp"), v.literal("SpO2")),
    value: v.string(),
    unit: v.string(),
    timestamp: v.number(),
  }).index("by_patient", ["patientId"]),

  // 7. System Audit Logs 
  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(), 
    targetId: v.string(), 
    timestamp: v.number(),
    metadata: v.any(), 
  }).index("by_action", ["action"]),
});