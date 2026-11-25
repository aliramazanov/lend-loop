const BYTES_PER_MEGABYTE = 1024 * 1024;

const MAX_PHOTO_MEGABYTES = 5;

const ACCEPTED_PHOTO_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const LOAN_POLICY = {
  maxDays: 30,
  escalateAfterOverdueDays: 3,
  maxNoteLength: 280,
  minIssueNoteLength: 5,
} as const;

export const LISTING_POLICY = {
  nameLength: { min: 2, max: 80 },
  descriptionLength: { min: 5, max: 280 },
  maxActivePerOwner: 25,
} as const;

export const PHOTO_POLICY = {
  maxPerListing: 5,
  maxMegabytes: MAX_PHOTO_MEGABYTES,
  maxBytes: MAX_PHOTO_MEGABYTES * BYTES_PER_MEGABYTE,
  maxSourceBytes: 25 * BYTES_PER_MEGABYTE,
  acceptedTypes: ACCEPTED_PHOTO_TYPES,
} as const;

export const MODERATION_POLICY = {
  suspensionReasonLength: { min: 5, max: 200 },
} as const;

export const PROFILE_POLICY = {
  maxDisplayNameLength: 60,
} as const;

export const OVERVIEW_WINDOWS = {
  trendDays: 14,
  failureWindowDays: 7,
} as const;
