# SentryX: Ward Command Ecosystem

**SentryX** is a high-fidelity, real-time medical oversight system designed to bridge the communication gap between the bedside and the boardroom. It transforms fragmented ward data into a cohesive "Mission Control" experience for nurses, head nurses, and ward managers.

![Status](https://img.shields.io/badge/Status-Deployment--Ready-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-React%20|%20Convex%20|%20TypeScript-blue?style=for-the-badge)

---

##  Project Purpose
In a modern hospital ward, "Data Silence" kills. SentryX was built to solve the latency in emergency response and the inefficiency of manual staffing. By connecting live patient status to a centralized dashboard, SentryX ensures that help is always one millisecond away.

### Core Pillars:
1.  **The Gatekeeper:** A secure entry point using **GPS Geofencing** to ensure only on-site staff can access sensitive clinical data.
2.  **Oversight Hub:** A "Mission Control" dashboard featuring a **14-floor heatmap** and real-time SOS alerting system.
3.  **Manager Portal:** An administrative tool for 15-day roster planning and instant **Staffing Deficit** identification.

---

##  Tech Stack
* **Frontend:** React 18, Vite, TypeScript
* **Backend:** Convex (Real-time BaaS)
* **Database:** Convex Document Store
* **Styling:** Custom High-Contrast CSS (Mission Control Dark Mode)
* **Security:** GPS Geolocation API & PIN-based Auth

---

##  Installation & Setup

### 1. Prerequisites
* Node.js (v18+)
* npm 
* A Convex account ([convex.dev](https://www.convex.dev/))

### 2. Clone and Install
```bash
git clone [https://github.com/yourusername/sentryx-ward.git](https://github.com/yourusername/sentryx-ward.git)
cd sentryx-ward
npm install
```

### 3. Initialize Backend (Convex)
```bash 
npx convex dev 
```

### 4. Seed the ward 
* To demonstrate the 14-floor heatmap, run our balanced seed script:
```bash 
npx convex run seed:seedPatients
```
### 5. Start the Frontend 
```bash 
npm run dev 
```

### 6. Database Schema 
```bash 
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

  //  2. Global Settings 
  settings: defineTable({
    overridePin: v.string(),      
    wardName: v.string(),         
    hospitalLat: v.number(),      
    hospitalLong: v.number(),     
    gpsRadius: v.number(),        
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
    status: v.string(),    
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
```

## SentryX: Complete Feature Inventory

SentryX is built as a three-pillar ecosystem designed for high-stakes medical ward management. Below is the comprehensive breakdown of features implemented in the current deployment.

---

## 1.  The Gatekeeper (Security & Shift Entry)
* **GPS Geofencing:** Restricts clinical data access to physical ward boundaries using the browser’s Geolocation API.
* **Security Override:** A 4-digit Master PIN system for emergency access or GPS hardware failures.
* **Personal Duty Roster:** Dynamic 15-day personal view for staff to track upcoming shifts.
* **Instant Absence Reporting:** A streamlined workflow allowing nurses to flag one or multiple shifts for immediate manager notification.
* **Biometric-Style Pulse:** A high-fidelity visual scanning animation for location verification UX.

---

##  2. Oversight Hub (Mission Control)
* **Sub-100ms SOS Feed:** Real-time emergency alert cards that pop up instantly when triggered from a bedside tablet.
* **Priority Triage Visuals:** High-contrast glowing red alerts for active emergencies with room-specific identification.
* **Emergency Resolution Loop:** A mandatory workflow for clearing alerts, requiring clinical notes that are automatically archived.
* **14-Floor Clinical Heatmap:** A data-aggregated visual stack representing the "Clinical Weight" of the entire ward.
* **Real-Time Analytics Bar:** Live counters for Total Admissions, plus a status breakdown (Stable vs. Unstable vs. Critical).

---

## 3. Manager Suite (Logistics & Planning)
* **15-Day Master Roster:** A comprehensive bird's-eye view of all staff assignments across the next two weeks.
* **Staffing Deficit Logic:** Automated "Red Stripe" visual cues on the roster whenever a nurse reports sick.
* **Global Alert Banner:** A persistent, high-visibility warning triggered at the top of the manager’s screen during personnel shortages.
* **Patient Intake System:** A digital "Admissions Form" to register new patients with fields for medical history, sex, age, and initial triage status.
* **Floor Assignment Engine:** Dynamic linking between specific nurses and their assigned clinical floors (1–14).

---

##  4. Technical & Data Intelligence
* **Real-Time Reactivity:** Powered by **Convex**, ensuring all changes (SOS, sick leave, admissions) reflect on every device without a page refresh.
* **Balanced Data Seeding:** A custom script populating the ward with 42 patients (3 per floor) with a perfectly balanced triage spread.
* **Scalable Floor Logic:** Architecture that distinguishes between Floor 1 and Floor 10-14 for accurate heatmap rendering.
* **Medical-Grade Type Safety:** Full **TypeScript** implementation to prevent data errors in critical patient records.
* **Persistent State:** Local storage integration ensures nurse sessions remain active during shifts.

---

## Roadmap
SentryX is built to scale. Future versions of the ecosystem will include:
- [ ] **IoT Integration:** Live vitals streaming directly from wearable bedside monitors.
- [ ] **Mobile Companion:** A simplified "SentryX Lite" app for paramedics and transit teams.
- [ ] **Multi-Ward Sync:** Capability to manage multiple hospital wings from a single Global Command Hub.

##  Acknowledgments
- [Convex](https://www.convex.dev/) for providing the millisecond-latency reactive backend.
- The healthcare professionals whose feedback shaped the "Mission Control" UI/UX.

##  Contact
**Project Lead:** Abhinav Gautam  
**Email:** abhinavgautam3166@gmail.com 
**Project Link:** [https://github.com/titan99-xd/Project-Wingman](https://github.com/titan99-xd/Project-Wingman)

##  License
It is open for academic and collaborative use.

---
**© 2026 SentryX Health Systems** *System Status:  All 14 Floors Operational |  Geofence Active*




