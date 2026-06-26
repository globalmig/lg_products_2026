-- 계약기간별 월 구독료 컬럼 추가 (72개월은 기존 monthly_price 사용)
ALTER TABLE products ADD COLUMN price_60 INTEGER;
ALTER TABLE products ADD COLUMN price_48 INTEGER;
ALTER TABLE products ADD COLUMN price_36 INTEGER;
