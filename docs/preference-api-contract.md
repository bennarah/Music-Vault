# Music Vault Preference API Contract

## Purpose

This document defines the Sprint 2 API contract for storing, retrieving, and removing user song preferences in Music Vault.

The contract is intended to provide a consistent interface between the frontend, backend, persistence layer, and Spotify-normalized song data.

## Preference Data Structure

A Music Vault preference represents a song that a user has selected as part of their music preferences.

### Fields

#### userId

- Type: String
- Required: Yes
- Purpose: Identifies the Music Vault user who owns the preference.
- This field follows the existing Music Vault user/profile contract, where userId is the application's internal user identifier.

#### songId

- Type: String
- Required: Yes
- Purpose: Uniquely identifies the selected song.
- This may correspond to a Spotify track identifier or another shared Music Vault song identifier.

#### title

- Type: String
- Required: Yes
- Purpose: Stores the song title.

#### artist

- Type: String
- Required: Yes
- Purpose: Stores the primary artist name for the song.

#### genre

- Type: String or null
- Required: No
- Purpose: Stores the song genre when available.
- Genre is optional because normalized Spotify data may not always provide genre information directly for every song.

## Example Preference Object

```json
{
  "userId": "user_123",
  "songId": "spotify_track_123",
  "title": "Example Song",
  "artist": "Example Artist",
  "genre": "Alternative"
}
```

## API Endpoints

### Create Preference

**Method:** POST

**Endpoint:** `/api/preferences`

**Request Body:**

```json
{
  "userId": "user_123",
  "songId": "spotify_track_123",
  "title": "Example Song",
  "artist": "Example Artist",
  "genre": "Alternative"
}
```

**Expected Behavior:**

- Validate all required fields.
- Verify that the preference can be associated with a Music Vault user.
- Prevent or appropriately handle duplicate song preferences for the same user.
- Store the preference using the persistence layer.
- Return the created preference in the response.

**Successful Response Example:**

```json
{
  "success": true,
  "preference": {
    "userId": "user_123",
    "songId": "spotify_track_123",
    "title": "Example Song",
    "artist": "Example Artist",
    "genre": "Alternative"
  }
}
```

### Retrieve User Preferences

**Method:** GET

**Endpoint:** `/api/preferences/:userId`

**Expected Behavior:**

- Retrieve all saved preferences associated with the specified `userId`.
- Return the preferences as structured JSON.
- Return an empty preference list when the user has no saved preferences.

**Successful Response Example:**

```json
{
  "success": true,
  "preferences": [
    {
      "userId": "user_123",
      "songId": "spotify_track_123",
      "title": "Example Song",
      "artist": "Example Artist",
      "genre": "Alternative"
    }
  ]
}
```

**Empty Preference Response Example:**

```json
{
  "success": true,
  "preferences": []
}
```

### Remove Preference

**Method:** DELETE

**Endpoint:** `/api/preferences/:id`

**Sprint 2 Scope Note:**

Preference removal will be implemented if it remains within Sprint 2 scope after required creation and retrieval functionality is complete.

**Expected Behavior:**

- Remove the requested preference if it exists.
- Return an appropriate response if the preference does not exist.
- Ensure removed preferences are no longer returned when retrieving user preferences.

## Validation Rules

The Preference API should enforce the following rules:

- `userId` is required.
- `songId` is required.
- `title` is required.
- `artist` is required.
- `genre` is optional.
- Required string fields should not be empty.
- Duplicate preferences for the same user and song should be prevented or handled consistently.
- Invalid requests should not create preference records.

## Error Response Format

Preference API errors should use a consistent JSON structure.

Example:

```json
{
  "success": false,
  "message": "Missing required field: songId"
}
```

Potential error cases include:

- missing required fields;
- invalid user identifier;
- duplicate preference;
- preference not found;
- persistence/database failure;
- unexpected server error.

The exact HTTP status codes will be finalized during endpoint implementation and testing.

## Integration Notes

### User/Profile Integration

The Preference API uses the existing Music Vault `userId` field defined in the Sprint 1 user/profile data contract.

### Database Integration

Adam's Sprint 2 persistence work will determine how the Preference API maps the application-level `userId` and song data to database records.

If the production persistence layer is unavailable, the API may temporarily use an in-memory or mock repository so endpoint development and testing can continue.

### Frontend Integration

The frontend should send preference data using this contract.

Cynthia is currently unavailable, so Sprint 2 backend work should not be blocked by frontend implementation. The Preference API can be developed and tested independently until frontend integration is available.

### Spotify Integration

Jesse's normalized Spotify song data should be mapped into the fields defined in this contract.

At minimum, normalized song data used by the Preference API should provide:

- `songId`
- `title`
- `artist`

`genre` may be included when available.

## Future Considerations

The preference contract may be extended in later sprints if additional metadata is needed, such as:

- `album`
- `popularity`
- `mood`
- `tempo`
- `createdAt`
- `updatedAt`

These fields are not required for the Sprint 2 Preference API MVP.

## Team Coordination

This contract should be reviewed with Adam and Jesse before the Sprint 2 implementation is considered finalized.

Any changes to required fields or identifier conventions should be documented here so frontend, backend, database, and recommendation functionality remain consistent.
