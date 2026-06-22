-- 히어로 슬라이드
CREATE TABLE IF NOT EXISTS hero_slides (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT    NOT NULL DEFAULT '',
  subtitle  TEXT    NOT NULL DEFAULT '',
  title     TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 매니저
CREATE TABLE IF NOT EXISTS managers (
  id        TEXT PRIMARY KEY,
  img_key   TEXT NOT NULL DEFAULT '',
  name      TEXT NOT NULL,
  store     TEXT NOT NULL DEFAULT '',
  tags      TEXT NOT NULL DEFAULT '[]',
  desc      TEXT NOT NULL DEFAULT '',
  href      TEXT NOT NULL DEFAULT '#',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 상담 신청
CREATE TABLE IF NOT EXISTS consult_submissions (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  purpose      TEXT NOT NULL DEFAULT '',
  area         TEXT NOT NULL DEFAULT '',
  apartment    TEXT NOT NULL DEFAULT '',
  channels     TEXT NOT NULL DEFAULT '[]',
  model        TEXT NOT NULL DEFAULT '',
  submitted_at TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'inProgress', 'completed'))
);

-- 피처 배너 (항상 1행)
CREATE TABLE IF NOT EXISTS feature_banner (
  id           INTEGER PRIMARY KEY DEFAULT 1,
  image_key    TEXT NOT NULL DEFAULT '',
  subtitle     TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL DEFAULT '',
  button_label TEXT NOT NULL DEFAULT '',
  href         TEXT NOT NULL DEFAULT ''
);
INSERT OR IGNORE INTO feature_banner (id, subtitle, title, button_label, href)
VALUES (1, '말로 해서 더 편리한 정수기', 'LG PuriCare | Objet Collection', '제품 페이지 바로가기', '/products/kitchen');

-- 게시글 (혜택/소상공인 공용, type으로 구분)
CREATE TABLE IF NOT EXISTS posts (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('benefit', 'smallbiz')),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

-- 메인 카테고리
CREATE TABLE IF NOT EXISTS main_categories (
  id         TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  href       TEXT NOT NULL DEFAULT '',
  image      TEXT NOT NULL DEFAULT '',
  bg         TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 이벤트 상품
CREATE TABLE IF NOT EXISTS event_products (
  id         TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
