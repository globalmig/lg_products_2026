-- 상품
CREATE TABLE IF NOT EXISTS products (
  id           TEXT PRIMARY KEY,
  section      TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT '',
  name         TEXT NOT NULL DEFAULT '',
  model        TEXT NOT NULL DEFAULT '',
  monthly_price INTEGER NOT NULL DEFAULT 0,
  benefit_price INTEGER,
  tags         TEXT NOT NULL DEFAULT '[]',
  image        TEXT NOT NULL DEFAULT '',
  is_best      INTEGER NOT NULL DEFAULT 0,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- 상품 카테고리
CREATE TABLE IF NOT EXISTS product_categories (
  id         TEXT PRIMARY KEY,
  section    TEXT NOT NULL,
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
