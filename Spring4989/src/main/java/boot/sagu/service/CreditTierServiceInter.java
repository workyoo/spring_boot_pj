package boot.sagu.service;

import boot.sagu.dto.CreditTierDto;

public interface CreditTierServiceInter {
    
    // 회원의 신용도 등급 정보 조회
    public CreditTierDto getCreditTierByMemberId(int memberId);
    
    // 회원의 신용도 등급 계산 및 업데이트
    public CreditTierDto calculateAndUpdateCreditTier(int memberId);
    
    // 모든 회원의 신용도 등급 일괄 업데이트
    public void updateAllMembersCreditTier();
}
