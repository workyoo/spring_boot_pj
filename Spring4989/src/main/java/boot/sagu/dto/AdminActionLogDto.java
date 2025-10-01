package boot.sagu.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminActionLogDto {
    private Long logId;
    private Long adminId;
    private String actionType;
    private String targetEntityType;
    private Long targetEntityId;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}
