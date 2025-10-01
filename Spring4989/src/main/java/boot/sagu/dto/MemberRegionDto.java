package boot.sagu.dto;

import lombok.Data;

@Data
public class MemberRegionDto {
    private int memberId;
    private int regionId;
    private int isPrimary; // is_primary는 백엔드에서 결정
}