package boot.sagu.controller;

import java.sql.Timestamp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import boot.sagu.dto.ChatFileDto;
import boot.sagu.dto.ChatMessageDto;
import boot.sagu.dto.WebSocketMessageDto;
import boot.sagu.service.ChatMessageServiceInter;

@Controller
public class WebSocketController {

    @Autowired
    private ChatMessageServiceInter chatMessageService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public WebSocketMessageDto sendMessage(@Payload WebSocketMessageDto webSocketMessage) {
        // 메시지를 데이터베이스에 저장
    	 if ("text".equals(webSocketMessage.getMessageType())) {
             // 메시지를 데이터베이스에 저장
             ChatMessageDto chatMessage = new ChatMessageDto();
             
             chatMessage.setChatRoomId(webSocketMessage.getChatRoomId());
             chatMessage.setSenderId(webSocketMessage.getSenderId());
             chatMessage.setMessageContent(webSocketMessage.getMessageContent());
             chatMessage.setMessageType(webSocketMessage.getMessageType());
             
             chatMessage.setCreatedAt(new Timestamp(System.currentTimeMillis()));
             Long messageId = chatMessageService.insertMessage(chatMessage);
             chatMessage.setMessageId(messageId);
         
             // 텍스트 메시지를 특정 채팅방에 전송
             WebSocketMessageDto responseMessage = new WebSocketMessageDto();
             responseMessage.setType("CHAT");
             responseMessage.setMessageId(chatMessage.getMessageId());
             responseMessage.setChatRoomId(chatMessage.getChatRoomId());
             responseMessage.setSenderId(chatMessage.getSenderId());
             responseMessage.setMessageContent(chatMessage.getMessageContent());
             responseMessage.setMessageType(chatMessage.getMessageType());
             responseMessage.setTimestamp(chatMessage.getCreatedAt());
             responseMessage.setIsRead(0);
             
             messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getChatRoomId(), responseMessage);
             
             return responseMessage;
         }
         
         return webSocketMessage;
    }

    @MessageMapping("/chat.addUser")
    public WebSocketMessageDto addUser(@Payload WebSocketMessageDto webSocketMessage, 
                                       SimpMessageHeaderAccessor headerAccessor) {
        // 세션에 사용자 저장
        headerAccessor.getSessionAttributes().put("username", webSocketMessage.getSenderId());

        // === 입장 시 읽음 처리 추가 ===
        chatMessageService.markMessagesAsRead(
            Long.valueOf(webSocketMessage.getChatRoomId()), 
            Long.valueOf(webSocketMessage.getSenderId())
        );

        // READ_UPDATE 브로드캐스트
        WebSocketMessageDto readUpdate = new WebSocketMessageDto();
        readUpdate.setType("READ_UPDATE");
        readUpdate.setChatRoomId(webSocketMessage.getChatRoomId());
        readUpdate.setSenderId(webSocketMessage.getSenderId());
        readUpdate.setTimestamp(new Timestamp(System.currentTimeMillis()));

        messagingTemplate.convertAndSend("/topic/chat/" + webSocketMessage.getChatRoomId(), readUpdate);

        // 입장 알림도 같이 전송
        messagingTemplate.convertAndSend("/topic/chat/" + webSocketMessage.getChatRoomId(), webSocketMessage);

        return webSocketMessage;
    }
    
    @MessageMapping("/chat.leaveRoom")
    public WebSocketMessageDto leaveRoom(@Payload WebSocketMessageDto webSocketMessage) {
        // 채팅방에서 사용자 제거 로직
        // 다른 사용자들에게 "사용자 퇴장" 알림 전송
        messagingTemplate.convertAndSend("/topic/chat/" + webSocketMessage.getChatRoomId(), webSocketMessage);
        return webSocketMessage;
    }
    
    @MessageMapping("/chat.readMessage")
    public WebSocketMessageDto readMessage(@Payload WebSocketMessageDto webSocketMessage) {
        try {
            System.out.println("=== WebSocket 읽음 처리 시작 ===");
            System.out.println("받은 메시지: " + webSocketMessage);
            System.out.println("chatRoomId: " + webSocketMessage.getChatRoomId());
            System.out.println("senderId: " + webSocketMessage.getSenderId());
            
            // 메시지 읽음 처리 (is_read = 1 → 0)
            chatMessageService.markMessagesAsRead(
                Long.valueOf(webSocketMessage.getChatRoomId()), 
                Long.valueOf(webSocketMessage.getSenderId())
            );
            
            // 읽음 상태 업데이트를 모든 사용자에게 전송
            WebSocketMessageDto readUpdate = new WebSocketMessageDto();
            readUpdate.setType("READ_UPDATE");
            readUpdate.setChatRoomId(webSocketMessage.getChatRoomId());
            readUpdate.setSenderId(webSocketMessage.getSenderId());
            readUpdate.setTimestamp(new Timestamp(System.currentTimeMillis()));
            
            messagingTemplate.convertAndSend("/topic/chat/" + webSocketMessage.getChatRoomId(), readUpdate);
            
            System.out.println("=== WebSocket 읽음 처리 완료 ===");
            return readUpdate;
        } catch (NumberFormatException e) {
            System.out.println("=== WebSocket 읽음 처리 오류 ===");
            System.out.println("chatRoomId: " + webSocketMessage.getChatRoomId());
            System.out.println("senderId: " + webSocketMessage.getSenderId());
            System.out.println("오류 메시지: " + e.getMessage());
            e.printStackTrace();
            return webSocketMessage;
        } catch (Exception e) {
            System.out.println("=== WebSocket 읽음 처리 일반 오류 ===");
            System.out.println("오류 메시지: " + e.getMessage());
            e.printStackTrace();
            return webSocketMessage;
        }
    }
} 