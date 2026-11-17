import { describe, expect, test } from "vitest";
import { DEV_USER_ID } from "./devUser";

describe("Shared development user configuration", () => {
  test("uses a valid UUID", () => {
    expect(DEV_USER_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  test("uses the existing Music Vault demo user", () => {
    expect(DEV_USER_ID).toBe(
      "11111111-1111-4111-8111-111111111111"
    );
  });
});
