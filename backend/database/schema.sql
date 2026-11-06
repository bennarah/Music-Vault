
-- ============================================================
-- MusicVault Database Schema
-- ============================================================
-- Local development: music_vault
-- CI environment: musicvault_test
--
-- Select the database before executing this script.
-- ============================================================


-- ============================================================
-- Users
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    spotify_id VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- Songs
-- ============================================================

CREATE TABLE IF NOT EXISTS songs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    spotify_id VARCHAR(100) NOT NULL UNIQUE,

    title VARCHAR(255) NOT NULL,

    artist_id VARCHAR(100) NULL,
    artist_name VARCHAR(255) NOT NULL,

    album_id VARCHAR(100) NULL,
    album_name VARCHAR(255) NULL,
    album_image_url TEXT NULL,

    genres JSON NULL,

    -- Spotify metadata may be unavailable.
    duration_ms INT NULL,

    explicit BOOLEAN NOT NULL DEFAULT FALSE,

    spotify_url TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- User Song Preferences
-- ============================================================

CREATE TABLE IF NOT EXISTS user_song_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id CHAR(36) NOT NULL,
    song_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_preference_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_preference_song
        FOREIGN KEY (song_id)
        REFERENCES songs(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_song_preference
        UNIQUE (user_id, song_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
