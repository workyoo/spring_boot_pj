-- 테스트용 채팅신고 데이터 추가
INSERT INTO chatdeclaration (
    declaration_chat_room_id,
    declaration_memberid,
    declaration_opposite_memberid,
    declaration_type,
    declaration_content,
    declaration_time,
    is_read
) VALUES 
(1, 101, 102, '스팸', '부적절한 광고 메시지를 보내고 있습니다.', NOW(), 0),
(2, 103, 104, '욕설', '상대방이 계속 욕설을 사용합니다.', NOW(), 0),
(3, 105, 106, '협박', '거래를 강요하는 협박성 메시지입니다.', NOW(), 0),
(4, 107, 108, '사기', '허위 정보로 사기를 시도하고 있습니다.', NOW(), 0),
(5, 109, 110, '성희롱', '성적 수치심을 주는 메시지입니다.', NOW(), 0);

-- 데이터 확인
SELECT * FROM chatdeclaration ORDER BY declaration_id DESC;
