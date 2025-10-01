package boot.sagu.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import boot.sagu.dto.CreditTierDto;

@Mapper
public interface CreditTierMapper {
    
    // 회원의 신용도 등급 정보 조회
    CreditTierDto getCreditTierByMemberId(@Param("memberId") int memberId);
    
    // 회원의 완료된 거래 수 조회 (판매자 기준)
    int getCompletedTransactionCount(@Param("memberId") int memberId);
    
    // 회원의 평균 평점 조회 (1~10 스케일)
    Double getAverageRating(@Param("memberId") int memberId);
    
    // 회원의 리뷰 개수 조회
    int getReviewCount(@Param("memberId") int memberId);
    
    // 회원의 신고 횟수 조회 (가중치 적용)
    int getWeightedReportCount(@Param("memberId") int memberId);
    
    // 회원의 티어 업데이트
    void updateMemberTier(@Param("memberId") int memberId, @Param("tier") String tier);
    
    // 신용도 등급 정보 저장/업데이트
    void upsertCreditTier(CreditTierDto creditTierDto);
}
