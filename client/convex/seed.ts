// import { mutation } from "./_generated/server";

// export const setupLiveWard = mutation({
//   handler: async (ctx) => {
    /* // =========================================================
    // SECTION 1: USERS & SETTINGS (ALREADY SEEDED)
    // =========================================================
    
    // 1. Create Head Nurse (Admin)
    await ctx.db.insert("users", {
      name: "Head Nurse Admin",
      email: "head@hospital.com",
      password: "password123",
      role: "admin",
      tokenIdentifier: "ADMIN_DEMO",
      isCheckIn: true,
      status: "active",
    });

    // 2. Create 14 Nurse Accounts
    for (let i = 1; i <= 14; i++) {
      await ctx.db.insert("users", {
        name: `Nurse Group ${i}`,
        email: `nurse${i}@hospital.com`,
        password: "password123",
        role: "nurse",
        tokenIdentifier: `NURSE_DEMO_${i}`,
        isCheckIn: false,
        status: "active",
      });
    }

    // 3. Set Global System Settings
    await ctx.db.insert("systemSettings", {
      overridePin: "8822",
      hospitalLat: 60.1699, 
      hospitalLong: 24.9384,
      geofenceRadius: 500000, 
    });
    */

    // =========================================================
    // SECTION 2: LIVE PATIENT DATA (98 PATIENTS)
    // =========================================================
//     const patientNames = [
//       "James Wilson", "Maria Garcia", "Robert Chen", "Sarah Ahmed", "Liam O'Connor",
//       "Elena Rossi", "David Smith", "Aisha Khan", "Thomas Muller", "Linda Johnson",
//       "Hiroshi Tanaka", "Emma Wright", "Samuel Jackson", "Chloe Dubois", "Oscar Nilsson",
//       "Amira Haddad", "Lucas Silva", "Isabella Novak", "Victor Petrov", "Grace Taylor",
//       "Noah Williams", "Sofia Martinez", "William Brown", "Yuki Sato", "Hanna Schmidt"
//     ];

//     const statuses = ["Stable", "Unstable", "Critical"];
//     const conditions = ["Post-Op Recovery", "Hypertension", "Respiratory Distress", "Observation", "Cardiac Monitoring"];

//     const nurses = await ctx.db
//       .query("users")
//       .filter((q) => q.eq(q.field("role"), "nurse"))
//       .collect();

//     console.log(`Found ${nurses.length} nurses. Seeding patients...`);

//     for (const nurse of nurses) {
//       const groupMatch = nurse.tokenIdentifier.match(/\d+/);
//       const groupNum = groupMatch ? groupMatch[0] : "0";

//       for (let i = 1; i <= 7; i++) {
//         const randomName = patientNames[Math.floor(Math.random() * patientNames.length)];
        
//         await ctx.db.insert("patients", {
//           name: randomName, 
//           age: Math.floor(Math.random() * 60) + 20,
//           sex: i % 2 === 0 ? "Male" : "Female",
//           roomNumber: `S-${groupNum}0${i}`, 
//           status: statuses[Math.floor(Math.random() * statuses.length)],
//           medicalHistory: conditions[Math.floor(Math.random() * conditions.length)],
//           active: true,
//           assignedNurseId: nurse._id,
//           lastUpdated: Date.now(),
//         });
//       }
//     }

//     return "Phase 2 Success: Patients assigned to specific nurse names! 🏥✅";
//   },
// });

import { internalMutation } from "./_generated/server";

export const seedPatients = internalMutation({
  handler: async (ctx) => {
    // 🏥 Configuration
    const statuses = ["Stable", "Unstable", "Critical"]; // One of each per floor
    const sexes = ["Male", "Female", "Other"];
    const histories = [
      "Chronic hypertension and type 2 diabetes. Requires glucose monitoring.",
      "Post-operative recovery (Appendectomy). Monitoring for infection.",
      "Acute respiratory distress. Oxygen therapy initiated at 2L/min.",
      "History of AFib. Admitted for heart rate regulation and observation.",
      "Severe dehydration and electrolyte imbalance. IV fluids started.",
      "Recovering from mild concussion. Neurological checks every 4 hours."
    ];
    
    const names = [
      "Liam", "Olivia", "Noah", "Emma", "Oliver", "Charlotte", "James", "Amelia", 
      "Elijah", "Sophia", "William", "Ava", "Henry", "Isabella", "Lucas", "Mia",
      "Benjamin", "Evelyn", "Theodore", "Harper", "Mateo", "Luna", "Levi", "Aria",
      "Sebastian", "Ella", "Daniel", "Elizabeth", "Jack", "Camila", "Wyatt", "Layla",
      "Owen", "Grace", "Asher", "Chloe", "Christopher", "Victoria", "Leo", "Riley",
      "Julian", "Lily", "Hudson", "Eleanor"
    ];

    let nameIndex = 0;

    // 14 Floors
    for (let floor = 1; floor <= 14; floor++) {
      
      // 3 Patients per floor
      for (let i = 0; i < 3; i++) {
        const patientName = names[nameIndex] || `Patient ${nameIndex + 1}`;
        const age = Math.floor(Math.random() * (85 - 20) + 20);
        const sex = sexes[i]; // Rotates Male, Female, Other
        const status = statuses[i]; // 🟢 Ensures 1 Stable, 1 Unstable, 1 Critical per floor
        const history = histories[Math.floor(Math.random() * histories.length)];
        
        // 🚪 Room Numbering Logic:
        // Floor 1: 101, 102, 103
        // Floor 12: 1201, 1202, 1203
        const roomNumber = `${floor}${i + 1 < 10 ? '0' : ''}${i + 1}`;

        await ctx.db.insert("patients", {
          name: patientName,
          age: age,
          sex: sex as "Male" | "Female" | "Other",
          roomNumber: roomNumber,
          medicalHistory: history,
          status: status,
          active: true,
        });

        nameIndex++;
      }
    }

    console.log("✅ Seed Complete: 42 Patients added (Balanced Statuses per Floor).");
  },
});