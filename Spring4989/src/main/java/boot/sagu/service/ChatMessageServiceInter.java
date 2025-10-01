package boot.sagu.service;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.ChatMessageDto;

public interface ChatMessageServiceInter {

	public Long insertMessage(ChatMessageDto dto);
	
	public List<ChatMessageDto> getAllMessages(Long chat_room_id);
	
	// 메시지 읽음 처리
	void markMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("memberId") Long memberId);
	
	// 메시지 읽음 상태 초기화
	public void resetMessageReadStatus(Long chatRoomId);
	
	public void insertSystemMessage(ChatMessageDto dto);
	
	public void deleteMessage(Long messageId);
	
	public int getUnreadMessageCount(Long memberId);

	public void insertFirstChatMessage(Map<String, Object> params);

}
