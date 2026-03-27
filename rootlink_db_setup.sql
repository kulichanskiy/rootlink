-- =============================================================
--  RootLink — Full Database Setup
--  Run this entire file in MySQL Workbench to get started.
--  It creates the database, all tables, and loads test data.
-- =============================================================

CREATE DATABASE IF NOT EXISTS rootlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rootlink;

-- ── Drop tables in reverse order (foreign key safe) ──────────
DROP TABLE IF EXISTS service_bookings;
DROP TABLE IF EXISTS event_requests;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- ── 1. Users ─────────────────────────────────────────────────
CREATE TABLE users (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(120) NOT NULL,
    preferences VARCHAR(255),
    location   VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Events ────────────────────────────────────────────────
CREATE TABLE events (
    id             BIGINT       AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(100) NOT NULL,
    description    TEXT,
    image_url      VARCHAR(255),
    category       VARCHAR(120) NOT NULL,
    tags           VARCHAR(255),
    event_datetime DATETIME     NOT NULL,
    location       VARCHAR(100) NOT NULL,
    capacity       INT          NOT NULL,
    status         VARCHAR(20)  NOT NULL,
    organizer_id   BIGINT       NOT NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id),
    CONSTRAINT chk_events_capacity CHECK (capacity > 0)
);

-- ── 3. Services ───────────────────────────────────────────────
CREATE TABLE services (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT,
    type        VARCHAR(120) NOT NULL,
    tags        VARCHAR(255),
    image_url   VARCHAR(255),
    location    VARCHAR(100),
    provider_id BIGINT       NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_services_provider FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- ── 4. Event Requests ─────────────────────────────────────────
CREATE TABLE event_requests (
    id         BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    event_id   BIGINT      NOT NULL,
    status     VARCHAR(20) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_requests_user  FOREIGN KEY (user_id)  REFERENCES users(id),
    CONSTRAINT fk_event_requests_event FOREIGN KEY (event_id) REFERENCES events(id),
    CONSTRAINT uq_event_requests_user_event UNIQUE (user_id, event_id)
);

-- ── 5. Service Bookings ───────────────────────────────────────
CREATE TABLE service_bookings (
    id          BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    service_id  BIGINT      NOT NULL,
    status      VARCHAR(20) NOT NULL,
    booked_time DATETIME,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_bookings_user    FOREIGN KEY (user_id)    REFERENCES users(id),
    CONSTRAINT fk_service_bookings_service FOREIGN KEY (service_id) REFERENCES services(id)
);

-- =============================================================
--  TEST DATA
--  Note: passwords here are raw strings for DB inspection only.
--  To log in via the API, register through POST /api/users first.
-- =============================================================

INSERT INTO users (email, password, role, preferences, location) VALUES
('mike@example.com',  'hashed_pw_1', 'ORGANIZER', 'English',           'Surrey'),
('anna@example.com',  'hashed_pw_2', 'MEMBER',    'Ukrainian, English', 'Vancouver'),
('ivan@example.com',  'hashed_pw_3', 'PROVIDER',  'Russian, English',   'Burnaby'),
('sara@example.com',  'hashed_pw_4', 'MEMBER',    'English',            'Richmond');

INSERT INTO events (title, description, category, tags, event_datetime, location, capacity, status, organizer_id) VALUES
('Football Meetup',   'Casual football game for newcomers',  'Sports',    'football,outdoor',   '2026-06-20 18:00:00', 'Surrey',    10, 'OPEN', 1),
('Language Exchange', 'Practice English and Ukrainian',      'Education', 'language,community', '2026-06-22 17:00:00', 'Vancouver',  5, 'OPEN', 1);

INSERT INTO services (title, description, type, tags, location, provider_id) VALUES
('Math Tutoring', 'High school and university math tutoring', 'Tutoring', 'math,education', 'Burnaby', 3),
('Basic Haircut',  'Affordable haircut for men',              'Haircut',  'style,barber',   'Surrey',  3);

INSERT INTO event_requests (user_id, event_id, status) VALUES
(2, 1, 'PENDING'),
(4, 1, 'APPROVED'),
(2, 2, 'APPROVED');

INSERT INTO service_bookings (user_id, service_id, status, booked_time) VALUES
(2, 1, 'PENDING',  '2026-06-21 15:00:00'),
(4, 1, 'APPROVED', '2026-06-23 16:00:00'),
(2, 2, 'REJECTED', '2026-06-24 12:00:00');

-- =============================================================
--  VERIFY — run these to confirm everything loaded correctly
-- =============================================================
-- SELECT * FROM users;
-- SELECT * FROM events;
-- SELECT * FROM services;
-- SELECT * FROM event_requests;
-- SELECT * FROM service_bookings;
