-- MusicVault Database Schema
--
-- This file defines the tables required by the MusicVault backend.
-- The database itself is selected by the environment running this script.
--
-- Local development may use: music_vault
-- CI may use: musicvault_test


-- ============================================================
-- Users
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    spotify_id VARCHAR(100) NULL
);


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

    duration_ms INT NOT NULL,

    explicit BOOLEAN NOT NULL DEFAULT FALSE,

    spotify_url TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


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
);