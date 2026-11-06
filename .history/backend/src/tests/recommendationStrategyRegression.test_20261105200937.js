
const ArtistSimilarityStrategy = require(
  "../services/strategies/ArtistSimilarityStrategy"
);

const GenreSimilarityStrategy = require(
  "../services/strategies/GenreSimilarityStrategy"
);

const AttributeSimilarityStrategy = require(
  "../services/strategies/AttributeSimilarityStrategy"
);

describe("Recommendation Strategy Regression", () => {
  const artistStrategy = new ArtistSimilarityStrategy();

  test("matching artist IDs contribute 40 points", () => {
    const preferred = { artistId: "artist-1" };
    const candidate = { artistId: "artist-1" };

    expect(
      artistStrategy.calculateScore(preferred, candidate)
    ).toBe(40);
  });

  test("different artist IDs contribute zero points", () => {
    const preferred = { artistId: "artist-1" };
    const candidate = { artistId: "artist-2" };

    expect(
      artistStrategy.calculateScore(preferred, candidate)
    ).toBe(0);
  });

  test.each([
    [null, "artist-1"],
    [undefined, "artist-1"],
    ["", "artist-1"],
    ["   ", "artist-1"],
    [123, "artist-1"],
    ["artist-1", null],
    ["artist-1", undefined],
    ["artist-1", ""],
  ])(
    "invalid artist IDs (%s, %s) contribute zero points",
    (preferredId, candidateId) => {
      expect(
        artistStrategy.calculateScore(
          { artistId: preferredId },
          { artistId: candidateId }
        )
      ).toBe(0);
    }
  );

  test("missing song objects do not crash artist scoring", () => {
    expect(
      artistStrategy.calculateScore(null, undefined)
    ).toBe(0);
  });

  
    describe("Genre Similarity Strategy", () => {
        const genreStrategy = new GenreSimilarityStrategy();

        test("one shared genre contributes 25 points", () => {
            const preferred = {
                genres: ["rock", "indie"],
            };

            const candidate = {
                genres: ["rock", "jazz"],
            };

            expect(
                genreStrategy.calculateScore(preferred, candidate)
            ).toBe(25);
        });

        test("two shared genres contribute 50 points", () => {
            const preferred = {
                genres: ["rock", "indie"],
        };

            const candidate = {
                genres: ["rock", "indie"],
            };

            expect(
                genreStrategy.calculateScore(preferred, candidate)
            ).toBe(50);
        });

        test("three or more shared genres are capped at 50 points", () => {
            const preferred = {
                genres: ["rock", "indie", "alternative", "pop"],
            };

            const candidate = {
                genres: ["rock", "indie", "alternative", "pop"],
            };

            expect(
                genreStrategy.calculateScore(preferred, candidate)
            ).toBe(50);
        });

        test("duplicate genre labels do not inflate the score", () => {
            const preferred = {
                genres: ["rock", "rock", "rock", "indie"],
            };

            const candidate = {
                genres: ["rock", "indie"],
            };

            expect(
                genreStrategy.calculateScore(preferred, candidate)
            ).toBe(50);
        });

        test("no shared genres contributes zero points", () => {
            const preferred = {
                genres: ["rock"],
            };

            const candidate = {
                genres: ["jazz"],
            };

            expect(
                genreStrategy.calculateScore(preferred, candidate)
            ).toBe(0);
        });

        test.each([
            [null, ["rock"]],
            [undefined, ["rock"]],
            ["rock", ["rock"]],
            [[], ["rock"]],
            [["rock"], null],
            [["rock"], undefined],
            [["rock"], "rock"],
        ]) (
            "invalid or missing genre data (%p, %p) contributes zero points",
            (preferredGenres, candidateGenres) => {
                expect(
                    genreStrategy.calculateScore(
                        { genres: preferredGenres },
                        { genres: candidateGenres }
                    )
                ).toBe(0);
            }
        );

        test("missing song objects do not crash genre scoring", () => {
            expect(
                genreStrategy.calculateScore(null, undefined)
            ).toBe(0);
        });
    });
});

