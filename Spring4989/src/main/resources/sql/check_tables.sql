-- 테이블 존재 여부 확인
SHOW TABLES LIKE 'credit_tiers';
SHOW TABLES LIKE 'members';

-- credit_tiers 테이블 구조 확인
DESCRIBE credit_tiers;

-- members 테이블에 tier 컬럼 존재 여부 확인
DESCRIBE members;

-- member_id 46이 존재하는지 확인
SELECT member_id, nickname, tier FROM members WHERE member_id = 46;

-- credit_tiers 테이블에 member_id 46 데이터가 있는지 확인
SELECT * FROM credit_tiers WHERE member_id = 46;
