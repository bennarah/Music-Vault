
/**
 * MusicVault Sprint 4 recommendation performance baseline.
 *
 * Run from the backend directory:
 * BENCHMARK_USER_ID=YOUR-USER-UUID node scripts/benchmarkRecommendations.js
 *
 * Optional environment variables:
 * API_BASE_URL=http://127.0.0.1:5001
 * BENCHMARK_RUNS=10
 * BENCHMARK_WARMUPS=2
 * BENCHMARK_TIMEOUT_MS=15000
 * ALLOW_EMPTY_RESULTS=true
 *
 * Measures end-to-end HTTP response time.
 * Does not modify application code or database records.
 */

const fs = require("fs/promises");
const path = require("path");
const { performance } = require("perf_hooks");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

const API_BASE_URL = (
    process.env.API_BASE_URL || "http://127.0.0.1:5001"
).replace(/\/+$/, "");

const USER_ID = process.env.BENCHMARK_USER_ID;

const RUNS = Number.parseInt(
    process.env.BENCHMARK_RUNS || "10",
    10
);

const WARMUPS = Number.parseInt(
    process.env.BENCHMARK_WARMUPS || "2",
    10
);

const TIMEOUT_MS = Number.parseInt(
    process.env.BENCHMARK_TIMEOUT_MS || "15000",
    10
);

const ALLOW_EMPTY_RESULTS =
    process.env.ALLOW_EMPTY_RESULTS === "true";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


// --------------------------------------------------------
// Validate benchmark configuration.
// --------------------------------------------------------

function validateConfiguration() {
    if (!USER_ID || !UUID_PATTERN.test(USER_ID)) {
        throw new Error(
            "Set BENCHMARK_USER_ID to the UUID of an existing test user."
        );
    }

    if (!Number.isInteger(RUNS) || RUNS < 5) {
        throw new Error(
            "BENCHMARK_RUNS must be an integer of at least 5."
        );
    }

    if (!Number.isInteger(WARMUPS) || WARMUPS < 0) {
        throw new Error(
            "BENCHMARK_WARMUPS must be a non-negative integer."
        );
    }

    if (!Number.isInteger(TIMEOUT_MS) || TIMEOUT_MS < 1000) {
        throw new Error(
            "BENCHMARK_TIMEOUT_MS must be at least 1000."
        );
    }
}


// --------------------------------------------------------
// Calculate performance statistics.
// --------------------------------------------------------

function round(value) {
    return Number(value.toFixed(2));
}

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (
            sorted[middle - 1] + sorted[middle]
        ) / 2;
    }

    return sorted[middle];
}

function percentile(values, percentileValue) {
    const sorted = [...values].sort((a, b) => a - b);

    const index = Math.max(
        0,
        Math.ceil(percentileValue * sorted.length) - 1
    );

    return sorted[index];
}


// --------------------------------------------------------
// Make one recommendation API request.
// --------------------------------------------------------

