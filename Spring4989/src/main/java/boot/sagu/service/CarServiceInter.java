package boot.sagu.service;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.CarDto;

public interface CarServiceInter {
	public CarDto getOneCarData(@RequestParam("postId") Long postId);
}
