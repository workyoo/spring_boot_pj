package boot.sagu.dto;

import java.sql.Timestamp;

public class ChatDeclarationResultNotificationDto {
    private Integer chatdeclarationresultId;
    private Integer chatdeclarationId;
    private Integer resultMemberId;
    private String resultContent;
    private Integer isRead;
    private Timestamp createdAt;
    
    // 추가 정보 (JOIN을 통해 가져올 정보)
    private String declarationType;
    private String declarationContent;
    private String reportedMemberNickname;
    private String reportedChatContent;
    
    // 후기 알림을 위한 추가 필드
    private String notificationType;
    private Integer postId;
    private Integer reviewId;
    private String reviewerNickname;
    private String postTitle;
    
    // 기본 생성자
    public ChatDeclarationResultNotificationDto() {}
    
    // Getter와 Setter
    public Integer getChatdeclarationresultId() {
        return chatdeclarationresultId;
    }
    
    public void setChatdeclarationresultId(Integer chatdeclarationresultId) {
        this.chatdeclarationresultId = chatdeclarationresultId;
    }
    
    public Integer getChatdeclarationId() {
        return chatdeclarationId;
    }
    
    public void setChatdeclarationId(Integer chatdeclarationId) {
        this.chatdeclarationId = chatdeclarationId;
    }
    
    public Integer getResultMemberId() {
        return resultMemberId;
    }
    
    public void setResultMemberId(Integer resultMemberId) {
        this.resultMemberId = resultMemberId;
    }
    
    public String getResultContent() {
        return resultContent;
    }
    
    public void setResultContent(String resultContent) {
        this.resultContent = resultContent;
    }
    
    public Integer getIsRead() {
        return isRead;
    }
    
    public void setIsRead(Integer isRead) {
        this.isRead = isRead;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getDeclarationType() {
        return declarationType;
    }
    
    public void setDeclarationType(String declarationType) {
        this.declarationType = declarationType;
    }
    
    public String getDeclarationContent() {
        return declarationContent;
    }
    
    public void setDeclarationContent(String declarationContent) {
        this.declarationContent = declarationContent;
    }
    
    public String getReportedMemberNickname() {
        return reportedMemberNickname;
    }
    
    public void setReportedMemberNickname(String reportedMemberNickname) {
        this.reportedMemberNickname = reportedMemberNickname;
    }
    
    public String getReportedChatContent() {
        return reportedChatContent;
    }
    
    public void setReportedChatContent(String reportedChatContent) {
        this.reportedChatContent = reportedChatContent;
    }
    
    public String getNotificationType() {
        return notificationType;
    }
    
    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }
    
    public Integer getPostId() {
        return postId;
    }
    
    public void setPostId(Integer postId) {
        this.postId = postId;
    }
    
    public Integer getReviewId() {
        return reviewId;
    }
    
    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }
    
    public String getReviewerNickname() {
        return reviewerNickname;
    }
    
    public void setReviewerNickname(String reviewerNickname) {
        this.reviewerNickname = reviewerNickname;
    }
    
    public String getPostTitle() {
        return postTitle;
    }
    
    public void setPostTitle(String postTitle) {
        this.postTitle = postTitle;
    }
    
    @Override
    public String toString() {
        return "ChatDeclarationResultNotificationDto{" +
                "chatdeclarationresultId=" + chatdeclarationresultId +
                ", chatdeclarationId=" + chatdeclarationId +
                ", resultMemberId=" + resultMemberId +
                ", resultContent='" + resultContent + '\'' +
                ", isRead=" + isRead +
                ", createdAt=" + createdAt +
                ", declarationType='" + declarationType + '\'' +
                ", declarationContent='" + declarationContent + '\'' +
                ", reportedMemberNickname='" + reportedMemberNickname + '\'' +
                ", reportedChatContent='" + reportedChatContent + '\'' +
                ", notificationType='" + notificationType + '\'' +
                ", postId=" + postId +
                ", reviewId=" + reviewId +
                ", reviewerNickname='" + reviewerNickname + '\'' +
                ", postTitle='" + postTitle + '\'' +
                '}';
    }
}
