# Music Vault User/Profile Data Contract

## Purpose

This document defines the initial user/profile data structure for Music Vault during Sprint 1.

This contract is provisional and may be updated as the database, authentication, and Spotify integration are developed.

## User/Profile Fields

### userId

- Type: String
- Required: Yes
- Unique: Yes
- Purpose: Internal Music Vault identifier for a user.
- The userId should remain separate from the user's email address.

### email

- Type: String
- Required: Yes for native Music Vault accounts
- Unique: Yes
- Purpose: Stores the user's email address for their Music Vault profile.

### spotifyId

- Type: String or null
- Required: No
- Unique: Yes when present
- Purpose: Stores the user's Spotify account identifier when a Spotify account is linked.
- A user without a linked Spotify account will have a null spotifyId.

## Example Native Music Vault Profile

{
  "userId": "user_123",
  "email": "user@example.com",
  "spotifyId": null
}

## Example Spotify-Linked Profile

{
  "userId": "user_456",
  "email": "user@example.com",
  "spotifyId": "spotify_user_id"
}

## Validation Expectations

- userId must be present.
- email must be present for a native Music Vault profile.
- email should follow a valid email format.
- userId must uniquely identify a Music Vault profile.
- email should be unique.
- spotifyId is optional.
- If spotifyId is present, it should uniquely identify the linked Spotify account.

## Future Considerations

Additional fields may be added as requirements become clearer, such as:

- username
- displayName
- createdAt
- updatedAt

These fields are not required by the initial Sprint 1 contract.

## Team Coordination

This contract is based on the initial user/profile schema discussed with the database implementation work.

The schema may be revised as database persistence, authentication, and Spotify account linking are implemented.