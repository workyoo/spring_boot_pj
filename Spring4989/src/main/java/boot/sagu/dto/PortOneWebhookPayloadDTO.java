package boot.sagu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class PortOneWebhookPayloadDTO {

	 @JsonProperty("imp_uid")     // 웹훅 JSON: imp_uid
	    private String impUid;

	    @JsonProperty("merchant_uid")// 웹훅 JSON: merchant_uid
	    private String merchantUid;

	    // 아래 두 값은 webhooks에서 직접 안 넘어올 수도 있다
	    // 우리는 merchant_uid 규칙("guarantee_{postId}_{memberId}")로 파싱하거나
	    // 프런트에서 custom_data로 넣어 보내는 방식 중 하나를 사용한다
	    private Long postId;
	    private Long memberId;
}
