package boot.sagu.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
//@Alias("message")
public class ChatMessageDto {
	
	private Long messageId;
	private Long chatRoomId;
	private Long senderId;
	private String messageType;
	private String messageContent;
	private String fileUrl; // 추가
	private int isRead;
	private Timestamp deletedAt;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private Timestamp createdAt;
	
	
}
