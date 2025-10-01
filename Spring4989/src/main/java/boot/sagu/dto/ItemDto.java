package boot.sagu.dto;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Alias("item")
public class ItemDto {

   private Long itemId;
   private Long postId;
   @JsonProperty("categoryId")
   private int categoryId;
   private String conditions;
}
