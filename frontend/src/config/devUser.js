/**
 * Shared MusicVault development user configuration.
 *
 * Used by Song Selection and Recommendations until
 * authenticated user context is implemented.
 *
 * Development/testing only.
 */

const DEFAULT_DEV_USER_ID =
  "11111111-1111-4111-8111-111111111111";

export const DEV_USER_ID = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_USER_ID?.trim() ||
    DEFAULT_DEV_USER_ID
  : null;
