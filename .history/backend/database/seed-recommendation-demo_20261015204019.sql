START TRANSACTION;

-- Create a test user.
INSERT INTO users (user_id, email, spotify_id)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'sprint3-demo@example.com',
    NULL
);

-- Preferred song.
INSERT INTO songs (
    spotify_id, title, artist_id, artist_name,
    album_id, album_name, album_image_url,
    genres, duration_ms, explicit, spotify_url
)
VALUES (
    'demo-preferred-001',
    'Test Rock Song',
    'demo-artist-001',
    'Example Artist',
    NULL, NULL, NULL,
    JSON_ARRAY('rock'),
    200000, FALSE, NULL
);

-- Candidate 1: Same artist, similar duration.
INSERT INTO songs (
    spotify_id, title, artist_id, artist_name,
    album_id, album_name, album_image_url,
    genres, duration_ms, explicit, spotify_url
)
VALUES (
    'demo-candidate-001',
    'Another Rock Song',
    'demo-artist-001',
    'Example Artist',
    NULL, NULL, NULL,
    JSON_ARRAY('rock'),
    205000, FALSE, NULL
);

-- Candidate 2: Different artist, same genre.
INSERT INTO songs (
    spotify_id, title, artist_id, artist_name,
    album_id, album_name, album_image_url,
    genres, duration_ms, explicit, spotify_url
)
VALUES (
    'demo-candidate-002',
    'Rock Discovery',
    'demo-artist-002',
    'Another Artist',
    NULL, NULL, NULL,
    JSON_ARRAY('rock'),
    250000, FALSE, NULL
);
-- Candidate 3: No similarity.
INSERT INTO songs (
    spotify_id, title, artist_id, artist_name,
    album_id, album_name, album_image_url,
    genres, duration_ms, explicit, spotify_url
)
VALUES (
    'demo-candidate-003',
    'Unrelated Song',
    'demo-artist-003',
    'Different Artist',
    NULL, NULL, NULL,
    JSON_ARRAY('jazz'),
    400000, FALSE, NULL
);

-- Link the preferred song to the test user.
INSERT INTO user_song_preferences (user_id, song_id)
SELECT
    '11111111-1111-4111-8111-111111111111',
    id
FROM songs
WHERE spotify_id = 'demo-preferred-001';

COMMIT;
Step 3 — Verify the data was inserted
In MySQL, run:

SELECT spotify_id, title, artist_name, duration_ms
FROM songs
WHERE spotify_id LIKE 'demo-%';