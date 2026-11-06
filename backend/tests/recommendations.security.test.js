const request = require("supertest");
const app = require("../src/app");

describe("R1 SOC 2 - Recommendation API Input Validation", () => {
  const invalidIds = [
    ["invalid UUID characters", "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz"],
    ["incorrect UUID segment lengths", "123e4567-e89b-42d3-a456-12345"],
    ["UUID with extra characters", "123e4567-e89b-42d3-a456-426614174000extra"],
    ["UUID with unexpected symbols", "123e4567-e89b-42d3-a456-42661417400!"],
  ];

  test.each(invalidIds)(
    "rejects %s with HTTP 400",
    async (_, userId) => {
      const response = await request(app)
        .get(`/api/recommendations/${userId}`)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "A valid userId is required.",
      });
    }
  );

  test("does not expose internal details in validation errors", async () => {
    const response = await request(app)
      .get("/api/recommendations/invalid-user-id")
      .expect(400);

    const responseText = JSON.stringify(response.body);

    expect(responseText).not.toMatch(
      /stack|trace|sql|password|secret|internal server/i
    );

    expect(response.body).toEqual({
      success: false,
      message: "A valid userId is required.",
    });
  });
});
