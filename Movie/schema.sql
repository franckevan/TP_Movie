-- =========================
-- CINÉCONNECT - SCHEMA
-- =========================

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  rating TEXT,
  release_date DATE
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TABLE screenings (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  price NUMERIC(6,2) NOT NULL
);

-- =========================
-- SAMPLE DATA
-- =========================

INSERT INTO movies (title, description, duration_minutes, rating, release_date)
VALUES
  ('Inception', 'Sci-fi thriller about dreams within dreams.', 148, 'PG-13', '2010-07-16'),
  ('Interstellar', 'Exploration through space and time.', 169, 'PG-13', '2014-11-07'),
  ('The Dark Knight', 'Batman faces the Joker.', 152, 'PG-13', '2008-07-18');

INSERT INTO rooms (name, capacity)
VALUES
  ('Room A', 120),
  ('Room B', 80);

INSERT INTO screenings (movie_id, room_id, start_time, price)
VALUES
  (1, 1, '2025-06-01 18:00:00', 12.50),
  (1, 2, '2025-06-01 21:00:00', 12.50),
  (2, 1, '2025-06-02 19:00:00', 13.00),
  (3, 2, '2025-06-03 20:30:00', 11.00);
