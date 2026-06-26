CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  stars      INTEGER NOT NULL DEFAULT 5,
  image_key  TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL DEFAULT '',
  product    TEXT NOT NULL DEFAULT '',
  date       TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
