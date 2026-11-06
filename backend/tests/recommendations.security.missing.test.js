const request = require("supertest");

jest.mock("../src/models/preferenceModel", () => ({
  getPreferencesByUser: jest.fn(),
  mapPreferenceRowToSong: jest.fn(),
}));

jest.mock("../src/models/songModel", () => ({
  getAllSongs: jest.fn(),
}));

const {
  getPreferencesByUser,
} = require("../src/models/preferenceModel");

const app = require("../src/app");

describe("R1 SOC 2 - Missing User ID Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handles a missing user ID without exposing internal details", async () => {
    const response = await request(app)
      .get("/api/recommendations/")
      .expect(404);

    expect(getPreferencesByUser).not.toHaveBeenCalled();

    expect(response.status).toBe(404);
    expect(response.status).not.toBe(500);

    const responseText = response.text;

    expect(responseText).not.toMatch(
      /password|secret|sql|stack trace|node_modules/i
    );
  });
});
