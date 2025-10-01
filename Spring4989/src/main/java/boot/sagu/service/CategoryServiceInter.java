package boot.sagu.service;

import java.util.List;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.CategoryDto;

public interface CategoryServiceInter {

	public List<CategoryDto> getParentCategory();
	public List<CategoryDto> getChildCategory(@RequestParam("parentId") int parentId);
	
}
