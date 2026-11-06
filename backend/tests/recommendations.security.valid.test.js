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

const {
  getAllSongs,
} = require("../src/models/songModel");

const app = require("../src/app");

describe("R1 SOC 2 - Valid UUID Processing", () => {
  const userId = "123e4567-e89b-42d3-a456-426614174000";

  beforeEach(() => {
    jest.clearAllMocks();
    getPreferencesByUser.mockResolvedValue([]);
  });

  test("accepts a valid UUID and processes an empty preference list", async () => {
    const response = await request(app)
      .get(`/api/recommendations/${userId}`)
      .expect(200);

    expect(getPreferencesByUser).toHaveBeenCalledWith(userId);
    expect(getPreferencesByUser).toHaveBeenCalledTimes(1);

    expect(response.body).toEqual({
      success: true,
      recommendations: [],
    });

    expect(getAllSongs).not.toHaveBeenCalled();
  });
});
