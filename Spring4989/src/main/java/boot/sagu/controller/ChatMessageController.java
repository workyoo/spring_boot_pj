package boot.sagu.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import boot.sagu.dto.WebSocketMessageDto;

import boot.sagu.dto.ChatFileDto;
import boot.sagu.dto.ChatMessageDto;
import boot.sagu.dto.MemberDto;
import boot.sagu.service.ChatFileUploadService;
import boot.sagu.service.ChatMessageServiceInter;
import boot.sagu.service.ChatServiceInter;
import boot.sagu.service.MemberService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ChatMessageController {

	@Autowired
	private ChatMessageServiceInter chatMessageService;
	
	@Autowired
	private ChatFileUploadService chatFileUploadService;
	
	@Autowired
	private MemberService memberService;
	
	@Autowired
    private ChatServiceInter chatService;
	
	 @Autowired
	private SimpMessagingTemplate messagingTemplate;
	
	@PostMapping("/insertMessage")
    public Long insertMessage(@RequestBody ChatMessageDto dto) {
        System.out.println("=== 메시지 저장 API 호출 ===");
        System.out.println("요청 받은 DTO: " + dto);
        
        // 1. 서비스 메소드를 호출하고, 반환된 messageId를 받습니다.
        Long createdMessageId = chatMessageService.insertMessage(dto);

        // 2. 받은 messageId를 클라이언트에 반환합니다.
        System.out.println("생성된 messageId: " + createdMessageId);
        return createdMessageId;
    }
	
	@GetMapping("/test")
	public String test()
	{
		System.out.println("=== 테스트 API 호출 ===");
		return "Hello World";
	}
	
	@GetMapping("/listMessage")
	public List<ChatMessageDto> getList(@RequestParam(name = "chatRoomId") Long chatRoomId) {
	    System.out.println("=== 메시지 조회 API 호출 ===");
	    System.out.println("요청 받은 chatRoomId: " + chatRoomId);
	    System.out.println("chatRoomId 타입: " + ((Object)chatRoomId).getClass().getName());

	    try {
	        List<ChatMessageDto> result = chatMessageService.getAllMessages(chatRoomId);

	        if (result == null) {
	            return new ArrayList<>(); 
	        }

	        System.out.println("서비스 호출 완료");
	        System.out.println("조회 결과: " + result);
	        System.out.println("조회 결과 크기: " + (result != null ? result.size() : "null"));
	        for (ChatMessageDto message : result) {
	            if (message.getDeletedAt() != null) {
	                message.setMessageContent("삭제된 메시지입니다.");
	                message.setMessageType("deleted");
	            } else if ("image".equals(message.getMessageType())) {
	                ChatFileDto fileInfo = chatFileUploadService.getChatFileByMessageId(message.getMessageId());
	                if (fileInfo != null) {
	                    message.setMessageContent(fileInfo.getFileUrl());
	                } else {
	                    message.setMessageContent("이미지를 찾을 수 없습니다.");
	                }
	            }
	        }
	        
	        return result;
	    } catch (Exception e) {
	        System.out.println("=== 에러 발생 ===");
	        System.out.println("에러 메시지: " + e.getMessage());
	        e.printStackTrace();
	        throw e;
	    }
	}
	
	// 기존 메시지들을 안읽음 상태로 초기화하는 API
	@PostMapping("/resetMessageReadStatus")
	public String resetMessageReadStatus(@RequestParam(name = "chatRoomId") Long chatRoomId)
	{
		System.out.println("=== 메시지 읽음 상태 초기화 API 호출 ===");
		System.out.println("요청 받은 chatRoomId: " + chatRoomId);
		
		try {
			chatMessageService.resetMessageReadStatus(chatRoomId);
			return "메시지 읽음 상태가 초기화되었습니다.";
		} catch (Exception e) {
			System.out.println("=== 에러 발생 ===");
		 System.out.println("에러 메시지: " + e.getMessage());
			e.printStackTrace();
			return "초기화 중 오류가 발생했습니다: " + e.getMessage();
		}
	}
	
	@PostMapping("/chat/deleteMessage")
	public void deleteMessage(@RequestBody Map<String, Long> payload)
	{
		System.out.println("=== 메시지 삭제 API 호출 ===");
		Long messageId = payload.get("messageId");
		
		System.out.println("프론트엔드로부터 받은 messageId: " + messageId);
		
		if (messageId == null) {
			System.err.println("messageId가 요청 본문에 없습니다.");
			return; // 혹은 적절한 에러 응답을 반환
		}
		System.out.println("삭제할 메시지 ID: " + messageId);
		
		try {
			chatMessageService.deleteMessage(messageId);
			System.out.println("메시지 삭제 처리가 컨트롤러에서 완료되었습니다.");
		} catch (Exception e) {
			System.err.println("=== 메시지 삭제 중 컨트롤러 에러 발생 ===");
			e.printStackTrace();
			// 클라이언트에게 에러를 알릴 수 있도록 적절한 응답 처리가 필요
		}
	}
	
	@GetMapping("/read")
    public ResponseEntity<Void> markAsRead(
    		@RequestParam(name = "chatRoomId") Long chatRoomId, 
            @RequestParam(name = "memberId") Long memberId) {

		  if (memberId == null) {
		        System.err.println("[ERROR] memberId가 누락되었습니다.");
		        return ResponseEntity.badRequest().build();
		    }
		
	   // System.out.println("[DEBUG] markAsRead 호출됨, chatRoomId: " + chatRoomId + ", memberId: " + memberId);
	    try {
	        chatMessageService.markMessagesAsRead(chatRoomId, memberId);
	        //System.out.println("[DEBUG] markMessagesAsRead 실행 완료");
	        return ResponseEntity.ok().build();
	    } catch (Exception e) {
	        System.err.println("[ERROR] markAsRead 예외 발생:");
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
    }
	
	@GetMapping("/chat/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@RequestParam(name = "loginId") String loginId) {
        // 💡 Spring Security의 Authentication 객체에서 사용자 ID를 가져옵니다.
        // 이 부분은 프로젝트의 로그인 구현 방식에 따라 달라질 수 있습니다.
		  int intMemberId = memberService.getMemberByLoginId(loginId).getMemberId();
	        Long memberId = Long.valueOf(intMemberId); // 👈 Long으로 변환

        int unreadCount = chatMessageService.getUnreadMessageCount(memberId);
        
        // 💡 HTTP 200 OK와 함께 읽지 않은 메시지 개수를 반환
        return ResponseEntity.ok(unreadCount);
    }
	
	/**
     * @MessageMapping으로 프론트엔드에서 보낸 '읽음' 상태 메시지를 처리합니다.
     * 클라이언트가 /app/chat.readMessageStatus 로 메시지를 보내면 이 메서드가 실행됩니다.
     */
	@MessageMapping("/chat.readMessageStatus")
	public void handleReadMessage(WebSocketMessageDto message) {
	    try {
	        // 1. 읽음 처리 로직 호출
	        chatMessageService.markMessagesAsRead(message.getChatRoomId(), message.getSenderId());

	        // 2. 채팅방에 속한 모든 멤버 ID를 가져옵니다.
	        List<Long> memberIdsInRoom = chatService.getMemberIdsInChatRoom(message.getChatRoomId());
	        
	        // 3. '읽음' 메시지를 보낸 사람(sender)이 아닌 다른 사람(상대방)을 찾습니다.
	        Long receiverId = null;
	        for (Long memberId : memberIdsInRoom) {
	            if (!memberId.equals(message.getSenderId())) {
	                receiverId = memberId;
	                break;
	            }
	        }
	        
	        if (receiverId != null) {
	            // 4. 프론트엔드로 보낼 '읽음 업데이트' 메시지를 생성합니다.
	            // 이 메시지에는 'READ_UPDATE' 타입과 발신자 ID가 포함되어야 합니다.
	            WebSocketMessageDto readUpdateMessage = new WebSocketMessageDto();
	            readUpdateMessage.setType("READ_UPDATE");
	            readUpdateMessage.setSenderId(message.getSenderId()); // 메시지를 읽은 사람(상대방)의 ID
	            readUpdateMessage.setChatRoomId(message.getChatRoomId());
	            
	            // 5. '읽음' 신호를 받은 상대방에게만 메시지를 보냅니다.
	            // 이제 프론트엔드는 이 메시지를 받으면 is_read 상태를 업데이트합니다.
	            messagingTemplate.convertAndSend(
	                "/topic/chat/" + message.getChatRoomId(),
	                readUpdateMessage
	            );
	        }

	    } catch (Exception e) {
	    	// 에러 처리
	    }
	}
	
}