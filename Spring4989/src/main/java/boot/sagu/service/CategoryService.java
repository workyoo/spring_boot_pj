package boot.sagu.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.CategoryDto;
import boot.sagu.mapper.CategoryMapperInter;

@Service
public class CategoryService implements CategoryServiceInter{

	@Autowired
	CategoryMapperInter categoryMapper;
	
	@Override
	public List<CategoryDto> getParentCategory() {
		// TODO Auto-generated method stub
		return categoryMapper.getParentCategory();
	}

	@Override
	public List<CategoryDto> getChildCategory(@RequestParam("parentId") int parentId) {
		// TODO Auto-generated method stub
		return categoryMapper.getChildCategory(parentId);
	}

	
}
