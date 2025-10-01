package boot.sagu.dto;

import java.sql.Timestamp;
import lombok.Data;

@Data
public class ChatDeclarationDto {

	private Integer declarationId;
	private Integer declarationChatRoomId;
	private Integer declarationMemberId;
	private Integer declarationOppositeMemberId;
	private String declarationType;
	private String declarationContent;
	private Timestamp declarationTime;
	private String status;
	private String result;

	// 기본 생성자 (MyBatis에서 필수)
	public ChatDeclarationDto() {
		System.out.println(">>> [DEBUG] ChatDeclarationDto 기본 생성자 호출됨");
	}

	// 전체 생성자
	public ChatDeclarationDto(Integer declarationId, Integer declarationChatRoomId, 
							Integer declarationMemberId, Integer declarationOppositeMemberId,
							String declarationType, String declarationContent, 
							Timestamp declarationTime, String status, String result) {
		System.out.println(">>> [DEBUG] ChatDeclarationDto 전체 생성자 호출됨");
		this.declarationId = declarationId;
		this.declarationChatRoomId = declarationChatRoomId;
		this.declarationMemberId = declarationMemberId;
		this.declarationOppositeMemberId = declarationOppositeMemberId;
		this.declarationType = declarationType;
		this.declarationContent = declarationContent;
		this.declarationTime = declarationTime;
		this.status = status;
		this.result = result;
	}

	@Override
	public String toString() {
		return "ChatDeclarationDto{" +
				"declarationId=" + declarationId +
				", declarationChatRoomId=" + declarationChatRoomId +
				", declarationMemberId=" + declarationMemberId +
				", declarationOppositeMemberId=" + declarationOppositeMemberId +
				", declarationType='" + declarationType + '\'' +
				", declarationContent='" + declarationContent + '\'' +
				", declarationTime=" + declarationTime +
				", status='" + status + '\'' +
				", result='" + result + '\'' +
				'}';
	}
}
