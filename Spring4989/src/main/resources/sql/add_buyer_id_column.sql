-- posts 테이블에 buyer_id 컬럼 추가
ALTER TABLE posts ADD COLUMN buyer_id BIGINT NULL;

-- buyer_id 컬럼에 대한 인덱스 추가 (선택사항)
CREATE INDEX idx_posts_buyer_id ON posts(buyer_id);

-- buyer_id 컬럼에 대한 외래키 제약조건 추가 (선택사항)
-- ALTER TABLE posts ADD CONSTRAINT fk_posts_buyer_id FOREIGN KEY (buyer_id) REFERENCES members(member_id);
