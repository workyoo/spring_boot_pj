package boot.sagu.mapper;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.RealEstateDto;

public interface EstateMapperInter {
	public void insertEstate(RealEstateDto rdto);
	public RealEstateDto getOneEstateData(@RequestParam("postId") Long postId);
}
