import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. User Management (Staff Profiles)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),      // Added for the 15-person demo login
    role: v.union(v.literal("admin"), v.literal("nurse")),
    tokenIdentifier: v.string(), 
    isCheckIn: v.boolean(),    // Tracks if they passed the Geofence/PIN check
    status: v.string(),        // "active" | "on_leave" | "off_duty"
  })
  .index("by_token", ["tokenIdentifier"])
  .index("by_email", ["email"]),

  // 2. Patient Information
  patients: defineTable({
    name: v.string(),
    age: v.number(),
    sex: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    medicalHistory: v.string(),
    roomNumber: v.string(),
    status: v.string(),        // "Stable", "Unstable", "Critical"
    active: v.boolean(),
    assignedNurseId: v.optional(v.id("users")), // For direct nurse filtering
    handoverNotes: v.optional(v.string()),      // Notes for shift changes
    lastUpdated: v.optional(v.number()),  // Timestamp for sorting and updates
  }).index("by_assigned_nurse", ["assignedNurseId"]),

  // 3. Medications
  medications: defineTable({
    patientId: v.id("patients"),
    name: v.string(),        
    dosage: v.string(),      
    frequency: v.string(),   
    totalDoses: v.number(), 
    dosesGiven: v.number(),
    status: v.string(),      // "scheduled" | "administered"
    scheduledFor: v.number(),
    administeredAt: v.optional(v.number()),
    administeredBy: v.optional(v.string()), 
  }).index("by_patient", ["patientId"]),

  // 4. Shifts (Geofenced Monitoring)
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
    floorNumber: v.optional(v.number()), // Added for the 15-Day Roster
    shiftType: v.optional(v.string()),   // "Morning", "Afternoon", "Night"
    leaveRequested: v.optional(v.boolean()), // Tracks sick leave status
    leaveReason: v.optional(v.string()),
    isOverrideUsed: v.optional(v.boolean()), // Tracks if 4-digit PIN was used
    checkInDetails: v.optional(v.object({
      time: v.number(),
      lat: v.number(),
      lng: v.number(),
      distanceFromHospital: v.number(),
    })),
  }).index("by_nurse", ["nurseId"]).index("by_status", ["status"]),

  // 5. Shift Assignments (Linking shifts to patients)
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
    nurseId: v.string(),
    status: v.union(v.literal("active"), v.literal("resolved")),
    triggeredAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")), 
    resolutionNotes: v.optional(v.string()),
  }).index("by_status", ["status"]).index("by_patient", ["patientId"]),

  // 8. System Audit Logs
  auditLogs: defineTable({
    userId: v.string(),       
    action: v.string(),       
    targetId: v.string(),     
    patientName: v.optional(v.string()), 
    timestamp: v.number(),
    metadata: v.any(),        
  }).index("by_action", ["action"]),

  // 9. Leave Requests (Manual Approval Table)
  leaveRequests: defineTable({
    userId: v.id("users"),
    shiftId: v.id("shifts"),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    requestTime: v.number(),
  }).index("by_status", ["status"]),

  // 10. System Settings (Global Config)
  systemSettings: defineTable({
    overridePin: v.string(),      // "8822"
    hospitalLat: v.number(),      // Classroom Lat
    hospitalLong: v.number(),     // Classroom Long
    geofenceRadius: v.number(),   // Distance (e.g., 500000 for Finland)
  }),
});