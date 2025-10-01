package boot.sagu.controller;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import boot.sagu.service.CoolSmsService;

@RestController
public class SmsController {

    @Autowired
    private CoolSmsService coolSmsService;
    
    // 인증번호를 저장할 Map (실제 운영에서는 Redis 사용 권장)
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    // SMS 인증번호 발송
    @PostMapping("/sms/send")
    public ResponseEntity<?> sendSms(@RequestBody Map<String, String> request) {
        try {
            String phoneNumber = request.get("phoneNumber");
            
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("전화번호를 입력해주세요.");
            }
            
            // 6자리 인증번호 생성
            String verificationCode = generateVerificationCode();
            
            // 인증번호를 Map에 저장
            verificationCodes.put(phoneNumber, verificationCode);
            
            // CoolSMS로 실제 SMS 발송
            String messageText = "[사구팔구] 인증번호 [" + verificationCode + "] 를 입력해주세요.";
            coolSmsService.sendSms(phoneNumber, messageText);
            
            return ResponseEntity.ok("인증번호가 발송되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("SMS 발송 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // SMS 인증번호 확인
    @PostMapping("/sms/verify")
    public ResponseEntity<?> verifySms(@RequestBody Map<String, String> request) {
        try {
            String phoneNumber = request.get("phoneNumber");
            String code = request.get("code");
            
            if (phoneNumber == null || code == null) {
                return ResponseEntity.badRequest().body("전화번호와 인증번호를 모두 입력해주세요.");
            }
            
            boolean isValid = verifyCode(phoneNumber, code);
            
            if (isValid) {
                return ResponseEntity.ok("인증이 완료되었습니다!");
            } else {
                return ResponseEntity.status(400).body("인증번호가 올바르지 않습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("SMS 인증 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 6자리 인증번호 생성
    private String generateVerificationCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
    
    // 인증번호 확인 (내부 메서드)
    private boolean verifyCode(String phoneNumber, String code) {
        String storedCode = verificationCodes.get(phoneNumber);
        
        if (storedCode != null && storedCode.equals(code)) {
            // 인증 성공 시 코드 삭제
            verificationCodes.remove(phoneNumber);
            return true;
        }
        
        return false;
    }
}