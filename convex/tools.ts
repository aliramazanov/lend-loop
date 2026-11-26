/*
 * Public listing API used by the app.
 *
 * listPublicBoard: the board signed-out visitors see, with tool names and categories only.
 * listBoard, getDetails: the full board and a tool page for signed-in neighbors, including
 * photos, the owner card and which days are already booked.
 * listMyListings, getMyListing, listMyRemovedListings: the owner's own listings, for the
 * My Listings page, the edit form and the Recently removed section.
 * create, update, remove, restore: listing changes. Removing hides a listing instead of
 * deleting it, so it can be restored later.
 * generatePhotoUploadUrl: a one-time upload address for a listing photo.
 * listRemovedForAdmin: every removed listing, for the admin area.
 */

import { v } from "convex/values";
import {
  adminQuery,
  publicQuery,
  userMutation,
  userQuery,
} from "./lib/functions";
import { categoryValidator, toolFieldsValidator } from "./lib/validators";
import * as ToolReads from "./model/toolReads";
import * as ToolWrites from "./model/toolWrites";

const toolIdArgs = { toolId: v.id("tools") };

export const listPublicBoard = publicQuery({
  args: {},

  handler: async (ctx) => await ToolReads.publicBoard(ctx),
});

export const listBoard = userQuery({
  args: { category: v.optional(categoryValidator) },

  handler: async (ctx, { category }) =>
    await ToolReads.board(ctx, ctx.user, category),
});

export const listMyListings = userQuery({
  args: {},

  handler: async (ctx) => await ToolReads.ownListings(ctx, ctx.user._id),
});

export const getMyListing = userQuery({
  args: { toolId: v.string() },

  handler: async (ctx, { toolId }) =>
    await ToolReads.ownListing(ctx, ctx.user._id, toolId),
});

export const listMyRemovedListings = userQuery({
  args: {},

  handler: async (ctx) => await ToolReads.removedByOwner(ctx, ctx.user._id),
});

export const listRemovedForAdmin = adminQuery({
  args: {},

  handler: async (ctx) => await ToolReads.removedForAdmin(ctx),
});

export const getDetails = userQuery({
  args: { toolId: v.string() },

  handler: async (ctx, { toolId }) =>
    await ToolReads.details(ctx, ctx.user, toolId),
});

export const generatePhotoUploadUrl = userMutation({
  args: {},

  handler: async (ctx) => await ToolWrites.generatePhotoUploadUrl(ctx),
});

export const create = userMutation({
  args: toolFieldsValidator,

  handler: async (ctx, fields) => await ToolWrites.create(ctx, fields),
});

export const update = userMutation({
  args: { toolId: v.id("tools"), ...toolFieldsValidator },

  handler: async (ctx, { toolId, ...fields }) =>
    await ToolWrites.update(ctx, toolId, fields),
});

export const remove = userMutation({
  args: toolIdArgs,

  handler: async (ctx, { toolId }) => await ToolWrites.remove(ctx, toolId),
});

export const restore = userMutation({
  args: toolIdArgs,

  handler: async (ctx, { toolId }) => await ToolWrites.restore(ctx, toolId),
});
