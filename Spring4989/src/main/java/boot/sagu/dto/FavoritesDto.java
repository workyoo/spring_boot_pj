package boot.sagu.dto;

import java.sql.Timestamp;

public class FavoritesDto {
    
    private int favoriteId;        // 찜 ID
    private int memberId;          // 회원 ID
    private int postId;            // 게시글 ID
    private Timestamp createdAt;    // 찜 등록일
    
    // 기본 생성자
    public FavoritesDto() {}
    
    // 전체 생성자
    public FavoritesDto(int favoriteId, int memberId, int postId, Timestamp createdAt) {
        this.favoriteId = favoriteId;
        this.memberId = memberId;
        this.postId = postId;
        this.createdAt = createdAt;
    }
    
    // Getter와 Setter
    public int getFavoriteId() {
        return favoriteId;
    }
    
    public void setFavoriteId(int favoriteId) {
        this.favoriteId = favoriteId;
    }
    
    public int getMemberId() {
        return memberId;
    }
    
    public void setMemberId(int memberId) {
        this.memberId = memberId;
    }
    
    public int getPostId() {
        return postId;
    }
    
    public void setPostId(int postId) {
        this.postId = postId;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "FavoritesDto{" +
                "favoriteId=" + favoriteId +
                ", memberId=" + memberId +
                ", postId=" + postId +
                ", createdAt=" + createdAt +
                '}';
    }
}