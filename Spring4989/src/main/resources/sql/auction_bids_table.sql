-- auction_bids 테이블 생성
CREATE TABLE IF NOT EXISTS auction_bids (
    bid_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    bidder_id BIGINT NOT NULL,
    bid_amount DECIMAL(12,2) NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 외래키 제약조건 (posts 테이블과 연결)
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    
    -- 인덱스 추가
    INDEX idx_post_id (post_id),
    INDEX idx_bidder_id (bidder_id),
    INDEX idx_bid_time (bid_time)
);

-- 테이블 설명
-- bid_id: 입찰 고유 ID (자동 증가)
-- post_id: 경매글 ID (posts 테이블 참조)
-- bidder_id: 입찰자 ID (members 테이블 참조)
-- bid_amount: 입찰 금액
-- bid_time: 입찰 시간 (자동 설정) 