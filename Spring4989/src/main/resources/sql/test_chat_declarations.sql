-- 채팅신고 테이블 데이터 확인
SELECT * FROM chatdeclaration;

-- 테이블 구조 확인
DESCRIBE chatdeclaration;

-- 데이터 개수 확인
SELECT COUNT(*) FROM chatdeclaration;

-- 최근 데이터 5개 확인
SELECT 
    declaration_id,
    declaration_chat_room_id,
    declaration_memberid,
    declaration_opposite_memberid,
    declaration_type,
    declaration_content,
    declaration_time,
    is_read
FROM chatdeclaration 
ORDER BY declaration_id DESC 
LIMIT 5;
