import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. User Management
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("nurse")),
    tokenIdentifier: v.string(), 
  }).index("by_token", ["tokenIdentifier"]),

  // 2. Patient Information
  patients: defineTable({
    name: v.string(),
    age: v.number(),
    sex: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    medicalHistory: v.string(),
    roomNumber: v.string(),
    status: v.string(), // Confirmed: This allows "Stable", "Unstable", etc.
    active: v.boolean(),
  }),

  // 3. Medications (Current prescriptions)
  medications: defineTable({
    patientId: v.id("patients"),
    name: v.string(),
    dosage: v.string(),
    frequency: v.string(), 
  }).index("by_patient", ["patientId"]),

  // 4. Shifts (Geofenced Check-in)
  shifts: defineTable({
    nurseId: v.id("users"),
    date: v.string(), 
    startTime: v.number(), 
    endTime: v.number(),   
    status: v.union(
      v.literal("pending"),   
      v.literal("active"),    
      v.literal("completed"), 
      v.literal("flagged")    
    ),
    checkInDetails: v.optional(v.object({
      time: v.number(),
      lat: v.number(),
      lng: v.number(),
      distanceFromHospital: v.number(),
    })),
  }).index("by_nurse", ["nurseId"]).index("by_status", ["status"]),

  // 5. Shift Assignments 
  assignments: defineTable({
    shiftId: v.id("shifts"),
    patientId: v.id("patients"),
    tasksCompleted: v.number(),
    totalTasks: v.number(),
  }).index("by_shift", ["shiftId"]).index("by_patient", ["patientId"]),

  // 6. Clinical Vitals
  vitals: defineTable({
    patientId: v.id("patients"),
    nurseId: v.string(),
    type: v.union(v.literal("BP"), v.literal("HR"), v.literal("Temp"), v.literal("SpO2")),
    value: v.string(),
    unit: v.string(),
    timestamp: v.number(),
  }).index("by_patient", ["patientId"]),

  // 7. Emergency SOS Triggers
  emergencies: defineTable({
    patientId: v.id("patients"),
    nurseId: v.id("users"), 
    status: v.union(v.literal("active"), v.literal("resolved")),
    triggeredAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")), 
    resolutionNotes: v.optional(v.string()),
  }).index("by_status", ["status"]).index("by_patient", ["patientId"]),

  // 8. System Audit Logs
  auditLogs: defineTable({
    // FIX: Changed from v.id("users") to v.string() to allow "SYSTEM" logs
    userId: v.string(),
    action: v.string(), 
    targetId: v.string(), 
    timestamp: v.number(),
    metadata: v.any(), 
  }).index("by_action", ["action"]),
});