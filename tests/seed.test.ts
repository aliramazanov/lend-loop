// @vitest-environment edge-runtime
import { describe, expect, it } from "vitest";
import { internal } from "../convex/_generated/api";
import { createBackend, useFrozenClock } from "./support/backend";

useFrozenClock();

describe("demo data", () => {
  it("creates one overdue loan and one due tomorrow for the reminder workflows", async () => {
    const t = createBackend();

    await t.mutation(internal.seed.demo, {});

    const created = await t.mutation(internal.seed.reminderLoans, {});

    const overdue = await t.query(internal.n8n.listOverdueLoans, {
      today: "2026-11-19",
    });

    const dueSoon = await t.query(internal.n8n.listDueSoonLoans, {
      tomorrow: "2026-11-20",
    });

    expect(created).toEqual({ overdue: true, dueTomorrow: true });
    expect(overdue).toHaveLength(1);
    expect(dueSoon).toHaveLength(1);
  });

  it("asks for the demo neighbors before creating loans", async () => {
    const t = createBackend();

    await expect(t.mutation(internal.seed.reminderLoans, {})).rejects.toThrow(
      /Seed the demo neighbors first/,
    );
  });
});
