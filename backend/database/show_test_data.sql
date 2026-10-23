USE music_vault;

SHOW TABLES;

SELECT
    spotify_id,
    title,
    artist_name,
    duration_ms
FROM songs
WHERE spotify_id LIKE 'demo-%';
