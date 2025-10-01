package boot.sagu.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.sagu.dto.CarDto;
import boot.sagu.service.CarService;

@RestController
@RequestMapping("/cars")
public class CarController {
	
	@Autowired
	CarService carService;

//	@GetMapping("/detail")
//	public CarDto getOneCarData(@RequestParam("postId") Long postId)
//	{
//		return carService.getOneCarData(postId);
//	}
}