async function requestRecommendations(requestNumber, phase) {
    const endpoint =
        `${API_BASE_URL}/api/recommendations/` +
        encodeURIComponent(USER_ID);

    const startedAt = performance.now();

    let response;

    try {
        response = await fetch(endpoint, {
            method: "GET",

            headers: {
                Accept: "application/json",
            },

            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        throw new Error(
            `${phase} request ${requestNumber} could not reach the API: ${error.message}`
        );
    }

    const elapsedMs = performance.now() - startedAt;

    let body;

    try {
        body = await response.json();
    } catch {
        throw new Error(
            `${phase} request ${requestNumber} returned non-JSON content (HTTP ${response.status}).`
        );
    }

    if (!response.ok || body.success !== true) {
        throw new Error(
            `${phase} request ${requestNumber} failed (HTTP ${response.status}): ` +
            `${body.message || "The API did not return success: true."}`
        );
    }

    if (!Array.isArray(body.recommendations)) {
        throw new Error(
            `${phase} request ${requestNumber} did not return a recommendations array.`
        );
    }

    if (
        body.recommendations.length === 0 &&
        !ALLOW_EMPTY_RESULTS
    ) {
        throw new Error(
            "The endpoint returned zero recommendations. " +
            "Use a test user with saved preferences and candidate songs. " +
            "To measure empty results intentionally, set ALLOW_EMPTY_RESULTS=true."
        );
    }

    return {
        request: requestNumber,
        phase,
        durationMs: round(elapsedMs),
        httpStatus: response.status,
        recommendationCount: body.recommendations.length,
    };
}


// --------------------------------------------------------
// Main benchmark execution.
// --------------------------------------------------------

async function main() {
    validateConfiguration();

    console.log(
        "MusicVault recommendation performance baseline"
    );

    console.log(
        `API: ${API_BASE_URL}/api/recommendations/[test-user-id]`
    );

    console.log(`Warm-up requests: ${WARMUPS}`);
    console.log(`Measured requests: ${RUNS}`);

    console.log(
        `Require non-empty recommendations: ${!ALLOW_EMPTY_RESULTS}`
    );

    console.log("");

    // Warm-up requests are excluded from statistics.

    for (let i = 1; i <= WARMUPS; i += 1) {
        const result = await requestRecommendations(
            i,
            "warm-up"
        );

        console.log(
            `Warm-up ${i}/${WARMUPS}: ${result.durationMs} ms ` +
            `(${result.recommendationCount} recommendations)`
        );
    }

    // Run measured requests.

    const measurements = [];

    for (let i = 1; i <= RUNS; i += 1) {
        const result = await requestRecommendations(
            i,
            "measured"
        );

        measurements.push(result);

        console.log(
            `Request ${i}/${RUNS}: ${result.durationMs} ms ` +
            `(${result.recommendationCount} recommendations)`
        );
    }

    // Calculate summary statistics.

    const durations = measurements.map(
        (item) => item.durationMs
    );

    const recommendationCounts = [
        ...new Set(
            measurements.map(
                (item) => item.recommendationCount
            )
        ),
    ];

    const summary = {
        measuredRequests: RUNS,
        warmupRequests: WARMUPS,

        averageMs: round(
            durations.reduce(
                (total, value) => total + value,
                0
            ) / durations.length
        ),

        medianMs: round(median(durations)),

        p95Ms: round(
            percentile(durations, 0.95)
        ),

        minimumMs: round(
            Math.min(...durations)
        ),

        maximumMs: round(
            Math.max(...durations)
        ),

        recommendationCountsObserved:
            recommendationCounts,

        allHttpResponsesSuccessful:
            measurements.every(
                (item) => item.httpStatus === 200
            ),
    };

    // Prepare evidence report.

    const report = {
        testName:
            "MusicVault recommendation API baseline",

        capturedAt: new Date().toISOString(),

        endpoint:
            "/api/recommendations/[test-user-id]",

        note:
            "End-to-end HTTP timings include network, Express, database, " +
            "candidate preparation, ranking, and response serialization. " +
            "They do not isolate individual database or algorithm timings.",

        configuration: {
            measuredRequests: RUNS,
            warmupRequests: WARMUPS,
            timeoutMs: TIMEOUT_MS,
            emptyResultsAllowed: ALLOW_EMPTY_RESULTS,
        },

        summary,

        measurements,
    };

    // Create output directory.

    const outputDirectory = path.resolve(
        __dirname,
        "../performance-results"
    );

    await fs.mkdir(outputDirectory, {
        recursive: true,
    });

    // Generate unique filenames.

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    const baseName =
        `recommendation-baseline-${timestamp}`;

    const jsonPath = path.join(
        outputDirectory,
        `${baseName}.json`
    );

    const csvPath = path.join(
        outputDirectory,
        `${baseName}.csv`
    );

    // Save JSON report.

    await fs.writeFile(
        jsonPath,
        `${JSON.stringify(report, null, 2)}\n`,
        "utf8"
    );

    // Save CSV report.

    const csvLines = [
        "request,duration_ms,http_status,recommendation_count",

        ...measurements.map((item) =>
            [
                item.request,
                item.durationMs,
                item.httpStatus,
                item.recommendationCount,
            ].join(",")
        ),
    ];

    await fs.writeFile(
        csvPath,
        `${csvLines.join("\n")}\n`,
        "utf8"
    );

    // Display final results.

    console.log("\nBaseline summary");

    console.table(summary);

    console.log(`JSON evidence: ${jsonPath}`);
    console.log(`CSV evidence:  ${csvPath}`);

    console.log(
        "\nRun this same script with the same dataset and environment " +
        "after optimization for a fair before/after comparison."
    );
}


// --------------------------------------------------------
// Start benchmark.
// --------------------------------------------------------

main().catch((error) => {
    console.error(
        `Baseline measurement failed: ${error.message}`
    );

    process.exitCode = 1;
});
