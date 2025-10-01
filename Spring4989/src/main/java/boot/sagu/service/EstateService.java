package boot.sagu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.RealEstateDto;
import boot.sagu.mapper.EstateMapperInter;

@Service
public class EstateService implements EstateServiceInter {
	
	@Autowired
	EstateMapperInter estateMapper;

	@Override
	public RealEstateDto getOneEstateData(@RequestParam("postId") Long postId) {
		// TODO Auto-generated method stub
		RealEstateDto rdto=estateMapper.getOneEstateData(postId);
		
		return rdto;
	}

}
