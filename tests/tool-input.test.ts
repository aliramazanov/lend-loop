import { describe, expect, it } from "vitest";
import { validateToolInput } from "../convex/model/toolInput";

describe("tool listing input", () => {
  it("trims whitespace and accepts valid tool inputs", () => {
    const result = validateToolInput(
      "  Bosch Jigsaw  ",
      "  Clean cuts, includes 3 blades.  ",
    );

    expect(result).toEqual({
      name: "Bosch Jigsaw",
      shortDescription: "Clean cuts, includes 3 blades.",
    });
  });

  it("rejects overly short names or descriptions", () => {
    expect(() => validateToolInput("A", "Valid description here")).toThrow(
      /between 2 and 80/,
    );

    expect(() => validateToolInput("Drill", "Tiny")).toThrow(
      /between 5 and 280/,
    );
  });

  it("rejects invisible Unicode tag, bidi and zero-width characters", () => {
    const tagSmuggled = "Drill" + String.fromCodePoint(0xe0049, 0xe0067);

    expect(() => validateToolInput(tagSmuggled, "A solid drill")).toThrow(
      /hidden or control/,
    );

    expect(() => validateToolInput("Saw\u202Eevil", "A solid saw")).toThrow(
      /hidden or control/,
    );

    expect(() => validateToolInput("Tent", "Roomy\u200Btent")).toThrow(
      /hidden or control/,
    );
  });

  it("keeps line breaks in descriptions and emoji joined with ZWJ", () => {
    const family = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}";

    expect(
      validateToolInput("Tent", "Roomy tent\nSleeps four").shortDescription,
    ).toBe("Roomy tent\nSleeps four");

    expect(validateToolInput(`Tent ${family}`, "Fits the family").name).toBe(
      `Tent ${family}`,
    );
  });
});
