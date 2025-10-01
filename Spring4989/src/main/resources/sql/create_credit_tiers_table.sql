-- credit_tiers 테이블 생성
CREATE TABLE IF NOT EXISTS credit_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT '초보상인',
    total_score INT NOT NULL DEFAULT 0,
    transaction_score INT NOT NULL DEFAULT 0,
    rating_score INT NOT NULL DEFAULT 0,
    penalty_score INT NOT NULL DEFAULT 0,
    completed_transactions INT NOT NULL DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    report_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 인덱스 추가
    INDEX idx_tier (tier),
    INDEX idx_total_score (total_score),
    
    -- 유니크 제약조건
    UNIQUE KEY uk_member_id (member_id),
    
    -- 외래키 제약조건
    FOREIGN KEY (member_id) REFERENCES members(member_id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- 테이블 구조 확인
DESCRIBE credit_tiers;

-- 기존 회원들의 초기 신용도 등급 데이터 삽입 (선택사항)
-- INSERT INTO credit_tiers (member_id, tier, total_score, transaction_score, rating_score, penalty_score, completed_transactions, average_rating, report_count)
-- SELECT member_id, '초보상인', 0, 0, 0, 0, 0, 0.00, 0 FROM members;
