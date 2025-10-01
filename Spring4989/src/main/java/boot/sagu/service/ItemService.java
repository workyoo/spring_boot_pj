package boot.sagu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import boot.sagu.dto.ItemDto;
import boot.sagu.mapper.ItemMapperInter;

@Service
public class ItemService implements ItemServiceInter {

	@Autowired
	ItemMapperInter itemMapper;

	@Override
	public ItemDto getOneItemData(@RequestParam("postId") Long postId) {
		// TODO Auto-generated method stub
		System.out.println("요청 받은 item postId: " + postId);
		
		ItemDto idto =itemMapper.getOneItemData(postId);
		System.out.println("조회 결과: " + idto);
		return idto;
	}

}
