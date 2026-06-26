-- image_key가 cards/ prefix 없이 저장된 경우 수정
UPDATE card_discounts
SET image_key = 'cards/' || image_key
WHERE image_key != ''
  AND image_key NOT LIKE 'cards/%'
  AND image_key NOT LIKE '/%'
  AND image_key NOT LIKE 'http%';
