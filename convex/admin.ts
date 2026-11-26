import { adminQuery } from "./lib/functions";
import { buildOverview } from "./model/adminOverview";

export const overview = adminQuery({
  args: {},

  handler: async (ctx) => await buildOverview(ctx),
});
