package boot.sagu.mapper;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.ChatDto;

@Mapper
public interface ChatMapper {

	public List<ChatDto> getAllChat(@Param("login_id") String login_id);
	
	public List<Map<String, Object>> getChatRoomsWithLastMessage(@Param("memberId") Long memberId);
	
	public Map<String, Object> getOtherUserInChatRoom(@Param("chatRoomId") Long chatRoomId, 
            @Param("currentMemberId") Long currentMemberId);
	
	public void updateExitStatus(@Param("chatRoomId") Long chatRoomId, 
			@Param("memberId") Long memberId,
			@Param("buyerId") Long buyerId,
			@Param("sellerId") Long sellerId);
	
	public Map<String, Integer> getChatroomExitStatus(@Param("chatRoomId") Long chatRoomId);
	
	public Map<String, Object> getChatRoomInfoById(@Param("chatRoomId") Long chatRoomId);
	
	public String getMemberNickname(@Param("memberId") Long memberId);
	
	public void deleteOldChatRooms(@Param("hours") int hours);
	
	public Map<String, Long> getSellerAndBuyerIds(@Param("chatRoomId") Long chatRoomId);
	
    public void insertChatroom(ChatDto chatDto);

    public Long findChatroomByProductIdAndBuyerId(@Param("productId") Long productId, @Param("buyerId") Long buyerId);
    
    public Map<String, Object> getChatRoomById(@Param("chatRoomId") Long chatRoomId, @Param("memberId") Long memberId);
	
    public int countChat();
}
