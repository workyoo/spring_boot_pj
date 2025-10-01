package boot.sagu.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.CarDto;
import boot.sagu.mapper.CarMapperInter;

@Service
public class CarService implements CarServiceInter{
	
	@Autowired
	CarMapperInter carMapper;

	@Override
	public CarDto getOneCarData(@RequestParam("postId") Long postId) {
		// TODO Auto-generated method stub
		CarDto cdto=carMapper.getOneCarData(postId);
		return cdto;
	}


	
}
