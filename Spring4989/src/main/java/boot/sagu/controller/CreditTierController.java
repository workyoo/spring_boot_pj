package boot.sagu.controller;

import boot.sagu.dto.CreditTierDto;
import boot.sagu.service.CreditTierServiceInter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/credit-tier")
public class CreditTierController {
    
    @Autowired
    private CreditTierServiceInter creditTierService;
    
    // 테스트용 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "CreditTierController 정상 작동!");
        return ResponseEntity.ok(response);
    }
    
    // 회원의 신용도 등급 정보 조회
    @GetMapping("/{memberId}")
    public ResponseEntity<Map<String, Object>> getCreditTier(@PathVariable("memberId") int memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("🔍 신용도 등급 조회 시작 - memberId: " + memberId);
            
            CreditTierDto creditTier = creditTierService.getCreditTierByMemberId(memberId);
            
            if (creditTier != null) {
                System.out.println("✅ 기존 신용도 등급 정보 발견: " + creditTier.getTier());
                response.put("success", true);
                response.put("data", creditTier);
            } else {
                System.out.println("🔄 신용도 등급 정보가 없어 새로 계산합니다.");
                // 신용도 등급 정보가 없으면 새로 계산
                creditTier = creditTierService.calculateAndUpdateCreditTier(memberId);
                response.put("success", true);
                response.put("data", creditTier);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 신용도 등급 조회 중 오류 발생:");
            System.err.println("   - memberId: " + memberId);
            System.err.println("   - 오류 메시지: " + e.getMessage());
            e.printStackTrace();
            
            response.put("success", false);
            response.put("message", "신용도 등급 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 회원의 신용도 등급 재계산 및 업데이트
    @PostMapping("/{memberId}/recalculate")
    public ResponseEntity<Map<String, Object>> recalculateCreditTier(@PathVariable("memberId") int memberId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            CreditTierDto creditTier = creditTierService.calculateAndUpdateCreditTier(memberId);
            
            response.put("success", true);
            response.put("data", creditTier);
            response.put("message", "신용도 등급이 성공적으로 업데이트되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "신용도 등급 계산 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 모든 회원의 신용도 등급 일괄 업데이트 (관리자용)
    @PostMapping("/update-all")
    public ResponseEntity<Map<String, Object>> updateAllMembersCreditTier() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            creditTierService.updateAllMembersCreditTier();
            
            response.put("success", true);
            response.put("message", "모든 회원의 신용도 등급이 성공적으로 업데이트되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "일괄 업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
