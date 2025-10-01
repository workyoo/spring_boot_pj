-- 고객 문의 테이블 생성
CREATE TABLE contacts (
    contact_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '문의자 이름',
    email VARCHAR(255) NOT NULL COMMENT '문의자 이메일',
    subject VARCHAR(500) NOT NULL COMMENT '문의 제목',
    message TEXT NOT NULL COMMENT '문의 내용',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '처리 상태 (PENDING, PROCESSING, COMPLETED)',
    admin_reply TEXT COMMENT '관리자 답변',
    member_id BIGINT COMMENT '회원 ID (로그인한 사용자의 경우)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '문의 등록 시간',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    
    INDEX idx_status (status),
    INDEX idx_member_id (member_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='고객 문의 테이블';
