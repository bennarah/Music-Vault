SELECT
    usp.user_id,
    s.spotify_id,
    s.title,
    s.artist_name
FROM user_song_preferences usp
JOIN songs s ON usp.song_id = s.id
WHERE usp.user_id =
    '11111111-1111-4111-8111-111111111111';
