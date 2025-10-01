package boot.sagu.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.ChatFileDto;

@Mapper
public interface ChatFileMapper {
    
    // 파일 정보 저장
    public void insertChatFile(ChatFileDto chatFileDto);
    
    // 메시지 ID로 파일 정보 조회
    public ChatFileDto getChatFileByMessageId(@Param("messageId") Long messageId);
    
    // 채팅방의 모든 파일 정보 조회
    public List<ChatFileDto> getChatFilesByRoomId(@Param("chatRoomId") Long chatRoomId);
    
    public void deleteFile(@Param("messageId") Long messageId);
    
    public void deleteOldChatFiles(@Param("hours") int hours);
    
    public List<String> getOldFilePaths(@Param("hours") int hours);
} 