-- reports 테이블의 status 컬럼 길이 수정
-- 현재 status 컬럼이 VARCHAR(10) 또는 더 작은 길이로 설정되어 있을 가능성이 높음
-- "DISMISSED" (9글자)를 저장할 수 있도록 VARCHAR(20)으로 변경

-- 1. 현재 테이블 구조 확인
DESCRIBE reports;

-- 2. status 컬럼 길이 수정
ALTER TABLE reports MODIFY COLUMN status VARCHAR(20) DEFAULT 'PENDING' COMMENT '신고 상태 (PENDING, INVESTIGATING, RESOLVED, DISMISSED)';

-- 3. 수정 후 테이블 구조 확인
DESCRIBE reports;

-- 4. 현재 데이터 확인
SELECT report_id, status FROM reports LIMIT 10;
