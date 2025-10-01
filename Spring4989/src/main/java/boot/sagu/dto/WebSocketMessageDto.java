package boot.sagu.dto;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class WebSocketMessageDto {
    private String type; // "CHAT", "JOIN", "LEAVE" 등
    private Long chatRoomId;
    private Long senderId;
    private String messageContent;
    private String messageType;
    private Long messageId;
    private Timestamp timestamp;
    private Integer isRead;
    private Timestamp deletedAt;
} 