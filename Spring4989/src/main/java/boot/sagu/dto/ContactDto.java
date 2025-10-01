package boot.sagu.dto;

import java.sql.Timestamp;
import lombok.Data;

@Data
public class ContactDto {
    private Long contactId;
    private String name;
    private String email;
    private String subject;
    private String message;
    private String status; // PENDING, PROCESSING, COMPLETED
    private String adminReply;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private Long memberId; // 로그인한 사용자의 경우
    private Integer isRead; // 읽음 여부 (0: 읽지 않음, 1: 읽음)
}
