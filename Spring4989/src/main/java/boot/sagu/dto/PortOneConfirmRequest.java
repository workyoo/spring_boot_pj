package boot.sagu.dto;

import lombok.Data;

@Data
public class PortOneConfirmRequest {

	private long postId;
	private long memberId;
	private String impUid;
	private String merchantUid;
	private int paidAmount; // 프론트가 보내는 결제금액(검증시 참고용)
}
