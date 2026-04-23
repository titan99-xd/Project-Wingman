import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. User Management
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),      
    role: v.union(v.literal("admin"), v.literal("nurse")),
    tokenIdentifier: v.string(), 
    isCheckIn: v.boolean(),    
    status: v.string(),        // "active" | "on_leave" | "off_duty"
  })
  .index("by_token", ["tokenIdentifier"])
  .index("by_email", ["email"]),

  // 🟢 2. Global Settings 
  settings: defineTable({
    overridePin: v.string(),      // e.g., "8822"
    wardName: v.string(),         // e.g., "General Ward"
    hospitalLat: v.number(),      
    hospitalLong: v.number(),     
    gpsRadius: v.number(),        // Accuracy radius in meters
  }),

  // 3. Patient Information
  patients: defineTable({
    name: v.string(),
    age: v.number(),
    sex: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    medicalHistory: v.string(),
    roomNumber: v.string(),
    status: v.string(),        
    active: v.boolean(),
    assignedNurseId: v.optional(v.id("users")), 
    handoverNotes: v.optional(v.string()),      
    lastUpdated: v.optional(v.number()),  
  }).index("by_assigned_nurse", ["assignedNurseId"]),

  // 4. Medications
  medications: defineTable({
    patientId: v.id("patients"),
    name: v.string(),        
    dosage: v.string(),      
    frequency: v.string(),   
    totalDoses: v.number(), 
    dosesGiven: v.number(),
    status: v.string(),      
    scheduledFor: v.number(),
    administeredAt: v.optional(v.number()),
    administeredBy: v.optional(v.string()), 
  }).index("by_patient", ["patientId"]),

  // 5. Shifts
  shifts: defineTable({
    nurseId: v.id("users"),
    date: v.string(), 
    startTime: v.number(), 
    endTime: v.number(),   
    status: v.string(),    // "pending" | "active" | "completed" | "flagged"
    floorNumber: v.optional(v.number()), 
    shiftType: v.optional(v.string()),   
    leaveRequested: v.optional(v.boolean()), 
    leaveReason: v.optional(v.string()),
    isOverrideUsed: v.optional(v.boolean()), 
    checkInDetails: v.optional(v.object({
      time: v.number(),
      lat: v.number(),
      lng: v.number(),
      distanceFromHospital: v.number(),
    })),
  }).index("by_nurse", ["nurseId"]).index("by_status", ["status"]),

  // 6. Assignments
  assignments: defineTable({
    shiftId: v.id("shifts"),
    patientId: v.id("patients"),
    tasksCompleted: v.number(),
    totalTasks: v.number(),
  }).index("by_shift", ["shiftId"]).index("by_patient", ["patientId"]),

  // 7. Clinical Vitals
  vitals: defineTable({
    patientId: v.id("patients"),
    nurseId: v.string(), 
    type: v.union(v.literal("BP"), v.literal("HR"), v.literal("Temp"), v.literal("SpO2")),
    value: v.string(),
    unit: v.string(),
    timestamp: v.number(),
  }).index("by_patient", ["patientId"]),

  // 8. Emergency SOS Triggers
  emergencies: defineTable({
    patientId: v.id("patients"),
    nurseId: v.string(),
    status: v.union(v.literal("active"), v.literal("resolved")),
    triggeredAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")), 
    resolutionNotes: v.optional(v.string()),
  }).index("by_status", ["status"]).index("by_patient", ["patientId"]),

  // 9. System Audit Logs
  auditLogs: defineTable({
    userId: v.string(),       
    action: v.string(),       
    targetId: v.string(),     
    patientName: v.optional(v.string()), 
    timestamp: v.number(),
    metadata: v.any(),        
  }).index("by_action", ["action"]),

  // 10. Leave Requests
  leaveRequests: defineTable({
    userId: v.id("users"),
    shiftId: v.id("shifts"),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestTime: v.number(),
  }).index("by_status", ["status"]),
});