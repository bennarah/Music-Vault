import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadRecommendationCsv } from "./recommendationCsvApi";

describe("SCRUM-239 - Recommendation CSV Download Service", () => {
  const userId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:musicvault-test"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("downloads a CSV file from the recommendation export endpoint", async () => {
    const csv = "title,artist\r\nExample Song,Example Artist\r\n";

    fetch.mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "text/csv; charset=utf-8",
      }),
      blob: async () => new Blob([csv], { type: "text/csv" }),
    });

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    await downloadRecommendationCsv(userId);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `/api/recommendations/${userId}/export`
      )
    );

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:musicvault-test"
    );
  });

  it("rejects missing user IDs", async () => {
    await expect(downloadRecommendationCsv(""))
      .rejects.toThrow("A user ID is required.");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects unsuccessful export responses", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(downloadRecommendationCsv(userId))
      .rejects.toThrow("Unable to download recommendations.");

    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("rejects responses that are not CSV", async () => {
    fetch.mockResolvedValue({
      ok: true,
      headers: new Headers({
        "content-type": "application/json",
      }),
    });

    await expect(downloadRecommendationCsv(userId))
      .rejects.toThrow("Invalid CSV export response.");

    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
