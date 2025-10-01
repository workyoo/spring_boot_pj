package boot.sagu.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Alias("report")
public class ReportsDto {
	
	private Long reportId;
	@JsonAlias({"reporterId"})
	private Long reporterId;
	@JsonAlias({"targetType"})
	private String targetType;
	@JsonAlias({"targetPostId"})// "POST" or "MEMBER"
    private Long targetPostId;
	@JsonAlias({"targetMemberId"})// targetType=POST일 때만 사용
    private Long targetMemberId; // targetType=MEMBER일 때만 사용
	private String reason;
	private String status;
	private Timestamp createdAt;
	
	

}
