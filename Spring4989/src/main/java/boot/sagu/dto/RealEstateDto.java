package boot.sagu.dto;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Alias("estate")
public class RealEstateDto {
	
	private Long estateId;
	private Long postId;
	@JsonProperty("propertyType")
	private String propertyType;
	private float area;
	private int rooms;
	private int floor;
	@JsonProperty("dealType")
	private String dealType;

}
