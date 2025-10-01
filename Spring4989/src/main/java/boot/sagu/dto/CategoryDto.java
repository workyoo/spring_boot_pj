package boot.sagu.dto;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Alias("category")
public class CategoryDto {

	@JsonProperty("categoryId")
	private int categoryId;
	
	@JsonProperty("parentId")
	private int parentId;
	
	private String name;
}
