-- 후기 알림 테이블 생성
CREATE TABLE IF NOT EXISTS review_notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL COMMENT '알림을 받을 멤버 ID (판매자)',
    reviewer_id BIGINT NOT NULL COMMENT '후기를 작성한 멤버 ID (구매자)',
    post_id BIGINT NOT NULL COMMENT '후기가 작성된 게시글 ID',
    review_id BIGINT NOT NULL COMMENT '작성된 후기 ID',
    message VARCHAR(255) NOT NULL COMMENT '알림 메시지',
    is_read TINYINT DEFAULT 0 COMMENT '읽음 여부 (0: 안읽음, 1: 읽음)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '알림 생성 시간',
    INDEX idx_member_id (member_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) COMMENT='후기 작성 알림 테이블';

