const {
    prepareCandidates,
} = require("../src/services/candidatePreparation");

const {
    candidateSongs,
} = require("./fixtures/candidateSongs");

describe("Candidate preparation", () => {

    test("removes duplicate Spotify IDs", () => {
        const result = prepareCandidates(candidateSongs);

        expect(result).toHaveLength(2);
    });

    test("removes already-selected songs", () => {
        const result = prepareCandidates(
            candidateSongs,
            ["song-001"]
        );

        expect(result).toHaveLength(1);
        expect(result[0].spotifyId).toBe("song-002");
    });

    test("handles an empty candidate list", () => {
        expect(prepareCandidates([])).toEqual([]);
    });

    test("rejects malformed candidate input", () => {
        expect(() => prepareCandidates(null)).toThrow(
            "Candidate tracks must be an array."
        );
    });

});