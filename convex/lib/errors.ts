import { ConvexError } from "convex/values";

export function unauthorized() {
  return new ConvexError("Unauthorized: Please sign in.");
}

export function forbidden(reason: string) {
  return new ConvexError(`Forbidden: ${reason}`);
}

export function notFound(subject: string) {
  return new ConvexError(`${subject} not found.`);
}
