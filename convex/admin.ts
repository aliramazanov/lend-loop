import { query } from "./_generated/server";
import { buildOverview } from "./model/adminOverview";
import { requireAdmin } from "./model/auth";

export const overview = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await buildOverview(ctx);
  },
});
