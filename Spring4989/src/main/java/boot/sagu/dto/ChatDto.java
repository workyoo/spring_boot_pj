package boot.sagu.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("chat")
public class ChatDto {

	private Long chatRoomId;
	private Long productId;
	private Long sellerId;
	private Long buyerId;
	private Timestamp createdAt;
	private Timestamp lastMessageAt;
	private String opponentNickname;
	private int buyerExitStatus;
	private int sellerExitStatus;
	private Timestamp deletedAt;
	
}
