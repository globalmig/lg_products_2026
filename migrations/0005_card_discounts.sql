-- 제휴카드 할인 정보
CREATE TABLE IF NOT EXISTS card_discounts (
  id         TEXT    PRIMARY KEY,
  name       TEXT    NOT NULL,
  discount   INTEGER NOT NULL DEFAULT 0,
  image_key  TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO card_discounts (id, name, discount, image_key, sort_order) VALUES
  ('card_1', '[LG전자] 우리 Platinum',         42000, '', 0),
  ('card_2', '[LG전자] 구독엔로카 롯데카드',     26000, '', 1),
  ('card_3', '[LG전자] 우리카드',               24000, '', 2),
  ('card_4', '[LG전자] KB국민카드',             22000, '', 3),
  ('card_5', '[LG전자] 신한 더구독케어',         20000, '', 4),
  ('card_6', '[LG전자] 플러스 하나카드',         20000, '', 5),
  ('card_7', '[LG전자] NH올원 BEST',            20000, '', 6),
  ('card_8', '[LG전자] 베스트케어카드(광주)',     20000, '', 7),
  ('card_9', '[LG전자] 베스트케어카드(전북)',     20000, '', 8),
  ('card_10','[LG전자] 현대카드',               19000, '', 9);
