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

describe("R1 SOC 2 - Secure Backend Error Handling", () => {
  const userId = "123e4567-e89b-42d3-a456-426614174000";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not expose sensitive database error details", async () => {
    const sensitiveError =
      "Database connection failed: password=TEST_SECRET; " +
      "SQL SELECT * FROM users; internal stack trace";

    getPreferencesByUser.mockRejectedValue(
      new Error(sensitiveError)
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const response = await request(app)
        .get(`/api/recommendations/${userId}`)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: "Unable to generate recommendations.",
      });

      const responseText = JSON.stringify(response.body);

      expect(responseText).not.toContain("TEST_SECRET");
      expect(responseText).not.toContain("password");
      expect(responseText).not.toContain("SELECT * FROM users");
      expect(responseText).not.toContain("stack trace");
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
