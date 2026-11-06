
const { performance } = require("perf_hooks");

/**
 * Creates an opt-in performance recorder.
 *
 * Enable using:
 * PERFORMANCE_METRICS=true
 *
 * This utility never records user IDs, credentials,
 * Spotify tokens, or song titles.
 */
function createPerformanceMetrics(operation) {
    const enabled =
        process.env.PERFORMANCE_METRICS === "true";

    const startedAt = performance.now();

    const stagesMs = {};
    const counts = {};

    let finished = false;

    function round(value) {
        return Number(value.toFixed(3));
    }

    /**
     * Measures an asynchronous operation.
     */
    async function measure(name, callback) {
        const started = performance.now();

        try {
            return await callback();
        } finally {
            if (enabled) {
                stagesMs[name] = round(
                    performance.now() - started
                );
            }
        }
    }

    /**
     * Measures a synchronous operation.
     */
    function measureSync(name, callback) {
        const started = performance.now();

        try {
            return callback();
        } finally {
            if (enabled) {
                stagesMs[name] = round(
                    performance.now() - started
                );
            }
        }
    }

    /**
     * Adds a numeric count to the report.
     */
    function incrementCount(name, amount = 1) {
        if (!enabled) return;

        counts[name] = (counts[name] || 0) + amount;
    }

    /**
     * Sets a count or other numeric measurement.
     */
    function setCount(name, value) {
        if (!enabled) return;

        counts[name] = value;
    }

    /**
     * Outputs the completed performance report.
     */
    function finish({
        outcome = "success",
        statusCode = 200,
    } = {}) {
        if (!enabled || finished) return;

        finished = true;

        const report = {
            event: "performance_metrics",
            operation,
            outcome,
            statusCode,

            totalMs: round(
                performance.now() - startedAt
            ),

            stagesMs,
            counts,

            timestamp: new Date().toISOString(),
        };

        console.info(
            "[MusicVault Performance]",
            JSON.stringify(report)
        );
    }

    return {
        measure,
        measureSync,
        incrementCount,
        setCount,
        finish,
    };
}

module.exports = {
    createPerformanceMetrics,
};
