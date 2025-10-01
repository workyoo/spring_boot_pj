package boot.sagu.controller;

import boot.sagu.dto.ReviewDto;
import boot.sagu.service.ReviewServiceInter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/review")
public class ReviewController {
    
    @Autowired
    private ReviewServiceInter reviewService;
    
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createReview(@RequestBody Map<String, Object> requestMap) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("=== 후기 작성 요청 시작 ===");
        System.out.println("받은 Map 데이터: " + requestMap);
        
        // Map에서 직접 데이터 추출
        Long postId = null;
        Long reviewerId = null;
        Long reviewOppositeId = null;
        Integer rating = null;
        String comment = null;
        
        try {
            if (requestMap.get("postId") != null) {
                postId = Long.valueOf(requestMap.get("postId").toString());
            }
            if (requestMap.get("reviewerId") != null) {
                reviewerId = Long.valueOf(requestMap.get("reviewerId").toString());
            }
            if (requestMap.get("reviewOppositeId") != null) {
                reviewOppositeId = Long.valueOf(requestMap.get("reviewOppositeId").toString());
            }
            if (requestMap.get("rating") != null) {
                rating = Integer.valueOf(requestMap.get("rating").toString());
            }
            if (requestMap.get("comment") != null) {
                comment = requestMap.get("comment").toString();
            }
        } catch (NumberFormatException e) {
            System.err.println("숫자 변환 실패: " + e.getMessage());
        }
        
        System.out.println("추출된 데이터:");
        System.out.println("postId: " + postId + " (타입: " + (postId != null ? postId.getClass().getSimpleName() : "null") + ")");
        System.out.println("reviewerId: " + reviewerId + " (타입: " + (reviewerId != null ? reviewerId.getClass().getSimpleName() : "null") + ")");
        System.out.println("reviewOppositeId: " + reviewOppositeId + " (타입: " + (reviewOppositeId != null ? reviewOppositeId.getClass().getSimpleName() : "null") + ")");
        System.out.println("rating: " + rating + " (타입: " + (rating != null ? rating.getClass().getSimpleName() : "null") + ")");
        System.out.println("comment: " + comment + " (타입: " + (comment != null ? comment.getClass().getSimpleName() : "null") + ")");
        
        // 필수 데이터 검증
        if (postId == null) {
            System.out.println("❌ postId가 null입니다!");
            response.put("success", false);
            response.put("message", "게시글 ID가 필요합니다.");
            return ResponseEntity.badRequest().body(response);
        }
        if (reviewerId == null) {
            System.out.println("❌ reviewerId가 null입니다!");
            response.put("success", false);
            response.put("message", "후기 작성자 ID가 필요합니다.");
            return ResponseEntity.badRequest().body(response);
        }
        if (reviewOppositeId == null) {
            System.out.println("❌ reviewOppositeId가 null입니다!");
            response.put("success", false);
            response.put("message", "후기 대상자 ID가 필요합니다.");
            return ResponseEntity.badRequest().body(response);
        }
        if (rating == null || rating < 1 || rating > 10) {
            System.out.println("❌ rating이 범위를 벗어났습니다: " + rating);
            response.put("success", false);
            response.put("message", "평점은 1~10점 사이여야 합니다.");
            return ResponseEntity.badRequest().body(response);
        }
        if (comment == null || comment.trim().isEmpty()) {
            System.out.println("❌ comment가 비어있습니다!");
            response.put("success", false);
            response.put("message", "후기 내용을 입력해주세요.");
            return ResponseEntity.badRequest().body(response);
        }
        
        System.out.println("✅ 모든 검증을 통과했습니다!");
        
        // ReviewDto 생성
        ReviewDto reviewDto = new ReviewDto(postId, reviewerId, reviewOppositeId, rating, comment);
        
        try {
            boolean success = reviewService.createReview(reviewDto);
            
            if (success) {
                System.out.println("✅ 후기 작성 성공");
                response.put("success", true);
                response.put("message", "후기가 성공적으로 작성되었습니다.");
            } else {
                System.out.println("❌ 후기 작성 실패");
                response.put("success", false);
                response.put("message", "후기 작성에 실패했습니다.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 후기 작성 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "후기 작성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 후기 존재 여부 확인 API 추가
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkReviewExists(
            @RequestParam(name = "postId") Long postId,
            @RequestParam(name = "reviewerId") Long reviewerId,
            @RequestParam(name = "reviewOppositeId") Long reviewOppositeId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean exists = reviewService.checkReviewExists(postId, reviewerId, reviewOppositeId);
            response.put("success", true);
            response.put("exists", exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 후기 존재 여부 확인 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "후기 존재 여부 확인 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
