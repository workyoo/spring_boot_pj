package boot.sagu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.sagu.dto.RealEstateDto;
import boot.sagu.service.EstateService;

@RestController
@RequestMapping("/estate")
public class EstateController {
	
	@Autowired
	EstateService estateService;
	
	

}
