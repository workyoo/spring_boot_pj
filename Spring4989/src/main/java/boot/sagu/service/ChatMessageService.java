package boot.sagu.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import boot.sagu.dto.ChatMessageDto;
import boot.sagu.mapper.ChatFileMapper;
import boot.sagu.mapper.ChatMessageMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService implements ChatMessageServiceInter{

	@Autowired
	ChatMessageMapper chatMessageMapper;
	
	@Autowired
	ChatFileMapper chatFileMapper;
	
	 private final SimpMessagingTemplate messagingTemplate; // 👈 이 객체 추가
	@Override
	public Long insertMessage(ChatMessageDto messageDto) {
	    // 1. MyBatis 쿼리 실행 -> messageDto 객체에 ID가 채워짐
	    chatMessageMapper.insertMessage(messageDto);

	    // 2. 채워진 ID를 반환
	    return messageDto.getMessageId();
	}

	@Override
	public List<ChatMessageDto> getAllMessages(Long chatRoomId) {
		System.out.println("=== ChatMessageService.getAllMessages ===");
		System.out.println("입력받은 chat_room_id: " + chatRoomId);
		
		try {
			List<ChatMessageDto> result = chatMessageMapper.getAllMessages(chatRoomId);
			System.out.println("Mapper에서 반환된 결과: " + result);
			System.out.println("결과 클래스: " + (result != null ? result.getClass().getName() : "null"));
			
			if (result == null) {
			    return new ArrayList<>(); // 이 부분이 있는지 확인
			}
			if (result != null) {
				System.out.println("결과 크기: " + result.size());
				for (int i = 0; i < result.size(); i++) {
					ChatMessageDto msg = result.get(i);
					System.out.println("메시지 " + i + ": " + msg);
					System.out.println("메시지 " + i + " 클래스: " + (msg != null ? msg.getClass().getName() : "null"));
					if (msg != null) {
						System.out.println("  - message_id: " + msg.getMessageId());
						System.out.println("  - chat_room_id: " + msg.getChatRoomId());
						System.out.println("  - sender_id: " + msg.getSenderId());
						System.out.println("  - message_type: " + msg.getMessageType());
						System.out.println("  - message_content: " + msg.getMessageContent());
						System.out.println("  - created_at: " + msg.getCreatedAt());
						System.out.println("  - is_read: " + msg.getIsRead());
					} else {
						System.out.println("  - 메시지 " + i + "는 null입니다.");
					}
				}
			} else {
				System.out.println("Mapper에서 null이 반환되었습니다.");
			}
			return result;
		} catch (Exception e) {
			System.out.println("=== ChatMessageService 에러 발생 ===");
			System.out.println("에러 메시지: " + e.getMessage());
			e.printStackTrace();
			return null;
		}
	}
	
	@Override
	@Transactional
    public void markMessagesAsRead(Long chatRoomId, Long memberId) {
		//System.out.println("[DEBUG] markMessagesAsRead 시작, chatRoomId: " + chatRoomId + ", memberId: " + memberId);
		    chatMessageMapper.markMessagesAsRead(chatRoomId, memberId);
		 //System.out.println("[DEBUG] markMessagesAsRead 쿼리 실행 완료");
    }
	
	@Override
	// 메시지 읽음 상태 초기화 메서드
	public void resetMessageReadStatus(Long chatRoomId) {
		System.out.println("=== ChatMessageService.resetMessageReadStatus ===");
		System.out.println("채팅방 ID: " + chatRoomId);
		
		try {
			// 모든 메시지를 안읽음 상태로 초기화
			int updatedRows = chatMessageMapper.updateAllMessagesToUnread(chatRoomId);
			System.out.println("초기화된 메시지 수: " + updatedRows);
			
		} catch (Exception e) {
			System.out.println("=== 메시지 읽음 상태 초기화 에러 ===");
			System.out.println("에러 메시지: " + e.getMessage());
			e.printStackTrace();
		}
	}

	@Override
	public void insertSystemMessage(ChatMessageDto dto) {
		
		chatMessageMapper.insertSystemMessage(dto);
	}
	
	   @Transactional
	    public void deleteMessage(Long messageId) {
	        System.out.println("=== ChatMessageService.deleteMessage ===");
	        System.out.println("삭제할 메시지 ID: " + messageId);

	        try {
	            // 1. chatmessage 테이블의 deleted_at 컬럼 업데이트
	            chatMessageMapper.deleteMessage(messageId);
	            System.out.println("chatmessage 테이블 업데이트 완료.");

	            // 2. chatfile 테이블의 deleted_at 컬럼 업데이트
	            chatFileMapper.deleteFile(messageId);
	            System.out.println("chatfile 테이블 업데이트 완료.");

	            // 3. 웹소켓으로 삭제 알림 전송 👈 이 부분이 핵심입니다!
	            // 이 메시지를 받은 클라이언트들이 실시간으로 화면을 업데이트합니다.
	            
	            // 삭제된 메시지의 chat_room_id를 가져오는 로직이 필요합니다.
	            // 예를 들어, 메시지 ID로 채팅방 ID를 조회하는 메소드를 추가해야 합니다.
	            Long chatRoomId = chatMessageMapper.getChatRoomIdByMessageId(messageId); 

	            if (chatRoomId != null) {
	                // 알림 메시지 객체 생성
	                Map<String, Object> deleteNotification = new HashMap<>();
	                deleteNotification.put("type", "DELETE");
	                deleteNotification.put("chatRoomId", chatRoomId);
	                deleteNotification.put("messageId", messageId);
	                
	                // 해당 채팅방 토픽으로 메시지 전송
	                messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, deleteNotification);
	                System.out.println("웹소켓으로 삭제 알림 전송 완료.");
	            }

	            System.out.println("메시지 삭제 처리가 성공적으로 완료되었습니다.");
	        } catch (Exception e) {
	            System.err.println("=== 메시지 삭제 중 에러 발생 ===");
	            e.printStackTrace();
	            throw new RuntimeException("메시지 삭제 실패: " + e.getMessage());
	        }
	    }
	   
	   @Override
	   public int getUnreadMessageCount(Long memberId) {
	        return chatMessageMapper.getUnreadMessageCount(memberId);
	    }
	   
	   @Override
	    public void insertFirstChatMessage(Map<String, Object> params) {
	        chatMessageMapper.insertFirstChatMessage(params);
	    } 

}