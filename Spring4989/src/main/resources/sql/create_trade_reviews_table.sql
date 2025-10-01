-- trade_reviews 테이블 생성
CREATE TABLE IF NOT EXISTS trade_reviews (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    review_opposite_id BIGINT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 인덱스 추가
    INDEX idx_post_id (post_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_review_opposite_id (review_opposite_id),
    
    -- 외래키 제약조건 (선택사항)
    -- FOREIGN KEY (post_id) REFERENCES posts(post_id),
    -- FOREIGN KEY (reviewer_id) REFERENCES members(member_id),
    -- FOREIGN KEY (review_opposite_id) REFERENCES members(member_id)
);

-- 테이블 구조 확인
DESCRIBE trade_reviews;
