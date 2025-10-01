package boot.sagu.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("posts")
public class PostsDto {

    private Long postId;         // post_id → postId
    private Long memberId;      // member_id → memberId
    private String title;
    private String content;     // content 필드 추가
    private Long buyerId;
    private BigDecimal price;
    private String tradeType;   // trade_type → tradeType
    private String status;
    private Timestamp auctionEndTime;  // auction_end_time → auctionEndTime
    private Long winnerId;      // winner_id → winnerId
    private int viewCount;      // view_count → viewCount
    private Timestamp createdAt; // created_at → createdAt
    private Timestamp updatedAt; // updated_at → updatedAt
    private String postType;    // post_type → postType (새로 추가)
    private String mainPhotoUrl; // 메인 이미지 URL
    private String image; // 메인 이미지 URL (alias)
    private int bidderCount; // 입찰자 수
    private String nickname;     // 닉네임
    private int location;
    private String detail_location;
    private double latitude;
    private double longitude;
    
    // ENUM 정의 (참고용)
    public enum TradeType {
        SALE, AUCTION, SHARE
    }
    
    public enum PostStatus {
        ON_SALE, RESERVED, SOLD
    }
    
 // 타입별 상세 (nullable)
    private CarDto car;               
    private RealEstateDto estate;     
    private ItemDto item;
}
