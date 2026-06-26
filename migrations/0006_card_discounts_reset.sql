-- 기존 seed 데이터 교체: CardTab과 ID 통일 + 로컬 이미지 경로 등록
DELETE FROM card_discounts;

INSERT INTO card_discounts (id, name, discount, image_key, sort_order) VALUES
  ('woori-platinum', '[우리] LG전자 우리카드 Platinum', 42000, '/images/card/우리카드(platinum).jpg', 0),
  ('lotte',          '[롯데] LG구독엔로카',             26000, '/images/card/롯데카드.jpg',          1),
  ('woori',          '[우리] LG전자 우리카드',          24000, '/images/card/우리카드.jpg',           2),
  ('kb',             '[KB국민] LG전자 KB국민',          22000, '/images/card/KB국민카드.jpg',         3),
  ('shinhan',        '[신한] LG전자 The 구독케어',      30000, '/images/card/신한카드.jpg',           4),
  ('nh',             '[NH] 올원 LG전자 BEST',           20000, '/images/card/농협카드.jpg',           5),
  ('jeonbuk',        '[전북] 베스트케어',               20000, '/images/card/전북카드.jpg',           6),
  ('gwangju',        '[광주] 베스트케어',               20000, '/images/card/광주카드.jpg',           7),
  ('hyundai',        '[현대] LG전자 현대카드',          19000, '/images/card/현대카드.jpg',           8);
