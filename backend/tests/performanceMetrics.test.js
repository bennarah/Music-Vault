
const {
    createPerformanceMetrics,
} = require("../src/utils/performanceMetrics");

describe("Performance metrics utility", () => {
    let originalSetting;

    beforeEach(() => {
        originalSetting = process.env.PERFORMANCE_METRICS;

        delete process.env.PERFORMANCE_METRICS;

        jest.spyOn(console, "info").mockImplementation(() => {});
    });

    afterEach(() => {
        if (originalSetting === undefined) {
            delete process.env.PERFORMANCE_METRICS;
        } else {
            process.env.PERFORMANCE_METRICS = originalSetting;
        }

        jest.restoreAllMocks();
    });

    test("does not log metrics when disabled", async () => {
        const metrics = createPerformanceMetrics(
            "test_operation"
        );

        await metrics.measure(
            "databaseQuery",
            async () => "result"
        );

        metrics.measureSync(
            "candidatePreparation",
            () => "prepared"
        );

        metrics.finish();

        expect(console.info).not.toHaveBeenCalled();
    });

    test("records timings and counts when enabled", async () => {
        process.env.PERFORMANCE_METRICS = "true";

        const metrics = createPerformanceMetrics(
            "recommendation_generation"
        );

        const result = await metrics.measure(
            "databaseQuery",
            async () => "database result"
        );

        expect(result).toBe("database result");

        metrics.measureSync(
            "candidatePreparation",
            () => [1, 2, 3]
        );

        metrics.incrementCount("databaseQueries", 2);
        metrics.setCount("candidateSongRows", 3);

        metrics.finish({
            outcome: "success",
            statusCode: 200,
        });

        // Calling finish twice must not create duplicate logs.
        metrics.finish();

        expect(console.info).toHaveBeenCalledTimes(1);

        const log = console.info.mock.calls[0];

        expect(log[0]).toBe(
            "[MusicVault Performance]"
        );

        const report = JSON.parse(log[1]);

        expect(report.operation).toBe(
            "recommendation_generation"
        );

        expect(report.outcome).toBe("success");
        expect(report.statusCode).toBe(200);

        expect(report.totalMs).toBeGreaterThanOrEqual(0);

        expect(report.stagesMs.databaseQuery)
            .toBeGreaterThanOrEqual(0);

        expect(report.stagesMs.candidatePreparation)
            .toBeGreaterThanOrEqual(0);

        expect(report.counts.databaseQueries).toBe(2);
        expect(report.counts.candidateSongRows).toBe(3);
    });

    test("records timing when an operation fails", async () => {
        process.env.PERFORMANCE_METRICS = "true";

        const metrics = createPerformanceMetrics(
            "recommendation_generation"
        );

        await expect(
            metrics.measure(
                "databaseQuery",
                async () => {
                    throw new Error("Simulated database failure");
                }
            )
        ).rejects.toThrow("Simulated database failure");

        metrics.finish({
            outcome: "error",
            statusCode: 500,
        });

        const report = JSON.parse(
            console.info.mock.calls[0][1]
        );

        expect(report.outcome).toBe("error");
        expect(report.statusCode).toBe(500);

        expect(report.stagesMs.databaseQuery)
            .toBeGreaterThanOrEqual(0);
    });
});
