	package boot.sagu.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Alias("auctionBid")
public class AuctionDto {

    private long bidId;        
    private long postId;       // post_id → postId (경매글 ID)
    private long bidderId;     // bidder_id → bidderId (입찰자 ID)
    @JsonProperty("bid_amount")
    private BigDecimal bidAmount; // bid_amount → bidAmount (입찰 금액)
    
    private Timestamp bidTime; // bid_time → bidTime (입찰 시간)
    
}
