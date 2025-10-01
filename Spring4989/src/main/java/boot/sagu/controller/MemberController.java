package boot.sagu.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import boot.sagu.config.JwtUtil;
import boot.sagu.dto.MemberDto;
import boot.sagu.service.CustomUserDetailsService;
import boot.sagu.service.MemberService; // MemberServiceInter 대신 MemberService 직접 사용
import jakarta.validation.Valid;

@RestController
public class MemberController {

    @Autowired
    private MemberService memberService; // MemberServiceInter 대신 MemberService 직접 사용

    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public void signup(@Valid @ModelAttribute("memberDto") MemberDto dto,
    		@RequestParam(value = "profileImageFile", required = false) MultipartFile profileImageFile) {
        memberService.signup(dto,profileImageFile);
    }
    
 // 로그인 성공 시 JWT 토큰 반환 (JSON만 받음)
 // 필요하면 consumes 제거해도 되지만, 프론트가 JSON 보내고 있으니 명시 유지 권장
 @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
 public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
     try {
         // 0) 디버깅용(문제 생기면 무엇이 왔는지 바로 확인)
         System.out.println("[LOGIN] body=" + body);

         // 1) 로그인 아이디 추출: id / loginId / username 모두 허용
         String loginId = getFirstNonBlank(body, "loginId", "id", "username");
         String password = getFirstNonBlank(body, "password", "pwd");

         if (loginId == null || password == null) {
             return ResponseEntity.status(400).body("필수값 누락(loginId/id/username, password/pwd)");
         }

         // 2) 사용자/패스워드 검증 (기존 로직 그대로)
         final UserDetails userDetails = userDetailsService.loadUserByUsername(loginId);
         if (!passwordEncoder.matches(password, userDetails.getPassword())) {
             return ResponseEntity.status(401).body("Login failed: Bad credentials");
         }

         // 3) 토큰 생성 (기존 로직 그대로)
         MemberDto member = memberService.getMemberByLoginId(loginId);
         final String token = jwtUtil.generateToken(member);
         return ResponseEntity.ok(Map.of("token", token));

     } catch (Exception e) {
         return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
     }
 }

 private String getFirstNonBlank(Map<String, Object> body, String... keys) {
     for (String k : keys) {
         Object v = body.get(k);
         if (v != null) {
             String s = String.valueOf(v).trim();
             if (!s.isEmpty()) return s;
         }
     }
     return null;
 }
    
    @GetMapping("/check-loginid")
    public ResponseEntity<?> checkLoginId(@RequestParam("loginId") String loginId) {
        boolean isAvailable = memberService.isLoginIdAvailable(loginId);
        // 사용 가능하면 OK(200), 중복이면 Conflict(409) 상태 코드를 반환
        if (isAvailable) {
            return ResponseEntity.ok(Map.of("isAvailable", true));
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("isAvailable", false));
        }
    }
    
    // 아이디 찾기 - 이메일과 전화번호로 아이디 조회
    @PostMapping("/find-id")
    public ResponseEntity<?> findLoginId(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String phoneNumber = request.get("phoneNumber");
            
            if (email == null || phoneNumber == null) {
                return ResponseEntity.badRequest().body("이메일과 전화번호를 모두 입력해주세요.");
            }
            
            MemberDto member = memberService.findByEmailAndPhone(email, phoneNumber);
            
            if (member != null) {
                // 아이디 마스킹 처리 (abc*** 형태)
                String maskedLoginId = maskLoginId(member.getLoginId());
                return ResponseEntity.ok(Map.of("loginId", maskedLoginId, "fullLoginId", member.getLoginId()));
            } else {
                return ResponseEntity.status(404).body("입력하신 정보와 일치하는 회원을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("아이디 찾기 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 비밀번호 재설정을 위한 회원 확인
    @PostMapping("/verify-for-password-reset")
    public ResponseEntity<?> verifyForPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String loginId = request.get("loginId");
            String phoneNumber = request.get("phoneNumber");
            
            if (loginId == null || phoneNumber == null) {
                return ResponseEntity.badRequest().body("아이디와 전화번호를 모두 입력해주세요.");
            }
            
            MemberDto member = memberService.findByLoginIdAndPhone(loginId, phoneNumber);
            
            if (member != null) {
                return ResponseEntity.ok(Map.of("message", "회원 정보가 확인되었습니다.", "memberId", member.getMemberId()));
            } else {
                return ResponseEntity.status(404).body("입력하신 정보와 일치하는 회원을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("회원 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 비밀번호 재설정
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String loginId = request.get("loginId");
            String newPassword = request.get("newPassword");
            
            if (loginId == null || newPassword == null) {
                return ResponseEntity.badRequest().body("아이디와 새 비밀번호를 모두 입력해주세요.");
            }
            
            memberService.updatePassword(loginId, newPassword);
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("비밀번호 변경 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 아이디 마스킹 처리 헬퍼 메서드
    private String maskLoginId(String loginId) {
        if (loginId == null || loginId.length() <= 3) {
            return loginId;
        }
        return loginId.substring(0, 3) + "*".repeat(loginId.length() - 3);
    }

    // ===== 마이페이지 관련 API =====
    
    // 프로필 정보 조회
    @GetMapping("/member/profile")
    public ResponseEntity<?> getProfile(@RequestParam("loginId") String loginId) {
        try {
            MemberDto member = memberService.getMemberByLoginId(loginId);
            if (member != null) {
                // 민감한 정보는 제외하고 반환
                MemberDto profileInfo = new MemberDto();
                profileInfo.setMemberId(member.getMemberId());
                profileInfo.setLoginId(member.getLoginId());
                profileInfo.setNickname(member.getNickname());
                profileInfo.setEmail(member.getEmail());
                profileInfo.setPhoneNumber(member.getPhoneNumber());
                profileInfo.setProfileImageUrl(member.getProfileImageUrl());
                profileInfo.setTier(member.getTier());
                profileInfo.setStatus(member.getStatus());
                profileInfo.setRole(member.getRole());
                profileInfo.setCreatedAt(member.getCreatedAt());
                
                return ResponseEntity.ok(profileInfo);
            } else {
                return ResponseEntity.status(404).body("회원을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("프로필 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 프로필 정보 수정
    @PutMapping("/member/profile")
    public ResponseEntity<?> updateProfile(@RequestParam("loginId") String loginId, @RequestBody MemberDto updateData) {
        try {
            MemberDto existingMember = memberService.getMemberByLoginId(loginId);
            if (existingMember == null) {
                return ResponseEntity.status(404).body("회원을 찾을 수 없습니다.");
            }
            
            // 업데이트할 수 있는 필드들만 수정
            if (updateData.getNickname() != null) {
                existingMember.setNickname(updateData.getNickname());
            }
            if (updateData.getEmail() != null) {
                existingMember.setEmail(updateData.getEmail());
            }
            if (updateData.getPhoneNumber() != null) {
                existingMember.setPhoneNumber(updateData.getPhoneNumber());
            }
            
            memberService.updateProfile(existingMember);
            
            // 업데이트된 회원 정보로 새로운 JWT 토큰 생성
            MemberDto updatedMember = memberService.getMemberByLoginId(loginId);
            String newToken = jwtUtil.generateToken(updatedMember);
            
            // 새로운 토큰과 함께 성공 메시지 반환
            return ResponseEntity.ok(Map.of(
                "message", "프로필이 성공적으로 수정되었습니다.",
                "token", newToken
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("프로필 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 프로필 사진 변경
    @PutMapping("/member/profile-image")
    public ResponseEntity<?> updateProfileImage(@RequestParam("loginId") String loginId, @RequestParam("profileImageFile") MultipartFile profileImageFile) {
        try {
            if (profileImageFile.isEmpty()) {
                return ResponseEntity.badRequest().body("프로필 이미지 파일을 선택해주세요.");
            }
            
            // 파일 업로드 및 DB 업데이트
            String profileImageUrl = memberService.updateProfileImage(loginId, profileImageFile);
            
            // 업데이트된 회원 정보로 새로운 JWT 토큰 생성
            MemberDto updatedMember = memberService.getMemberByLoginId(loginId);
            String newToken = jwtUtil.generateToken(updatedMember);
            
            // 새로운 토큰과 함께 성공 메시지 반환
            return ResponseEntity.ok(Map.of(
                "message", "프로필 이미지가 성공적으로 변경되었습니다.",
                "token", newToken,
                "profileImageUrl", profileImageUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("프로필 이미지 변경 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 비밀번호 변경
    @PutMapping("/member/password")
    public ResponseEntity<?> updatePassword(@RequestParam("loginId") String loginId, @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            // 현재 비밀번호 확인
            MemberDto existingMember = memberService.getMemberByLoginId(loginId);
            if (existingMember == null) {
                return ResponseEntity.status(404).body("회원을 찾을 수 없습니다.");
            }
            
            if (!passwordEncoder.matches(currentPassword, existingMember.getPassword())) {
                return ResponseEntity.status(400).body("현재 비밀번호가 일치하지 않습니다.");
            }
            
            // 새 비밀번호로 업데이트
            memberService.updatePassword(loginId, newPassword);
            
            // 업데이트된 회원 정보로 새로운 JWT 토큰 생성
            MemberDto updatedMember = memberService.getMemberByLoginId(loginId);
            String newToken = jwtUtil.generateToken(updatedMember);
            
            // 새로운 토큰과 함께 성공 메시지 반환
            return ResponseEntity.ok(Map.of(
                "message", "비밀번호가 성공적으로 변경되었습니다.",
                "token", newToken
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("비밀번호 변경 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 단일 사용자 정보 조회 (관리자용)
    @GetMapping("/api/users/{memberId}")
    public ResponseEntity<?> getUserInfo(@PathVariable(name = "memberId") Long memberId) {
        try {
            MemberDto member = memberService.getMemberById(memberId);
            if (member != null) {
                // 민감한 정보는 제외하고 필요한 정보만 반환
                MemberDto safeMember = new MemberDto();
                safeMember.setMemberId(member.getMemberId());
                safeMember.setNickname(member.getNickname());
                safeMember.setLoginId(member.getLoginId());
                safeMember.setEmail(member.getEmail());
                safeMember.setStatus(member.getStatus());
                safeMember.setRole(member.getRole());
                safeMember.setTier(member.getTier());
                safeMember.setCreatedAt(member.getCreatedAt());
                
                return ResponseEntity.ok(safeMember);
            } else {
                return ResponseEntity.status(404).body("사용자를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("사용자 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 여러 사용자 정보 조회 (관리자용)
    @PostMapping("/api/users/multiple")
    public ResponseEntity<?> getMultipleUsers(@RequestBody Map<String, List<Long>> request) {
        try {
            System.out.println(">>> [DEBUG] getMultipleUsers API 호출됨");
            System.out.println(">>> [DEBUG] 받은 요청: " + request);
            
            List<Long> memberIds = request.get("memberIds");
            if (memberIds == null || memberIds.isEmpty()) {
                System.out.println(">>> [DEBUG] memberIds가 null이거나 비어있음");
                return ResponseEntity.badRequest().body("사용자 ID 목록이 필요합니다.");
            }

            System.out.println(">>> [DEBUG] 조회할 memberIds: " + memberIds);

            List<MemberDto> users = memberIds.stream()
                .map(id -> {
                    System.out.println(">>> [DEBUG] memberId " + id + " 조회 중...");
                    MemberDto member = memberService.getMemberById(id);
                    System.out.println(">>> [DEBUG] memberId " + id + " 결과: " + member);
                    return member;
                })
                .filter(member -> member != null)
                .map(member -> {
                    System.out.println(">>> [DEBUG] memberId " + member.getMemberId() + " 처리 중...");
                    // 민감한 정보는 제외하고 필요한 정보만 반환
                    MemberDto safeMember = new MemberDto();
                    safeMember.setMemberId(member.getMemberId());
                    safeMember.setNickname(member.getNickname());
                    safeMember.setLoginId(member.getLoginId());
                    safeMember.setEmail(member.getEmail());
                    safeMember.setStatus(member.getStatus());
                    safeMember.setRole(member.getRole());
                    safeMember.setTier(member.getTier());
                    safeMember.setCreatedAt(member.getCreatedAt());
                    System.out.println(">>> [DEBUG] safeMember 생성 완료: " + safeMember);
                    return safeMember;
                })
                .collect(Collectors.toList());

            System.out.println(">>> [DEBUG] 최종 결과: " + users);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.out.println(">>> [ERROR] getMultipleUsers 에러 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("사용자 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 테스트용 엔드포인트
    @GetMapping("/api/users/test")
    public ResponseEntity<?> test() {
        try {
            return ResponseEntity.ok("MemberController 테스트 성공!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("테스트 실패: " + e.getMessage());
        }
    }
    
    @GetMapping("/countMember")
    public int countAllMembers()
    {
    	int cnt=memberService.countAllMembers();
    	
    	return cnt;
    }
}