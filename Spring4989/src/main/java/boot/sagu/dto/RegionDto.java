package boot.sagu.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class RegionDto {

	private String address;
	private int regionId;
	private String province;
	private String city;
	private String district;
	private String town;
	private double latitude;
	private double longitude;
}
