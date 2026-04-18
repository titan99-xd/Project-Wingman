import { query } from "./_generated/server";

/**
 * Fetches the global hospital settings (PIN, Geofence coordinates, etc.)
 * This is used by the Gatekeeper to verify the nurse's location.
 */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("systemSettings").first();
  },
});