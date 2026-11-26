/*
 * The only place Convex queries and mutations are built. Each public function picks the
 * access level it needs, and lint rejects building one any other way.
 *
 * publicQuery: anyone, signed in or not.
 * signedInMutation: anyone with a Clerk session, even before their neighbor record exists.
 * userQuery, userMutation: an active neighbor; the caller is passed along as user.
 * adminQuery, adminMutation: an admin; the caller is passed along as user.
 */

import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { requireAdmin, requireUser } from "../model/auth";

export const publicQuery = query;

export const signedInMutation = mutation;

export const userQuery = customQuery(
  query,
  customCtx(async (ctx) => ({ user: await requireUser(ctx) })),
);

export const userMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({ user: await requireUser(ctx) })),
);

export const adminQuery = customQuery(
  query,
  customCtx(async (ctx) => ({ user: await requireAdmin(ctx) })),
);

export const adminMutation = customMutation(
  mutation,
  customCtx(async (ctx) => ({ user: await requireAdmin(ctx) })),
);
