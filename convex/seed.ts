/*
 * Demo data for local runs.
 *
 * demo: two neighbors and six tools across several categories. The demo neighbors have
 * no Clerk accounts, so they cannot sign in or answer requests.
 * reminderLoans: one loan two days overdue and one due tomorrow between those neighbors,
 * so the reminder workflows have something to send right away.
 */

import { ConvexError } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { internalMutation, MutationCtx } from "./_generated/server";
import { daysAgo, todayUtc, tomorrowUtc } from "./lib/dates";
import { bookedLoansForTool } from "./model/loanStore";
import { isListed, listOwnedTools } from "./model/toolStore";
import type { DateRange, SeedNeighbor } from "./types";

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

async function seededNeighbor(ctx: MutationCtx, clerkId: string) {
  const neighbor = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!neighbor) throw new ConvexError("Seed the demo neighbors first.");

  return neighbor;
}

async function freeToolOf(ctx: MutationCtx, ownerId: Id<"users">) {
  const tools = (await listOwnedTools(ctx, ownerId)).filter(isListed);

  for (const tool of tools) {
    const booked = await bookedLoansForTool(ctx, tool._id);

    if (booked.length === 0) return tool;
  }

  return null;
}

async function startLoan(
  ctx: MutationCtx,
  lender: Doc<"users">,
  borrower: Doc<"users">,
  dates: DateRange,
) {
  const tool = await freeToolOf(ctx, lender._id);

  if (!tool) return false;

  const now = Date.now();

  await ctx.db.insert("loans", {
    toolId: tool._id,
    lenderId: lender._id,
    borrowerId: borrower._id,
    ...dates,
    status: "active",
    handedOverAt: now,
    handoverConfirmedBy: "lender",
    handoverAcknowledgedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return true;
}

export const reminderLoans = internalMutation({
  args: {},

  handler: async (ctx) => {
    const [first, second] = NEIGHBORS;
    const maya = await seededNeighbor(ctx, first.clerkId);
    const sam = await seededNeighbor(ctx, second.clerkId);

    const overdue = await startLoan(ctx, maya, sam, {
      startDate: todayUtc(daysAgo(4)),
      endDate: todayUtc(daysAgo(2)),
    });

    const dueTomorrow = await startLoan(ctx, sam, maya, {
      startDate: todayUtc(daysAgo(1)),
      endDate: tomorrowUtc(),
    });

    return { overdue, dueTomorrow };
  },
});
