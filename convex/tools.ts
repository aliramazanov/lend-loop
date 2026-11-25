import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoryValidator, toolFieldsValidator } from "./lib/validators";
import { requireAdmin, requireUser } from "./model/auth";
import * as ToolReads from "./model/toolReads";
import * as ToolWrites from "./model/toolWrites";

const toolIdArgs = { toolId: v.id("tools") };

export const listPublicBoard = query({
  args: {},

  handler: async (ctx) => await ToolReads.publicBoard(ctx),
});

export const listBoard = query({
  args: { category: v.optional(categoryValidator) },

  handler: async (ctx, { category }) => {
    const viewer = await requireUser(ctx);

    return await ToolReads.board(ctx, viewer, category);
  },
});

export const listMyListings = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await ToolReads.ownListings(ctx, user._id);
  },
});

export const getMyListing = query({
  args: { toolId: v.string() },

  handler: async (ctx, { toolId }) => {
    const user = await requireUser(ctx);

    return await ToolReads.ownListing(ctx, user._id, toolId);
  },
});

export const listMyRemovedListings = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return await ToolReads.removedByOwner(ctx, user._id);
  },
});

export const listRemovedForAdmin = query({
  args: {},

  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ToolReads.removedForAdmin(ctx);
  },
});

export const getDetails = query({
  args: { toolId: v.string() },

  handler: async (ctx, { toolId }) => {
    const viewer = await requireUser(ctx);

    return await ToolReads.details(ctx, viewer, toolId);
  },
});

export const generatePhotoUploadUrl = mutation({
  args: {},

  handler: async (ctx) => await ToolWrites.generatePhotoUploadUrl(ctx),
});

export const create = mutation({
  args: toolFieldsValidator,

  handler: async (ctx, fields) => await ToolWrites.create(ctx, fields),
});

export const update = mutation({
  args: { toolId: v.id("tools"), ...toolFieldsValidator },

  handler: async (ctx, { toolId, ...fields }) =>
    await ToolWrites.update(ctx, toolId, fields),
});

export const remove = mutation({
  args: toolIdArgs,

  handler: async (ctx, { toolId }) => await ToolWrites.remove(ctx, toolId),
});

export const restore = mutation({
  args: toolIdArgs,

  handler: async (ctx, { toolId }) => await ToolWrites.restore(ctx, toolId),
});
