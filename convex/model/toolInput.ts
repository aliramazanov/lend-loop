import { ConvexError } from "convex/values";
import {
  containsHiddenCharacters,
  isLengthWithin,
  normalizeText,
} from "../lib/text";
import { LISTING_POLICY } from "../shared/policy";

const { nameLength, descriptionLength } = LISTING_POLICY;

export interface ToolText {
  name: string;
  shortDescription: string;
}

export function validateToolInput(
  rawName: string,
  rawDescription: string,
): ToolText {
  const name = normalizeText(rawName);
  const shortDescription = normalizeText(rawDescription);

  if (!isLengthWithin(name, nameLength)) {
    throw new ConvexError(
      `Tool name must be between ${nameLength.min} and ${nameLength.max} characters.`,
    );
  }

  if (!isLengthWithin(shortDescription, descriptionLength)) {
    throw new ConvexError(
      `Description must be between ${descriptionLength.min} and ${descriptionLength.max} characters.`,
    );
  }

  if (containsHiddenCharacters(name)) {
    throw new ConvexError("Tool name contains hidden or control characters.");
  }

  if (containsHiddenCharacters(shortDescription, { allowNewlines: true })) {
    throw new ConvexError("Description contains hidden or control characters.");
  }

  return { name, shortDescription };
}
