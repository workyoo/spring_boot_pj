package boot.sagu.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import boot.sagu.dto.ChatDto;
import boot.sagu.dto.ChatMessageDto;
import boot.sagu.mapper.ChatMapper;
import boot.sagu.mapper.ChatMessageMapper;
import boot.sagu.mapper.MemberMapper;

@Service
public class ChatService implements ChatServiceInter{

	@Autowired
	ChatMapper chatmapper;
	
	@Autowired
	MemberMapper membermapper;
	
	@Autowired
	ChatMessageMapper chatmessagemapper;

	@Override
	public List<ChatDto> getAllChat(String loginId) {
		System.out.println("ChatService.getAllChat 호출 - loginId: " + loginId);
		List<ChatDto> result = chatmapper.getAllChat(loginId);
		System.out.println("매퍼에서 반환된 결과: " + result);
		if (result != null) {
			System.out.println("결과 크기: " + result.size());
			for (int i = 0; i < result.size(); i++) {
				ChatDto chat = result.get(i);
				System.out.println("결과[" + i + "]: " + chat);
				if (chat != null) {
					System.out.println("  - chatRoomId: " + chat.getChatRoomId());
					System.out.println("  - productId: " + chat.getProductId());
					System.out.println("  - sellerId: " + chat.getSellerId());
					System.out.println("  - buyerId: " + chat.getBuyerId());
					System.out.println("  - opponentNickname: " + chat.getOpponentNickname());
				}
			}
		}
		return result;
	}
	
	public List<Map<String, Object>> getChatRoomsWithLastMessage(Long memberId) {
	    return chatmapper.getChatRoomsWithLastMessage(memberId);
	}
	
	public Map<String, Object> getOtherUserInChatRoom(Long chatRoomId, Long currentMemberId) {
	    return chatmapper.getOtherUserInChatRoom(chatRoomId, currentMemberId);
	}
	
	  @Override
	    @Transactional
	    public void updateExit(Long chatRoomId, Long currentMemberId) {
	        
	        // 1. chatRoomId를 통해 buyer_id와 seller_id 조회
	        Map<String, Object> chatRoomInfo = chatmapper.getChatRoomInfoById(chatRoomId);
	        Long buyerId = (Long) chatRoomInfo.get("buyer_id");
	        Long sellerId = (Long) chatRoomInfo.get("seller_id");
	        
	        // 2. 채팅방 나가기 상태 업데이트
	        chatmapper.updateExitStatus(chatRoomId, currentMemberId, buyerId, sellerId);

	        String nickName = chatmapper.getMemberNickname(currentMemberId);
	        if (nickName == null) {
	            System.err.println("경고: member_id " + currentMemberId + "에 대한 닉네임을 찾을 수 없습니다.");
	            // 닉네임이 없을 경우, 기본 메시지로 설정
	            nickName = "알 수 없는 사용자";
	        }
	        
	        // 3. 시스템 메시지 추가
	        ChatMessageDto systemMessage = new ChatMessageDto();
	        systemMessage.setChatRoomId(chatRoomId);
	        systemMessage.setSenderId(currentMemberId);
	        String messageContent = nickName + "님이 채팅방을 나갔습니다.";
	        systemMessage.setMessageContent(messageContent); 
	        chatmessagemapper.insertSystemMessage(systemMessage);
	        
	        // 4. ✨ 새로 추가된 로직: 두 사용자의 탈퇴 상태 확인 및 메시지 삭제
	        Map<String, Integer> exitStatuses = chatmapper.getChatroomExitStatus(chatRoomId); // ✨ 새로운 매퍼 메서드 호출
	        
	        // Map에서 값을 가져올 때 null 체크 및 형변환
	        Integer buyerExitStatus = (Integer) exitStatuses.get("buyer_exit_status");
	        Integer sellerExitStatus = (Integer) exitStatuses.get("seller_exit_status");
	        
	        // 5. ✨ 두 사용자가 모두 나갔는지 확인
	        if (buyerExitStatus != null && sellerExitStatus != null && buyerExitStatus == 1 && sellerExitStatus == 1) {
	            System.out.println("두 사용자 모두 채팅방에서 나갔으므로 메시지를 일괄 삭제합니다.");
	            chatmessagemapper.updateAllMessagesDeletedAt(chatRoomId);
	        } else {
	            System.out.println("아직 채팅방에 사용자가 남아있습니다. 메시지 삭제를 건너뜁니다.");
	        }
	    }

	  @Override
	    public List<Long> getMemberIdsInChatRoom(Long chatRoomId) {
	        // chatroom 테이블의 seller_id와 buyer_id를 조회하여 반환
	        // MyBatis Mapper에 해당 로직이 구현되어 있어야 합니다.
	        List<Long> memberIds = new ArrayList<>();
	        Map<String, Long> ids = chatmapper.getSellerAndBuyerIds(chatRoomId);
	        if (ids != null) {
	            memberIds.add(ids.get("seller_id"));
	            memberIds.add(ids.get("buyer_id"));
	        }
	        return memberIds;
	    }
	  
	  @Override
	    public Long findChatroomByProductIdAndBuyerId(Long productId, Long buyerId) {
	        return chatmapper.findChatroomByProductIdAndBuyerId(productId, buyerId);
	    }

	    @Override
	    @Transactional
	    public void createChatRoomAndSendMessage(ChatDto chatDto, ChatMessageDto messageDto) {
	        // 1. chatroom 테이블에 새로운 채팅방 생성
	        chatmapper.insertChatroom(chatDto);

	        // 2. 생성된 chat_room_id를 사용하여 첫 메시지 저장
	        Map<String, Object> messageParams = new HashMap<>();
	        messageParams.put("chatRoomId", chatDto.getChatRoomId());
	        messageParams.put("senderId", messageDto.getSenderId());
	        messageParams.put("messageType", messageDto.getMessageType());
	        messageParams.put("messageContent", messageDto.getMessageContent());
	        messageParams.put("isRead", 1); // 첫 메시지는 보낸 사람이 직접 보낸 것이므로 읽음 처리

	        chatmessagemapper.insertFirstChatMessage(messageParams);
	    }


	    @Override
	    public Map<String, Object> getChatRoomById(Long chatRoomId, Long memberId) {
	    	// Map 객체를 생성하는 대신, 두 인자를 직접 매퍼로 전달
	    	return chatmapper.getChatRoomById(chatRoomId, memberId);
	    }

	    @Override
	    public Long getRecipientId(Long chatRoomId, Long senderId) {
	        // 채팅방 ID를 기반으로 판매자와 구매자 ID를 가져옵니다.
	        Map<String, Long> ids = chatmapper.getSellerAndBuyerIds(chatRoomId);

	        if (ids == null) {
	            return null; // 채팅방 정보가 없으면 null 반환
	        }

	        Long sellerId = ids.get("seller_id");
	        Long buyerId = ids.get("buyer_id");

	        // 메시지를 보낸 사람(senderId)이 판매자이면, 수신자는 구매자입니다.
	        if (senderId.equals(sellerId)) {
	            return buyerId;
	        }
	        // 메시지를 보낸 사람(senderId)이 구매자이면, 수신자는 판매자입니다.
	        else if (senderId.equals(buyerId)) {
	            return sellerId;
	        }

	        return null; // 예외적인 경우
	    }

		@Override
		public int countChat() {
			// TODO Auto-generated method stub
			return chatmapper.countChat();
		}
}

	


