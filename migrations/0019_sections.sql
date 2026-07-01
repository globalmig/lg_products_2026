CREATE TABLE IF NOT EXISTS sections (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO sections (id, label, sort_order) VALUES
  ('kitchen', '주방가전', 0),
  ('tv', 'TV', 1),
  ('living', '생활가전', 2),
  ('air', '에어케어', 3);
