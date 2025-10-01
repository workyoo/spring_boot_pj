package boot.sagu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDto {
    @JsonProperty("reviewId")
    private Long reviewId;
    
    @JsonProperty("postId")
    private Long postId;
    
    @JsonProperty("reviewerId")
    private Long reviewerId;
    
    @JsonProperty("reviewOppositeId")
    private Long reviewOppositeId;
    
    @JsonProperty("rating")
    private int rating;
    
    @JsonProperty("comment")
    private String comment;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    public ReviewDto() {}
    
    public ReviewDto(Long postId, Long reviewerId, Long reviewOppositeId, int rating, String comment) {
        this.postId = postId;
        this.reviewerId = reviewerId;
        this.reviewOppositeId = reviewOppositeId;
        this.rating = rating;
        this.comment = comment;
    }
}
