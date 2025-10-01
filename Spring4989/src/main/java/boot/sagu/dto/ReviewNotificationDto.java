package boot.sagu.dto;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class ReviewNotificationDto {
    private Long notificationId;
    private Long memberId;
    private Long reviewerId;
    private Long postId;
    private Long reviewId;
    private String message;
    private Integer isRead;
    private Timestamp createdAt;
    
    // 추가 정보 (JOIN을 위한 필드)
    private String reviewerNickname; // 후기 작성자 닉네임
    private String postTitle; // 게시글 제목
}

