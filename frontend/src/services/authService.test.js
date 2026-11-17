import { describe, expect, test } from "vitest";
import { getSpotifyOAuthUrl } from "./authService";

describe("Phase 1 - Authentication API URL", () => {
  test("uses the configured API base URL", () => {
    expect(
      getSpotifyOAuthUrl("http://localhost:5000")
    ).toBe("http://localhost:5000/auth/spotify");
  });

  test("removes trailing slashes", () => {
    expect(
      getSpotifyOAuthUrl("http://localhost:5000///")
    ).toBe("http://localhost:5000/auth/spotify");
  });

  test("rejects missing API configuration", () => {
    expect(() => getSpotifyOAuthUrl(""))
      .toThrow("Music Vault API base URL is not configured.");

    expect(() => getSpotifyOAuthUrl(null))
      .toThrow("Music Vault API base URL is not configured.");
  });
});
