
const {
    calculateArtistFrequency,
    calculateGenreDistribution,
    calculateExplicitDistribution,
    calculateDurationStatistics,
    calculateAlbumFrequency,
    calculateScoreStatistics,
    generateRecommendationAnalytics,
} = require("../src/services/analyticsService");


describe("MusicVault Analytics Service", () => {
    const recommendations = [
        {
            song: {
                spotifyId: "song-001",
                title: "Rock Song",
                artistId: "artist-001",
                artistName: "Artist One",
                genres: ["rock", "indie"],
                albumName: "Album One",
                durationMs: 200000,
                explicit: false,
            },
            score: 75,
        },
        {
            song: {
                spotifyId: "song-002",
                title: "Another Rock Song",
                artistId: "artist-001",
                artistName: "Artist One",
                genres: ["rock"],
                albumName: "Album One",
                durationMs: 220000,
                explicit: true,
            },
            score: 90,
        },
        {
            song: {
                spotifyId: "song-003",
                title: "Pop Song",
                artistId: "artist-002",
                artistName: "Artist Two",
                genres: ["pop"],
                albumName: "Album Two",
                durationMs: 180000,
                explicit: false,
            },
            score: 60,
        },
    ];


    test("calculates artist frequency correctly", () => {
        const result =
            calculateArtistFrequency(recommendations);

        expect(result).toHaveLength(2);

        expect(result[0]).toEqual({
            artistId: "artist-001",
            artistName: "Artist One",
            count: 2,
            percentage: 66.67,
        });

        expect(result[1].artistName).toBe("Artist Two");
        expect(result[1].count).toBe(1);
    });


    test("groups artists by name when artist IDs are missing", () => {
        const result = calculateArtistFrequency([
            {
                song: {
                    artistName: "Unknown Artist",
                },
            },
            {
                song: {
                    artistName: "unknown artist",
                },
            },
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].count).toBe(2);
    });


    test("calculates genre distribution correctly", () => {
        const result =
            calculateGenreDistribution(recommendations);

        expect(result.songsWithGenres).toBe(3);
        expect(result.songsWithoutGenres).toBe(0);

        expect(result.genres).toHaveLength(3);

        expect(result.genres[0]).toEqual({
            genre: "rock",
            count: 2,
            percentage: 50,
        });
    });


    test("does not count duplicate genres twice for one song", () => {
        const result = calculateGenreDistribution([
            {
                song: {
                    genres: ["rock", "rock", "indie"],
                },
            },
        ]);

        expect(result.genres).toHaveLength(2);

        expect(
            result.genres.find(item => item.genre === "rock").count
        ).toBe(1);
    });


    test("reports missing genre metadata", () => {
        const result = calculateGenreDistribution([
            {
                song: {
                    genres: [],
                },
            },
            {
                song: {
                    genres: ["rock"],
                },
            },
            {
                song: {
                    genres: null,
                },
            },
        ]);

        expect(result.songsWithGenres).toBe(1);
        expect(result.songsWithoutGenres).toBe(2);
    });


    test("calculates explicit-content distribution", () => {
        const result =
            calculateExplicitDistribution(recommendations);

        expect(result.explicit.count).toBe(1);
        expect(result.explicit.percentage).toBe(33.33);

        expect(result.nonExplicit.count).toBe(2);
        expect(result.nonExplicit.percentage).toBe(66.67);
    });


    test("handles unknown explicit metadata", () => {
        const result = calculateExplicitDistribution([
            {
                song: {
                    explicit: null,
                },
            },
            {
                song: {
                    explicit: true,
                },
            },
        ]);

        expect(result.unknown).toBe(1);
        expect(result.knownTotal).toBe(1);
    });


    test("calculates song duration statistics", () => {
        const result =
            calculateDurationStatistics(recommendations);

        expect(result).toEqual({
            count: 3,
            averageDurationMs: 200000,
            minimumDurationMs: 180000,
            maximumDurationMs: 220000,
        });
    });


    test("ignores invalid song durations", () => {
        const result = calculateDurationStatistics([
            {
                song: {
                    durationMs: 200000,
                },
            },
            {
                song: {
                    durationMs: null,
                },
            },
            {
                song: {
                    durationMs: -100,
                },
            },
            {
                song: {
                    durationMs: Infinity,
                },
            },
        ]);

        expect(result.count).toBe(1);
        expect(result.averageDurationMs).toBe(200000);
    });


    test("calculates album frequency", () => {
        const result =
            calculateAlbumFrequency(recommendations);

        expect(result).toHaveLength(2);

        expect(result[0]).toEqual({
            albumName: "Album One",
            count: 2,
            percentage: 66.67,
        });
    });


    test("calculates recommendation score statistics", () => {
        const result =
            calculateScoreStatistics(recommendations);

        expect(result).toEqual({
            count: 3,
            averageScore: 75,
            minimumScore: 60,
            maximumScore: 90,
        });
    });


    test("handles an empty recommendation list", () => {
        const result =
            generateRecommendationAnalytics([]);

        expect(result.success).toBe(true);

        expect(result.summary.totalRecommendations).toBe(0);
        expect(result.summary.uniqueArtists).toBe(0);
        expect(result.summary.uniqueGenres).toBe(0);

        expect(result.artistFrequency).toEqual([]);
        expect(result.genreDistribution.genres).toEqual([]);

        expect(result.durationStatistics.averageDurationMs)
            .toBeNull();

        expect(result.scoreStatistics.averageScore)
            .toBeNull();
    });


    test("handles malformed recommendation input", () => {
        expect(() =>
            generateRecommendationAnalytics(null)
        ).toThrow("Recommendations must be an array.");
    });


    test("ignores malformed recommendation entries", () => {
        const result = generateRecommendationAnalytics([
            null,
            undefined,
            {},
            {
                song: null,
            },
            {
                song: {
                    artistName: "Valid Artist",
                    genres: [],
                },
                score: 50,
            },
        ]);

        expect(result.summary.totalRecommendations).toBe(1);
        expect(result.summary.uniqueArtists).toBe(1);
    });


    test("generates complete analytics output", () => {
        const result =
            generateRecommendationAnalytics(recommendations);

        expect(result.success).toBe(true);

        expect(result.summary).toEqual({
            totalRecommendations: 3,
            uniqueArtists: 2,
            uniqueGenres: 3,
        });

        expect(result.metadataCoverage).toEqual({
            totalRecommendations: 3,
            artistNamesAvailable: 3,
            genreMetadataAvailable: 3,
            durationMetadataAvailable: 3,
        });
    });
});
