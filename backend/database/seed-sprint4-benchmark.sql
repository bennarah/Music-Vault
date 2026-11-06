
-- ============================================================
-- MusicVault Sprint 4 Performance Benchmark Dataset
-- ============================================================
-- LOCAL DEVELOPMENT DATABASE ONLY.
--
-- Creates:
--   1 benchmark user
--   1 preferred song
--   3 candidate songs
--   1 user-song preference
--
-- Safe to rerun against the dedicated local benchmark user.
-- ============================================================

START TRANSACTION;

SET @benchmark_user =
    '11111111-1111-4111-8111-111111111111';


-- ============================================================
-- 1. Create benchmark user
-- ============================================================

INSERT INTO users (
    user_id,
    email,
    spotify_id
)
VALUES (
    @benchmark_user,
    'sprint4-benchmark@musicvault.local',
    NULL
)
ON DUPLICATE KEY UPDATE
    email = VALUES(email);


-- ============================================================
-- 2. Insert preferred song and candidates
-- ============================================================

INSERT INTO songs (
    spotify_id,
    title,
    artist_id,
    artist_name,
    album_id,
    album_name,
    album_image_url,
    genres,
    duration_ms,
    explicit,
    spotify_url
)
VALUES

-- User's preferred song
(
    'benchmark-preferred-001',
    'Test Rock Song',
    'benchmark-artist-001',
    'Example Artist',
    NULL,
    NULL,
    NULL,
    JSON_ARRAY('rock'),
    200000,
    FALSE,
    NULL
),

-- Candidate 1: Same artist, same genre, similar duration
(
    'benchmark-candidate-001',
    'Another Rock Song',
    'benchmark-artist-001',
    'Example Artist',
    NULL,
    NULL,
    NULL,
    JSON_ARRAY('rock'),
    205000,
    FALSE,
    NULL
),

-- Candidate 2: Different artist, same genre
(
    'benchmark-candidate-002',
    'Rock Discovery',
    'benchmark-artist-002',
    'Another Artist',
    NULL,
    NULL,
    NULL,
    JSON_ARRAY('rock'),
    250000,
    FALSE,
    NULL
),

-- Candidate 3: Unrelated song
(
    'benchmark-candidate-003',
    'Unrelated Song',
    'benchmark-artist-003',
    'Different Artist',
    NULL,
    NULL,
    NULL,
    JSON_ARRAY('jazz'),
    400000,
    FALSE,
    NULL
)

ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    artist_id = VALUES(artist_id),
    artist_name = VALUES(artist_name),
    genres = VALUES(genres),
    duration_ms = VALUES(duration_ms),
    explicit = VALUES(explicit);


-- ============================================================
-- 3. Reset preferences for this dedicated benchmark user
-- ============================================================

DELETE FROM user_song_preferences
WHERE user_id = @benchmark_user;


-- ============================================================
-- 4. Link the preferred song to the benchmark user
-- ============================================================

INSERT INTO user_song_preferences (
    user_id,
    song_id
)
SELECT
    @benchmark_user,
    id
FROM songs
WHERE spotify_id = 'benchmark-preferred-001';


COMMIT;


-- ============================================================
-- 5. Verify inserted data
-- ============================================================

SELECT
    user_id,
    email
FROM users
WHERE user_id = @benchmark_user;


SELECT
    spotify_id,
    title,
    artist_name,
    duration_ms,
    genres
FROM songs
WHERE spotify_id LIKE 'benchmark-%';


SELECT
    u.user_id,
    s.spotify_id,
    s.title
FROM user_song_preferences usp
JOIN users u
    ON usp.user_id = u.user_id
JOIN songs s
    ON usp.song_id = s.id
WHERE u.user_id = @benchmark_user;
