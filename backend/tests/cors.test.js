const request = require("supertest");
const app = require("../src/app");

describe("Phase 1 - Backend CORS Configuration", () => {
  const endpoint = "/api/health";

  test("allows localhost:3000 frontend origin", async () => {
    const response = await request(app)
      .get(endpoint)
      .set("Origin", "http://localhost:3000");

    expect(response.status).toBe(200);
    expect(
      response.headers["access-control-allow-origin"]
    ).toBe("http://localhost:3000");
  });

  test("allows 127.0.0.1:3000 frontend origin", async () => {
    const response = await request(app)
      .get(endpoint)
      .set("Origin", "http://127.0.0.1:3000");

    expect(response.status).toBe(200);
    expect(
      response.headers["access-control-allow-origin"]
    ).toBe("http://127.0.0.1:3000");
  });

  test("does not authorize an unexpected origin", async () => {
    const response = await request(app)
      .get(endpoint)
      .set("Origin", "https://untrusted.example");

    expect(response.headers["access-control-allow-origin"])
      .toBeUndefined();
  });

  test("handles an OPTIONS preflight from the frontend", async () => {
    const response = await request(app)
      .options("/api/preferences")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "POST")
      .set(
        "Access-Control-Request-Headers",
        "content-type"
      );

    expect(response.status).toBe(204);
    expect(
      response.headers["access-control-allow-origin"]
    ).toBe("http://localhost:3000");

    expect(
      response.headers["access-control-allow-methods"]
    ).toContain("POST");
  });
});
