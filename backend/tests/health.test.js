const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
    test("returns a successful health response", async () => {
        const response = await request(app)
            .get("/api/health")
            .expect(200);

        expect(response.body).toEqual({
            status: "ok",
            service: "music-vault-api",
        });
    });
});