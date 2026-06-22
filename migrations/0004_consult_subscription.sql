-- 구독신청 폼 필드 추가
ALTER TABLE consult_submissions ADD COLUMN selected_products TEXT NOT NULL DEFAULT '[]';
ALTER TABLE consult_submissions ADD COLUMN care_type         TEXT NOT NULL DEFAULT '';
ALTER TABLE consult_submissions ADD COLUMN available_time    TEXT NOT NULL DEFAULT '';
ALTER TABLE consult_submissions ADD COLUMN extra             TEXT NOT NULL DEFAULT '';
