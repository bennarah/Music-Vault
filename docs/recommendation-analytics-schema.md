# Music Vault Recommendation Analytics Schema

**Jira Ticket:** SCRUM-118
**Sprint:** 5
**Developer:** Bassma Ennarah

## Purpose

Define a consistent, chart-ready analytics aggregation format for
Music Vault's ranked recommendation results.

This schema establishes the field names, data types, calculation rules,
and missing-data behavior used by the analytics service.

## Data Source

Source: GET /api/recommendations/:userId

The recommendation API returns a JSON object containing a
recommendations array.

Each recommendation contains:
- song: an object containing normalized song metadata
- score: a numeric recommendation similarity score

Analytics generator:
backend/src/services/analyticsService.js

Function:
generateRecommendationAnalytics(recommendations)

The analytics generator produces a separate aggregated JSON object.
A dedicated HTTP analytics endpoint is not defined by this schema.

## Analytics Response Structure

| Field | Data Type | Description |
|---|---|---|
| success | boolean | Indicates successful aggregation |
| summary | object | Overall recommendation counts |
| artistFrequency | array | Artist frequency statistics |
| genreDistribution | object | Genre counts and metadata coverage |
| explicitDistribution | object | Explicit-content distribution |
| durationStatistics | object | Song duration statistics |
| albumFrequency | array | Album frequency statistics |
| scoreStatistics | object | Recommendation similarity statistics |
| metadataCoverage | object | Availability of selected song metadata |

## Summary Fields

| Field | Data Type | Description |
|---|---|---|
| totalRecommendations | number | Valid recommendation entries |
| uniqueArtists | number | Number of artist groups |
| uniqueGenres | number | Number of unique normalized genres |

## Artist Frequency

Each artistFrequency entry contains:
- artistId: Spotify artist ID or null
- artistName: Artist display name
- count: Number of recommendations associated with the artist
- percentage: Percentage of recommendations with valid artist metadata

Artists are grouped by Spotify artist ID when available.
Otherwise, normalized lowercase artist names are used for grouping.

Results are sorted by descending count.
Artists with equal counts are sorted alphabetically by artist name,
ignoring capitalization, to ensure deterministic output.

## Genre Distribution

genreDistribution contains:
- songsWithGenres: Number of recommendations with genre metadata
- songsWithoutGenres: Number of recommendations without genre metadata
- genres: Array of genre statistics

Each genre entry contains:
- genre: Normalized lowercase genre name
- count: Number of songs assigned to that genre
- percentage: Percentage of total genre assignments

Duplicate genre values within a single song count only once.

Because a song may contain multiple genres, genre percentages use
the total number of genre assignments as their denominator.

Results are sorted by descending count.
Genres with equal counts are sorted alphabetically by normalized
genre name to ensure deterministic output.

## Explicit-Content Distribution

explicitDistribution contains:
- explicit: Object containing count and percentage
- nonExplicit: Object containing count and percentage
- unknown: Number of songs without recognized explicit metadata
- knownTotal: Total songs with recognized explicit metadata

Percentages are calculated using knownTotal.

Unknown values are excluded from the percentage denominator.

## Duration Statistics

durationStatistics contains:
- count: Number of valid duration values
- averageDurationMs: Average duration in milliseconds
- minimumDurationMs: Minimum duration in milliseconds
- maximumDurationMs: Maximum duration in milliseconds

Only finite, nonnegative numeric durations are included.

The average duration is rounded to the nearest millisecond.

## Album Frequency

Each albumFrequency entry contains:
- albumName: Album name
- count: Number of recommendations associated with the album
- percentage: Percentage of recommendations with valid album metadata

Missing album names are excluded.

Results are sorted by descending count.

## Recommendation Score Statistics

scoreStatistics contains:
- count: Number of valid numeric scores
- averageScore: Average recommendation similarity score
- minimumScore: Minimum similarity score
- maximumScore: Maximum similarity score

Only finite numeric scores are included.

The average score is rounded to two decimal places.

## Metadata Coverage

metadataCoverage contains:
- totalRecommendations: Number of valid recommendation entries
- artistNamesAvailable: Entries with nonempty artist names
- genreMetadataAvailable: Entries with at least one valid genre
- durationMetadataAvailable: Entries with valid nonnegative durations

## Aggregation Rules

1. Accept an array of recommendation objects.
2. Reject non-array input with a clear error.
3. Ignore malformed recommendation entries.
4. Preserve the established analytics response field names.
5. Calculate percentages to two decimal places.
6. Normalize genre names to lowercase.
7. Avoid duplicate genre assignments within individual songs.
8. Sort frequency results by descending count.
9. Exclude missing or invalid metadata from relevant calculations.
10. Do not modify the original recommendation objects.

## Empty Recommendation Behavior

For an empty recommendation array:

- success remains true.
- Summary counts are zero.
- Frequency arrays are empty.
- Genre metadata counts are zero.
- Explicit-content counts are zero.
- Duration and score counts are zero.
- Average, minimum, and maximum statistics are null.
- Metadata coverage counts are zero.

## Example Analytics Output

The following example illustrates the expected response structure
for an empty recommendation array.

```json
{
  "success": true,
  "summary": {
    "totalRecommendations": 0,
    "uniqueArtists": 0,
    "uniqueGenres": 0
  },
  "artistFrequency": [],
  "genreDistribution": {
    "songsWithGenres": 0,
    "songsWithoutGenres": 0,
    "genres": []
  },
  "explicitDistribution": {
    "explicit": {
      "count": 0,
      "percentage": 0
    },
    "nonExplicit": {
      "count": 0,
      "percentage": 0
    },
    "unknown": 0,
    "knownTotal": 0
  },
  "durationStatistics": {
    "count": 0,
    "averageDurationMs": null,
    "minimumDurationMs": null,
    "maximumDurationMs": null
  },
  "albumFrequency": [],
  "scoreStatistics": {
    "count": 0,
    "averageScore": null,
    "minimumScore": null,
    "maximumScore": null
  },
  "metadataCoverage": {
    "totalRecommendations": 0,
    "artistNamesAvailable": 0,
    "genreMetadataAvailable": 0,
    "durationMetadataAvailable": 0
  }
}
```

## Testing Requirements

Automated testing will verify:

- Required top-level response fields.
- Correct summary counts.
- Artist and genre aggregation structures.
- Percentage calculations and rounding.
- Missing metadata handling.
- Empty recommendation behavior.
- Invalid input handling.
- Preservation of the established response contract.

## Related Jira Tickets

- SCRUM-121: Implement Genre Distribution Aggregation.
- SCRUM-124: Implement Artist Frequency Aggregation.
- SCRUM-127: Implement Additional Attribute Aggregation.
- SCRUM-130: Test CSV and Analytics Logic.
- SCRUM-131: Coordinate Analytics Interface Integration.
