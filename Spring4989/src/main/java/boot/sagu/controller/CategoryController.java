package boot.sagu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.sagu.dto.CategoryDto;
import boot.sagu.service.CategoryService;

@RestController
@RequestMapping("/category")
public class CategoryController {
	
	@Autowired
	CategoryService categoryService;

	@GetMapping("/category")
	public List<CategoryDto> getParentCategory()
	{
		return categoryService.getParentCategory();
	}
	
	@GetMapping("/child")
	public List<CategoryDto> getChildCategory(@RequestParam("parentId") int parentId)
	{
		return categoryService.getChildCategory(parentId);
	}
}
