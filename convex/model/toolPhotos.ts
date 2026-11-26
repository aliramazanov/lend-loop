/*
 * Listing photos kept in Convex storage.
 *
 * assertValidPhotos: only JPEG, PNG or WebP, within the size and count limits.
 * photosWithUrls, photoUrls: viewable links for the app.
 * deleteDroppedPhotos: removes files that an edit took off a listing.
 */

import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { PHOTO_POLICY } from "../shared/policy";
import type {
  DeleteDroppedPhotosArgs,
  HasUrlArgs,
  PhotoId,
  StoredPhoto,
} from "../types";

async function isAcceptedPhoto(ctx: QueryCtx, photoId: PhotoId) {
  const file = await ctx.db.system.get("_storage", photoId);

  if (!file?.contentType) return false;

  return (
    PHOTO_POLICY.acceptedTypes.includes(file.contentType) &&
    file.size <= PHOTO_POLICY.maxBytes
  );
}

function hasUrl(photo: HasUrlArgs): photo is StoredPhoto {
  return photo.url !== null;
}

export async function assertValidPhotos(ctx: QueryCtx, photoIds: PhotoId[]) {
  if (photoIds.length > PHOTO_POLICY.maxPerListing) {
    throw new ConvexError(
      `A listing can have at most ${PHOTO_POLICY.maxPerListing} photos.`,
    );
  }

  for (const photoId of photoIds) {
    if (!(await isAcceptedPhoto(ctx, photoId))) {
      throw new ConvexError(
        `Photos must be JPEG, PNG or WebP and at most ${PHOTO_POLICY.maxMegabytes} MB.`,
      );
    }
  }
}

export async function photosWithUrls(
  ctx: QueryCtx,
  photoIds: PhotoId[] | undefined,
): Promise<StoredPhoto[]> {
  const photos = await Promise.all(
    (photoIds ?? []).map(async (id) => ({
      id,
      url: await ctx.storage.getUrl(id),
    })),
  );

  return photos.filter(hasUrl);
}

export async function photoUrls(
  ctx: QueryCtx,
  photoIds: PhotoId[] | undefined,
) {
  const photos = await photosWithUrls(ctx, photoIds);

  return photos.map((photo) => photo.url);
}

export async function deleteDroppedPhotos(
  ctx: MutationCtx,
  { previous, kept }: DeleteDroppedPhotosArgs,
) {
  const keptIds = new Set(kept);

  for (const photoId of previous) {
    if (!keptIds.has(photoId)) {
      await ctx.storage.delete(photoId);
    }
  }
}
