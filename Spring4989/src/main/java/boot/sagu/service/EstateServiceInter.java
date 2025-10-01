package boot.sagu.service;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.RealEstateDto;

public interface EstateServiceInter {
	public RealEstateDto getOneEstateData(@RequestParam("postId") Long postId);
}
