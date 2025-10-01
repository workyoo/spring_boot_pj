package boot.sagu.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("GuaranteeDTO")
public class AuctionGuaranteeDTO {

	private Long guaranteeId;
	private Long postId;
	private Long memberId;
	private BigDecimal amount;
	private String impUid;
	private String merchantUid;
	private String status;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss",timezone = "Asia/Seoul")
	private Timestamp created_at;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss",timezone = "Asia/Seoul")
	private Timestamp refunded_at;
	
	
}
