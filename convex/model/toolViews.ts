import { QueryCtx } from "../_generated/server";
import { todayUtc } from "../lib/dates";
import { isOnLoanToday } from "./loanRules";
import { bookedLoansForTool, isToolOnLoan, loansAsLender } from "./loanStore";
import { photoUrls, photosWithUrls } from "./toolPhotos";
import { isArchived, isListed, listOwnedTools } from "./toolStore";
import type { Tool, Viewer } from "../types";

export function toPublicTool(tool: Tool) {
  return { _id: tool._id, name: tool.name, category: tool.category };
}

export async function toBoardTool(ctx: QueryCtx, tool: Tool, viewer: Viewer) {
  const owner = await ctx.db.get("users", tool.ownerId);

  return {
    _id: tool._id,
    name: tool.name,
    category: tool.category,
    condition: tool.condition,
    shortDescription: tool.shortDescription,
    photoUrls: await photoUrls(ctx, tool.photoIds),
    isAvailable: !(await isToolOnLoan(ctx, tool._id, todayUtc())),
    ownerName: owner?.name ?? "Neighbor",
    ownerTrustedLender: owner?.trustedLender ?? false,
    isOwner: tool.ownerId === viewer._id,
    createdAt: tool.createdAt,
  };
}

export async function toOwnListing(ctx: QueryCtx, tool: Tool) {
  return {
    _id: tool._id,
    name: tool.name,
    category: tool.category,
    condition: tool.condition,
    shortDescription: tool.shortDescription,
    photos: await photosWithUrls(ctx, tool.photoIds),
    isAvailable: !(await isToolOnLoan(ctx, tool._id, todayUtc())),
  };
}

export function toRemovedListing(tool: Tool, ownerName?: string) {
  return {
    _id: tool._id,
    name: tool.name,
    archivedAt: tool.archivedAt ?? tool.updatedAt,
    ownerName,
  };
}

async function ownerProfile(ctx: QueryCtx, tool: Tool) {
  const owner = await ctx.db.get("users", tool.ownerId);
  const ownerTools = await listOwnedTools(ctx, tool.ownerId);
  const ownerLoans = await loansAsLender(ctx, tool.ownerId);
  const completed = ownerLoans.filter((loan) => loan.status === "returned");

  return {
    ownerName: owner?.name ?? "Neighbor",
    ownerTrustedLender: owner?.trustedLender ?? false,
    ownerSince: owner?.createdAt ?? tool.createdAt,
    ownerActiveListings: ownerTools.filter(isListed).length,
    ownerCompletedLoans: completed.length,
  };
}

async function availability(ctx: QueryCtx, tool: Tool) {
  const today = todayUtc();
  const booked = await bookedLoansForTool(ctx, tool._id);

  const bookedRanges = booked
    .filter((loan) => loan.endDate >= today)
    .map((loan) => ({ startDate: loan.startDate, endDate: loan.endDate }))
    .sort((first, second) => first.startDate.localeCompare(second.startDate));

  return {
    isAvailable: !booked.some((loan) => isOnLoanToday(loan, today)),
    bookedRanges,
  };
}

export async function toToolDetails(ctx: QueryCtx, tool: Tool, viewer: Viewer) {
  return {
    _id: tool._id,
    name: tool.name,
    category: tool.category,
    condition: tool.condition,
    shortDescription: tool.shortDescription,
    photoUrls: await photoUrls(ctx, tool.photoIds),
    isOwner: tool.ownerId === viewer._id,
    isArchived: isArchived(tool),
    listedAt: tool.createdAt,
    ...(await ownerProfile(ctx, tool)),
    ...(await availability(ctx, tool)),
  };
}
