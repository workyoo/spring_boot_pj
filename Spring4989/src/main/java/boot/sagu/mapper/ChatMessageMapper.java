package boot.sagu.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.ChatMessageDto;

@Mapper
public interface ChatMessageMapper {

	public Long insertMessage(ChatMessageDto dto);
	
	public List<ChatMessageDto> getAllMessages(Long chat_room_id);
	
	// 메시지 읽음 처리
	public void markMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("memberId") Long memberId);
	// 디버깅용: 메시지 상태 확인
	public List<ChatMessageDto> getMessageStatus(Long chatRoomId);
	
	// 테스트용: 모든 메시지를 안읽음으로 설정
	public int updateAllMessagesToUnread(Long chatRoomId);
	
	// 테스트용: 특정 조건의 메시지만 업데이트
	public int updateSpecificMessageAsRead(Long chatRoomId, Long readerId);
	
	// 파일 메시지 조회 (chatfile 테이블과 JOIN)
	public List<Map<String, Object>> getMessagesWithFiles(Long chatRoomId);
	
	public void insertSystemMessage(ChatMessageDto dto);
	
	public void deleteMessage(Long message_id);
	
	public Long getChatRoomIdByMessageId(Long messageId);
	
	public void updateAllMessagesDeletedAt(Long chatRoomId);
	
	public void deleteOldMessages(@Param("hours") int hours);
	
	public int getUnreadMessageCount(@Param("memberId") Long memberId);
	 
	public void insertFirstChatMessage(Map<String, Object> params);
	
	public int getUnreadMessageCountByChatRoom(@Param("chatRoomId") Long chatRoomId, @Param("memberId") Long memberId);
	
}
