package boot.sagu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import boot.sagu.dto.ReviewDto;
import boot.sagu.mapper.ReviewMapperInter;
import boot.sagu.service.CreditTierServiceInter;

@Service
public class ReviewService implements ReviewServiceInter {
    
    @Autowired
    private ReviewMapperInter reviewMapper;
    
    @Autowired
    private CreditTierServiceInter creditTierService;
    
    @Override
    public boolean createReview(ReviewDto reviewDto) {
        System.out.println("=== ReviewService.createReview 시작 ===");
        System.out.println("입력 데이터: " + reviewDto);
        
        try {
            int result = reviewMapper.insertReview(reviewDto);
            System.out.println("Mapper 결과: " + result);
            
            if (result > 0) {
                System.out.println("✅ 후기 삽입 성공");
                
                // 후기 작성 후 신용도 등급 업데이트
                try {
                    creditTierService.calculateAndUpdateCreditTier(reviewDto.getReviewOppositeId().intValue());
                    System.out.println("✅ 신용도 등급 업데이트 성공");
                } catch (Exception e) {
                    System.err.println("❌ 신용도 등급 업데이트 실패: " + e.getMessage());
                    // 신용도 등급 업데이트 실패는 후기 작성 실패로 처리하지 않음
                }
                
                return true;
            } else {
                System.out.println("❌ 후기 삽입 실패: result = " + result);
                return false;
            }
        } catch (Exception e) {
            System.err.println("❌ ReviewService에서 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    @Override
    public boolean checkReviewExists(Long postId, Long reviewerId, Long reviewOppositeId) {
        System.out.println("=== ReviewService.checkReviewExists 시작 ===");
        System.out.println("postId: " + postId + ", reviewerId: " + reviewerId + ", reviewOppositeId: " + reviewOppositeId);
        
        try {
            int count = reviewMapper.checkReviewExists(postId, reviewerId, reviewOppositeId);
            boolean exists = count > 0;
            System.out.println("후기 존재 여부: " + exists + " (count: " + count + ")");
            return exists;
        } catch (Exception e) {
            System.err.println("❌ ReviewService.checkReviewExists에서 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
