package boot.sagu.service;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.ItemDto;

public interface ItemServiceInter {
	public ItemDto getOneItemData(@RequestParam("postId") Long postId);
}
