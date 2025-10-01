package boot.sagu.mapper;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.CarDto;

public interface CarMapperInter {
	public void insertCar(CarDto cdto);
	public CarDto getOneCarData(@RequestParam("postId") Long postId);
}
