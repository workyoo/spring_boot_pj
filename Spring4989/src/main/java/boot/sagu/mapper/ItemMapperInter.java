package boot.sagu.mapper;

import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.ItemDto;

public interface ItemMapperInter {
	public void insertItem(ItemDto idto);
	public ItemDto getOneItemData(@RequestParam("postId") Long postId);
}
