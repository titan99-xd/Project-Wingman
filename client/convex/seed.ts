import { mutation } from "./_generated/server";

export const setupLiveWard = mutation({
  handler: async (ctx) => {
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
      geofenceRadius: 500000, // Finland-wide for safety
    });

    return "Phase 1: 15 Users and System Settings Seeded! ✅";
  },
});