-- ════════════════════════════════════════════════
-- Sociolog-bg - Database Schema
-- ════════════════════════════════════════════════

-- Разширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Проучвания ───────────────────────────────────────────
CREATE TABLE surveys (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    -- Уникален salt за всяко проучване.
    -- Използва се при хеширане: SHA256(google_id + salt + pepper)
    -- Така дори при пробив в базата не може да се свърже глас с потребител
    salt        VARCHAR(64)  NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    event_date  TIMESTAMP,
    closes_at   TIMESTAMP,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─── Гласове ──────────────────────────────────────────────
-- ВАЖНО: Тази таблица никога не съдържа лични данни!
CREATE TABLE votes (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id    UUID NOT NULL REFERENCES surveys(id),
    choice       VARCHAR(100) NOT NULL,
    -- 1 = Анонимен (само fingerprint/cookie)
    -- 2 = Частично верифициран (fingerprint + cookie)
    -- 3 = Верифициран (Google Login)
    trust_level  INTEGER NOT NULL CHECK (trust_level IN (1, 2, 3)),
    -- Само регион, никога точен IP
    region       VARCHAR(100),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── Използвани хешове (предотвратяване на двойно гласуване) ──
-- Пазим САМО хеша, никога оригиналния идентификатор
CREATE TABLE used_hashes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hash        VARCHAR(128) NOT NULL,
    survey_id   UUID NOT NULL REFERENCES surveys(id),
    trust_level INTEGER NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (hash, survey_id)
);

-- ─── Индекси ──────────────────────────────────────────────
CREATE INDEX idx_votes_survey_id    ON votes(survey_id);
CREATE INDEX idx_votes_trust_level  ON votes(survey_id, trust_level);
CREATE INDEX idx_used_hashes_lookup ON used_hashes(hash, survey_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_survey_id ON articles(survey_id);

-- ─── Примерни данни за разработка ─────────────────────────
INSERT INTO surveys (title, description, event_date, closes_at)
VALUES (
    'Тестово проучване',
    'Това е примерно проучване за тестване на платформата.',
    NOW(),
    NOW() + INTERVAL '7 days'
);

CREATE TABLE articles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(500) NOT NULL,
    content     TEXT NOT NULL,
    summary     VARCHAR(1000),
    status      VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    survey_id   UUID REFERENCES surveys(id),
    created_at  TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- ─── Admin потребители ────────────────────────────────────
CREATE TABLE admins (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username   VARCHAR(50) NOT NULL UNIQUE,
    -- Паролата се пази като bcrypt хеш, никога като plain text!
    -- Bcrypt е специален алгоритъм за хеширане на пароли
    -- Пример: "admin123" → "$2a$10$N9qo8uLOickgx2ZMRZo..."
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

