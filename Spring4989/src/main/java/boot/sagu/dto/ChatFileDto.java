package boot.sagu.dto;

import java.sql.Timestamp;

import org.apache.ibatis.type.Alias;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
@Alias("file")
public class ChatFileDto {
    private Long fileId;
    private Long chatRoomId;
    private Long messageId;
    private String fileUrl;
    private Long fileSize;
    private Timestamp deleted_at;
    @JsonFormat(pattern = "yyyyMMddHHmmss")
    private Timestamp uploadAt;
    private Timestamp createdAt;
 
}