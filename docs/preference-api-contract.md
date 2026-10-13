# Music Vault Preference API Contract

## Purpose

This document defines the implemented Music Vault Preference API contract for creating, retrieving, and removing user song preferences.

The Preference API is database-backed and provides the integration contract for future frontend preference functionality. Frontend preference implementation is currently backlog work.

## Preference Data Structure

A Music Vault preference represents a relationship between a Music Vault user and a song stored in the Music Vault database.

### Public Preference Fields

#### id

- Type: Number
- Returned by the API after a preference has been created.
- Identifies the stored preference record.
- Used by `DELETE /api/preferences/:id`.

#### userId

- Type: String
- Required: Yes
- Identifies the Music Vault user who owns the preference.

#### songId

- Type: String
- Required: Yes
- Represents the public Spotify song identifier.
- The backend resolves this value to the internal numeric `songs.id` before storing the preference.

#### title

- Type: String
- Required: Yes
- Represents the song title.

#### artist

- Type: String
- Required: Yes
- Represents the primary artist name.

#### genre

- Type: String or null
- Required: No
- Represents the song genre when available.
- If omitted during creation, the API returns `null`.

## Database Persistence

Preferences are stored in the `user_song_preferences` table.

The persistence layer stores:

- a numeric preference ID;
- the Music Vault `user_id`;
- the internal numeric `song_id`.

The database enforces a unique relationship between `user_id` and `song_id`, preventing the same user/song preference from being stored more than once.

The public API uses the Spotify/string `songId`. During preference creation, the backend uses `getSongBySpotifyId()` to resolve that identifier to the internal numeric `songs.id`, then persists the relationship using `createPreference()`.

Preference retrieval uses `getPreferencesByUser()`, which joins preference records with song metadata. The route maps the database result back into the public Preference API format.

Preference removal uses `deletePreferenceById()`.

## API Endpoints

### Create Preference

**Method:** POST

**Endpoint:** `/api/preferences`

### Request Body

```json
{
  "userId": "user_123",
  "songId": "spotify_track_123",
  "title": "Example Song",
  "artist": "Example Artist",
  "genre": "Alternative"
}
```

Required fields:

- `userId`
- `songId`
- `title`
- `artist`

Optional fields:

- `genre`

Required fields must contain valid, non-empty values.

### Successful Response

**HTTP Status:** `201 Created`

```json
{
  "success": true,
  "preference": {
    "id": 1,
    "userId": "user_123",
    "songId": "spotify_track_123",
    "title": "Example Song",
    "artist": "Example Artist",
    "genre": "Alternative"
  }
}
```

### Create Preference Errors

#### Invalid or Missing Required Field

**HTTP Status:** `400 Bad Request`

Example:

```json
{
  "success": false,
  "message": "Missing or invalid required field: songId"
}
```

#### Song Not Found

If the supplied public `songId` cannot be resolved to a song stored in Music Vault:

**HTTP Status:** `404 Not Found`

```json
{
  "success": false,
  "message": "Song not found."
}
```

#### User Not Found

If the supplied `userId` does not reference an existing Music Vault user:

**HTTP Status:** `404 Not Found`

```json
{
  "success": false,
  "message": "User not found."
}
```

#### Duplicate Preference

The database prevents duplicate user/song relationships.

**HTTP Status:** `409 Conflict`

```json
{
  "success": false,
  "message": "Preference already exists."
}
```

#### Database or Server Failure

**HTTP Status:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Unable to create preference."
}
```

---

### Retrieve User Preferences

**Method:** GET

**Endpoint:** `/api/preferences/:userId`

The endpoint retrieves all stored preferences associated with the specified Music Vault user.

Song metadata is retrieved through the database persistence layer and mapped into the public Preference API format.

### Successful Response

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "preferences": [
    {
      "id": 1,
      "userId": "user_123",
      "songId": "spotify_track_123",
      "title": "Example Song",
      "artist": "Example Artist",
      "genre": "Alternative"
    }
  ]
}
```

### No Saved Preferences

An empty preference list is a successful request.

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "preferences": []
}
```

### Retrieval Failure

**HTTP Status:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Unable to retrieve preferences."
}
```

---

### Remove Preference

**Method:** DELETE

**Endpoint:** `/api/preferences/:id`

Preference removal is implemented.

The `id` parameter is the numeric preference ID returned by the Preference API, not the Spotify song identifier.

### Successful Response

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "preference": {
    "id": 1
  }
}
```

After successful deletion, the removed preference will no longer be returned by the user's GET request.

### Preference Not Found

**HTTP Status:** `404 Not Found`

```json
{
  "success": false,
  "message": "Preference not found."
}
```

### Deletion Failure

**HTTP Status:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Unable to delete preference."
}
```

## Validation Rules

The implemented Preference API enforces the following creation rules:

- `userId` is required.
- `songId` is required.
- `title` is required.
- `artist` is required.
- `genre` is optional.
- Required fields cannot contain empty or whitespace-only values.
- The supplied song must already exist in the Music Vault songs table.
- The supplied user must exist in the Music Vault users table.
- A user cannot store the same song preference more than once.
- Invalid requests do not create preference records.

## HTTP Behavior Summary

| Operation | Condition | Status |
| --- | --- | --- |
| POST | Preference created | `201 Created` |
| POST | Missing/invalid required field | `400 Bad Request` |
| POST | Song not found | `404 Not Found` |
| POST | User not found | `404 Not Found` |
| POST | Duplicate preference | `409 Conflict` |
| POST | Database/server failure | `500 Internal Server Error` |
| GET | Preferences retrieved | `200 OK` |
| GET | No preferences exist | `200 OK` |
| GET | Database/server failure | `500 Internal Server Error` |
| DELETE | Preference removed | `200 OK` |
| DELETE | Preference not found | `404 Not Found` |
| DELETE | Database/server failure | `500 Internal Server Error` |

## Frontend Integration Handoff

Frontend preference implementation is currently backlog work.

A future frontend implementation should integrate with these endpoints:

- `POST /api/preferences`
- `GET /api/preferences/:userId`
- `DELETE /api/preferences/:id`

The frontend should:

- send all required fields when creating a preference;
- use the Spotify/string song identifier as `songId`;
- handle optional genre information;
- retain the returned preference `id` when deletion functionality is needed;
- treat an empty GET result as a valid state rather than an error;
- handle `400`, `404`, `409`, and `500` responses appropriately;
- display meaningful feedback when a duplicate preference is rejected.

Frontend work should use this contract rather than redefining the Preference API.

## Spotify and Song Integration

Songs must exist in the Music Vault songs table before they can be stored as user preferences.

The public Preference API accepts the Spotify song identifier. The backend translates this identifier to the internal Music Vault song ID before creating the database relationship.

Retrieved preferences expose song metadata from the database in the public API format.

## Automated Verification

The Preference API has automated database-backed tests covering:

- successful preference creation;
- optional genre behavior;
- missing required fields;
- whitespace-only required fields;
- user-specific preference retrieval;
- empty preference retrieval;
- successful preference deletion;
- deletion of a nonexistent preference;
- duplicate preference rejection.

The database-backed Preference API test suite has been successfully verified through the project's GitHub Actions CI environment.

## Team Coordination

The current active Music Vault team members are:

- Bassma Ennarah
- Adam Lenzini
- Jesse Dawson

Frontend preference implementation is backlog work and is not an active dependency for completion of the Preference API.

Future changes to required fields, identifiers, endpoint behavior, or persistence behavior should be documented in this contract so the frontend, backend, database, and recommendation functionality remain consistent.