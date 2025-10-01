package boot.sagu.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.ChatDto;
import boot.sagu.dto.ChatMessageDto;

public interface ChatServiceInter {

public List<ChatDto> getAllChat(String loginId);

public List<Map<String, Object>> getChatRoomsWithLastMessage(@Param("memberId") Long memberId);

public Map<String, Object> getOtherUserInChatRoom(@Param("chatRoomId") Long chatRoomId, 
        @Param("currentMemberId") Long currentMemberId);

public void updateExit(Long chatRoomId, Long login_id);

public List<Long> getMemberIdsInChatRoom(Long chatRoomId);

//특정 상품에 대한 채팅방이 이미 존재하는지 확인
public Long findChatroomByProductIdAndBuyerId(Long productId, Long buyerId);

// 첫 메시지 전송 시 채팅방과 메시지를 함께 생성하는 로직
public void createChatRoomAndSendMessage(ChatDto chatDto, ChatMessageDto messageDto);

public Long getRecipientId(Long chatRoomId, Long senderId);

public Map<String, Object> getChatRoomById(Long chatRoomId, Long memberId);

public int countChat();

}
