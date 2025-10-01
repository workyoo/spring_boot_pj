package boot.sagu.mapper;

import java.util.List;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.CategoryDto;

public interface CategoryMapperInter {
	
	public List<CategoryDto> getParentCategory();
	public List<CategoryDto> getChildCategory(@RequestParam("parentId") int parentId);
	public CategoryDto getParentByCategoryId(@RequestParam("categoryId") int categoryId);
	
}
