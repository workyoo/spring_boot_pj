package boot.sagu.dto;

import java.sql.Timestamp;
import lombok.Data;

@Data
public class SocialAccountDto {
    private long socialAccountId;
    private long memberId;
    private String provider;
    private String providerId;
    private Timestamp createdAt;
}