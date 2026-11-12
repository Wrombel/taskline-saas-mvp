import { describe, expect, it } from "vitest";
import { makeCalculateSlidingExpiration } from "./session.js";

const HOUR_MS = 60 * 60 * 1000;
const SLIDING_WINDOW_HOURS = 72;
const SLIDING_WINDOW_MS = SLIDING_WINDOW_HOURS * HOUR_MS;
const start = new Date("2026-01-01T00:00:00.000Z");

const createSessionDates = (now: Date, maxExpiresAt: Date) => ({
  expiresAt: new Date(start.getTime() + SLIDING_WINDOW_MS),
  maxExpiresAt,
  now,
});

describe("makeCalculateSlidingExpiration", () => {
  it("does not slide before 10% of the window has elapsed", () => {
    const now = new Date(start.getTime() + 7.2 * HOUR_MS - 1);
    const dates = createSessionDates(now, new Date(start.getTime() + 14 * 24 * HOUR_MS));

    expect(makeCalculateSlidingExpiration(SLIDING_WINDOW_HOURS, dates, dates.now)).toBeNull();
  });

  it("slides when 10% of the window has elapsed", () => {
    const now = new Date(start.getTime() + 7.2 * HOUR_MS);
    const dates = createSessionDates(now, new Date(start.getTime() + 14 * 24 * HOUR_MS));

    expect(makeCalculateSlidingExpiration(SLIDING_WINDOW_HOURS, dates, dates.now)).toEqual(
      new Date(now.getTime() + SLIDING_WINDOW_MS),
    );
  });

  it("caps the new expiration at maxExpiresAt", () => {
    const now = new Date(start.getTime() + 7.2 * HOUR_MS);
    const currentExpiresAt = new Date(start.getTime() + SLIDING_WINDOW_MS);
    const maxExpiresAt = new Date(currentExpiresAt.getTime() + 3 * HOUR_MS);
    const dates = createSessionDates(now, maxExpiresAt);

    expect(makeCalculateSlidingExpiration(SLIDING_WINDOW_HOURS, dates, dates.now)).toEqual(maxExpiresAt);
  });

  it("does not slide an expired session", () => {
    const now = new Date(start.getTime() + SLIDING_WINDOW_MS + 1);
    const dates = createSessionDates(now, new Date(start.getTime() + 14 * 24 * HOUR_MS));

    expect(makeCalculateSlidingExpiration(SLIDING_WINDOW_HOURS, dates, dates.now)).toBeNull();
  });

  it("does not slide after the maximum expiration", () => {
    const now = new Date(start.getTime() + 7.2 * HOUR_MS);
    const maxExpiresAt = new Date(now.getTime());
    const dates = createSessionDates(now, maxExpiresAt);

    expect(makeCalculateSlidingExpiration(SLIDING_WINDOW_HOURS, dates, dates.now)).toBeNull();
  });
});
