import { ConvexError } from "convex/values";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }

  return FALLBACK_MESSAGE;
}
