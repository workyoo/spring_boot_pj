package boot.sagu.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import lombok.Data;

@Data
@Alias("Escrow")
public class EscrowOrderDTO {

	  private Long id;
	  private Long postId;
	  private Long buyerId;
	  private String merchantUid;
	  private BigDecimal amount;   // (최종가 - 보증금)
	  private String status;       // CREATED | PENDING | PAID | ...
	  private String impUid;       // 결제 후 세팅
	  private Timestamp createdAt;
	  private Timestamp paidAt;
}
