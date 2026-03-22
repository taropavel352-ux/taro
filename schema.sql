-- =====================================================
-- Taro Mystic - Cloudflare D1 Schema
-- =====================================================

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    birthdate TEXT NOT NULL,
    birthtime TEXT,
    phone TEXT,
    horoscope_sign TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    streak_days INTEGER DEFAULT 0,
    last_visit TEXT,
    reminder_enabled INTEGER DEFAULT 0,
    reminder_time TEXT DEFAULT '09:00'
);

-- Аналитика событий
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    event_type TEXT NOT NULL,
    event_data TEXT,
    card_id TEXT,
    spread_type TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Коллекция карт
CREATE TABLE IF NOT EXISTS collection (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    card_name TEXT,
    card_suit TEXT,
    flipped_count INTEGER DEFAULT 1,
    first_seen TEXT DEFAULT CURRENT_TIMESTAMP,
    last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, card_id)
);

-- Достижения
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    achievement_name TEXT,
    unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- История раскладов
CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    spread_type TEXT NOT NULL,
    cards TEXT NOT NULL,
    interpretation TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Админы
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_collection_user ON collection(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_user ON readings(user_id);

-- Счётчики аналитики (день)
CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    unique_users INTEGER DEFAULT 0,
    total_readings INTEGER DEFAULT 0,
    total_flips INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем админа по умолчанию
INSERT OR IGNORE INTO admins (username, password_hash) VALUES ('admin100710', 'pavel100710123');
