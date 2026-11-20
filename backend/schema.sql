PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  gems INTEGER NOT NULL DEFAULT 0 CHECK (gems >= 0),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  best_streak INTEGER NOT NULL DEFAULT 0 CHECK (best_streak >= 0),
  last_study_date TEXT,
  completed_lessons_json TEXT NOT NULL DEFAULT '[]',
  reviewed_lessons_json TEXT NOT NULL DEFAULT '[]',
  day_key TEXT NOT NULL,
  today_xp INTEGER NOT NULL DEFAULT 0 CHECK (today_xp >= 0),
  today_lessons INTEGER NOT NULL DEFAULT 0 CHECK (today_lessons >= 0),
  today_perfect INTEGER NOT NULL DEFAULT 0 CHECK (today_perfect >= 0),
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiration ON auth_sessions(expires_at);
