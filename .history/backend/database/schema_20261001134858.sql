USE music_vault;

CREATE TABLE IF NOT EXISTS users (
  user_id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  spotify_id VARCHAR(100) NULL
);

CREATE TABLE songs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  spotify_id VARCHAR(100) NOT NULL UNIQUE,

  title VARCHAR(255) NOT NULL,

  artist_id VARCHAR(100) NULL,
  artist_name VARCHAR(255) NOT NULL,

  album_id VARCHAR(100) NULL,
  album_name VARCHAR(255) NULL,
  album_image_url TEXT NULL,

  genre VARCHAR(100) NULL,

  duration_ms INT NOT NULL,
  explicit BOOLEAN NOT NULL DEFAULT FALSE,

  spotify_url TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_song_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id CHAR(36) NOT NULL,
  song_id INT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

  FOREIGN KEY (song_id)
    REFERENCES songs(id)
    ON DELETE CASCADE,

  UNIQUE (user_id, song_id)
);