import { internalMutation } from "./_generated/server";
import { Category, Condition } from "./shared/catalog";

interface SeedTool {
  name: string;
  category: Category;
  condition: Condition;
  shortDescription: string;
}

interface SeedNeighbor {
  clerkId: string;
  name: string;
  trustedLender: boolean;
  tools: SeedTool[];
}

const NEIGHBORS: SeedNeighbor[] = [
  {
    clerkId: "seed_maya",
    name: "Maya Chen",
    trustedLender: true,
    tools: [
      {
        name: "Cordless Drill",
        category: "power tools",
        condition: "good",
        shortDescription: "18V drill with two batteries and a bit set.",
      },
      {
        name: "Hedge Trimmer",
        category: "garden",
        condition: "like_new",
        shortDescription:
          "Electric trimmer with a 24 inch blade, great for weekend tidy-ups.",
      },
      {
        name: "Stand Mixer",
        category: "kitchen",
        condition: "good",
        shortDescription: "5 quart mixer with whisk, paddle and dough hook.",
      },
    ],
  },
  {
    clerkId: "seed_sam",
    name: "Sam Ortiz",
    trustedLender: false,
    tools: [
      {
        name: "4-Person Tent",
        category: "camping",
        condition: "good",
        shortDescription: "Waterproof dome tent, sets up in ten minutes.",
      },
      {
        name: "Circular Saw",
        category: "power tools",
        condition: "fair",
        shortDescription: "7 1/4 inch saw, blade guard works, a bit loud.",
      },
      {
        name: "Projector",
        category: "electronics",
        condition: "like_new",
        shortDescription: "1080p projector with HDMI, good for movie nights.",
      },
    ],
  },
];

export const demo = internalMutation({
  args: {},

  handler: async (ctx) => {
    const [firstNeighbor] = NEIGHBORS;

    const alreadySeeded = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", firstNeighbor.clerkId))
      .unique();

    if (alreadySeeded) return { seeded: false };

    const now = Date.now();
    let toolCount = 0;

    for (const { tools, ...neighbor } of NEIGHBORS) {
      const ownerId = await ctx.db.insert("users", {
        ...neighbor,
        role: "user",
        createdAt: now,
      });

      for (const tool of tools) {
        await ctx.db.insert("tools", {
          ...tool,
          ownerId,
          createdAt: now,
          updatedAt: now,
        });

        toolCount += 1;
      }
    }

    return { seeded: true, neighbors: NEIGHBORS.length, tools: toolCount };
  },
});
