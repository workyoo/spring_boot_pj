-- contacts 테이블에 is_read 컬럼 추가
ALTER TABLE contacts ADD COLUMN is_read TINYINT(1) DEFAULT 0 COMMENT '읽음 여부 (0: 읽지 않음, 1: 읽음)';

-- 기존 데이터는 모두 읽음 처리
UPDATE contacts SET is_read = 1 WHERE is_read IS NULL;
