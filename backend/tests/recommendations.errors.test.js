
const request = require("supertest");

// Mock the preference model before loading the Express app.
jest.mock("../src/models/preferenceModel", () => ({
  getPreferencesByUser: jest.fn(),
  mapPreferenceRowToSong: jest.fn(),
}));

// Mock candidate-song retrieval.
jest.mock("../src/models/songModel", () => ({
  getAllSongs: jest.fn(),
}));

const {
  getPreferencesByUser,
} = require("../src/models/preferenceModel");

const app = require("../src/app");

describe("Recommendation API - Error Handling", () => {
  const userId = "123e4567-e89b-42d3-a456-426614174000";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns HTTP 500 when preference retrieval fails", async () => {
    getPreferencesByUser.mockRejectedValue(
      new Error("Simulated database failure")
    );

    const response = await request(app)
      .get(`/api/recommendations/${userId}`)
      .expect(500);

    expect(response.body).toEqual({
      success: false,
      message: "Unable to generate recommendations.",
    });
  });
});