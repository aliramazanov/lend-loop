// ZWJ stays allowed so emoji sequences such as family or flag emoji survive.
const HIDDEN_CHARACTER = /(?!\u200D)[\p{Cc}\p{Cf}]/u;
const HIDDEN_CHARACTER_EXCEPT_NEWLINE = /(?![\n\u200D])[\p{Cc}\p{Cf}]/u;
const HIDDEN_CHARACTERS = /(?!\u200D)[\p{Cc}\p{Cf}]/gu;

export interface LengthRange {
  min: number;
  max: number;
}

export function normalizeText(text: string): string {
  return text.normalize("NFC").trim();
}

export function stripHiddenCharacters(text: string): string {
  return text.normalize("NFC").replace(HIDDEN_CHARACTERS, "");
}

export function containsHiddenCharacters(
  text: string,
  { allowNewlines = false } = {},
): boolean {
  const pattern = allowNewlines
    ? HIDDEN_CHARACTER_EXCEPT_NEWLINE
    : HIDDEN_CHARACTER;

  return pattern.test(text);
}

export function isLengthWithin(text: string, { min, max }: LengthRange) {
  return text.length >= min && text.length <= max;
}
