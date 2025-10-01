package boot.sagu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import boot.sagu.dto.CreditTierDto;
import boot.sagu.mapper.CreditTierMapper;
import boot.sagu.mapper.MemberMapper;

import java.util.List;

@Service
public class CreditTierService implements CreditTierServiceInter {
    
    @Autowired
    private CreditTierMapper creditTierMapper;
    
    @Autowired
    private MemberMapper memberMapper;
    
    @Override
    public CreditTierDto getCreditTierByMemberId(int memberId) {
        try {
            System.out.println("🔍 CreditTierService.getCreditTierByMemberId 호출 - memberId: " + memberId);
            CreditTierDto result = creditTierMapper.getCreditTierByMemberId(memberId);
            System.out.println("✅ getCreditTierByMemberId 결과: " + (result != null ? result.getTier() : "null"));
            return result;
        } catch (Exception e) {
            System.err.println("❌ getCreditTierByMemberId 오류: " + e.getMessage());
            throw e;
        }
    }
    
    @Override
    public CreditTierDto calculateAndUpdateCreditTier(int memberId) {
        try {
            System.out.println("🔄 CreditTierService.calculateAndUpdateCreditTier 시작 - memberId: " + memberId);
            
            // 1. 기본 데이터 조회
            System.out.println("📊 기본 데이터 조회 중...");
            int completedTransactions = creditTierMapper.getCompletedTransactionCount(memberId);
            Double averageRating = creditTierMapper.getAverageRating(memberId);
            int reviewCount = creditTierMapper.getReviewCount(memberId);
            int weightedReportCount = creditTierMapper.getWeightedReportCount(memberId);
            
            System.out.println("   - 완료된 거래: " + completedTransactions + "건");
            System.out.println("   - 평균 평점: " + averageRating);
            System.out.println("   - 리뷰 수: " + reviewCount + "건");
            System.out.println("   - 가중 신고: " + weightedReportCount + "건");
            
            // 2. 점수 계산
            System.out.println("🧮 점수 계산 중...");
            int transactionScore = calculateTransactionScore(completedTransactions);
            int ratingScore = calculateRatingScore(averageRating, reviewCount);
            int penaltyScore = calculatePenaltyScore(weightedReportCount);
            int totalScore = transactionScore + ratingScore + penaltyScore;
            
            System.out.println("   - 거래량 점수: " + transactionScore + "점");
            System.out.println("   - 평점 점수: " + ratingScore + "점");
            System.out.println("   - 패널티 점수: " + penaltyScore + "점");
            System.out.println("   - 총점: " + totalScore + "점");
            
            // 3. 티어 결정
            String tier = determineTier(totalScore, completedTransactions);
            System.out.println("🏆 결정된 티어: " + tier + " (거래횟수: " + completedTransactions + "건)");
            
            // 4. DTO 생성
            CreditTierDto creditTierDto = new CreditTierDto();
            creditTierDto.setMemberId(memberId);
            creditTierDto.setTier(tier);
            creditTierDto.setTotalScore(totalScore);
            creditTierDto.setTransactionScore(transactionScore);
            creditTierDto.setRatingScore(ratingScore);
            creditTierDto.setPenaltyScore(penaltyScore);
            creditTierDto.setCompletedTransactions(completedTransactions);
            creditTierDto.setAverageRating(averageRating != null ? averageRating : 0.0);
            creditTierDto.setReportCount(weightedReportCount);
            
            // 5. DB 업데이트
            System.out.println("💾 DB 업데이트 중...");
            creditTierMapper.upsertCreditTier(creditTierDto);
            creditTierMapper.updateMemberTier(memberId, tier);
            System.out.println("✅ DB 업데이트 완료");
            
            return creditTierDto;
        } catch (Exception e) {
            System.err.println("❌ calculateAndUpdateCreditTier 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public void updateAllMembersCreditTier() {
        // 모든 회원의 ID 조회 (페이징 없이)
        List<Integer> memberIds = memberMapper.getAllMemberIds();
        
        for (Integer memberId : memberIds) {
            try {
                calculateAndUpdateCreditTier(memberId);
            } catch (Exception e) {
                System.err.println("회원 ID " + memberId + "의 신용도 등급 업데이트 실패: " + e.getMessage());
            }
        }
    }
    
    // 거래량 점수 계산 (0~600) - 거래량 비중 확대
    private int calculateTransactionScore(int completedTransactions) {
        // 최소 거래 완료 횟수 제한 완화
        if (completedTransactions < 1) {
            return 0;  // 1건 미만은 0점
        }
        
        // 거래량 증가에 따른 점수 증가 강화 (단순화)
        if (completedTransactions <= 5) {
            return completedTransactions * 8;  // 1건=8점, 2건=16점, 3건=24점...
        } else if (completedTransactions <= 15) {
            return 40 + (completedTransactions - 5) * 12;  // 12점씩
        } else if (completedTransactions <= 30) {
            return 160 + (completedTransactions - 15) * 16;  // 16점씩
        } else {
            return 400 + (completedTransactions - 30) * 20;  // 20점씩
        }
    }
    
    // 평점 점수 계산 (0~450) 
    private int calculateRatingScore(Double averageRating, int reviewCount) {
        if (averageRating == null || reviewCount < 3) {  // 최소 3개 리뷰 필요
            return 0;
        }
        
        // 베이지안 보정 강화
        double m = 15;  // 보정 강도 증가 (10 → 15)
        double C = 6.5; // 플랫폼 기본 기대치 하향 (7.0 → 6.5)
        double R = averageRating;
        int v = reviewCount;
        
        double B = (v / (v + m)) * R + (m / (v + m)) * C;
        
        // 0~10.0 → 0~300 (평점 점수 축소, 거래량 점수와 균형)
        // 0점 = 0점, 10점 = 300점
        return (int) ((B / 10.0) * 300);
    }
    
    // 신고 패널티 계산 (0 ~ -200) 
    private int calculatePenaltyScore(int weightedReportCount) {
        int weighted = Math.min(weightedReportCount, 10);
        return -25 * weighted;  // -20 → -25로 패널티 강화
    }
    
    // 티어 결정 - 거래 횟수 제한 추가
    private String determineTier(int totalScore, int completedTransactions) {
        if (totalScore >= 800 && completedTransactions >= 20) {
            return "거래왕";
        } else if (totalScore >= 600 && completedTransactions >= 15) {
            return "마스터";
        } else if (totalScore >= 400 && completedTransactions >= 10) {
            return "장인";
        } else if (totalScore >= 200 && completedTransactions >= 5) {
            return "거래꾼";
        } else {
            return "초보상인";
        }
    }
}
