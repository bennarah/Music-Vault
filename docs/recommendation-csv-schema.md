# Music Vault Recommendation CSV Schema

**Jira Ticket:** SCRUM-107
**Sprint:** 5
**Developer:** Bassma Ennarah

## Purpose

Define a consistent CSV export format for Music Vault's ranked
recommendation results.

## Data Source

Endpoint: GET /api/recommendations/:userId

The API returns a JSON object containing a recommendations array.

Each recommendation contains:
- song: an object containing song metadata
- score: a numeric similarity score from 0 to 100

## CSV Column Definitions

| Column | Source Field | Description |
|---|---|---|
| title | song.title | Recommended song title |
| artist | song.artistName | Artist name |
| genre | song.genres | Semicolon-separated genres |
| album | song.albumName | Album name |
| duration_ms | song.durationMs | Duration in milliseconds |
| similarity_score | score | Similarity score from 0 to 100 |
| spotify_id | song.spotifyId | Spotify track identifier |
| spotify_url | song.spotifyUrl | Spotify track URL |

## Required Column Order

title,artist,genre,album,duration_ms,similarity_score,spotify_id,spotify_url

## CSV Formatting Rules

1. Include a consistent header row.
2. Include one data row per recommendation.
3. Preserve the existing recommendation ranking order.
4. Join multiple genres using semicolons.
5. Represent missing optional metadata with empty cells.
6. Represent missing or invalid numeric values with empty cells.
7. Escape commas, quotation marks, and newlines correctly.
8. Do not modify the original recommendation objects.
9. For zero recommendations, generate a header-only CSV.

## Example Output

```csv
title,artist,genre,album,duration_ms,similarity_score,spotify_id,spotify_url
Example Song,Example Artist,rock; alternative rock,Example Album,210000,75,abc123,
```

## Testing Requirements

Automated testing will verify:

- Correct column headers and ordering.
- Correct number of exported recommendation rows.
- Proper handling of commas, quotes, and newlines.
- Empty recommendation results.
- Missing or invalid metadata.
- Correct similarity score representation.
- Preservation of recommendation ranking order.

## Related Jira Tickets

- SCRUM-108: Implement CSV generation.
- SCRUM-111: Handle CSV special characters and missing fields.
- SCRUM-116: Implement CSV download endpoint.
- SCRUM-239: Automated CSV export and aggregation tests.
