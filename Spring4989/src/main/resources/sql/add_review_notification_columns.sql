-- chatdeclarationresult 테이블에 후기 알림을 위한 컬럼들 추가
ALTER TABLE chatdeclarationresult 
ADD COLUMN notification_type VARCHAR(50) DEFAULT NULL COMMENT '알림 유형 (SANCTION, REVIEW_REQUEST 등)',
ADD COLUMN post_id INT DEFAULT NULL COMMENT '게시글 ID',
ADD COLUMN review_id INT DEFAULT NULL COMMENT '후기 ID',
ADD COLUMN reviewer_nickname VARCHAR(100) DEFAULT NULL COMMENT '후기 작성자 닉네임',
ADD COLUMN post_title VARCHAR(255) DEFAULT NULL COMMENT '게시글 제목';

-- 인덱스 추가 (성능 향상)
CREATE INDEX idx_notification_type ON chatdeclarationresult(notification_type);
CREATE INDEX idx_post_id ON chatdeclarationresult(post_id);
CREATE INDEX idx_review_id ON chatdeclarationresult(review_id);
