package boot.sagu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.sagu.dto.ItemDto;
import boot.sagu.service.ItemService;

@RestController
@RequestMapping("/goods")
public class ItemController {
	
	@Autowired
	ItemService itemService;
	
	

}
