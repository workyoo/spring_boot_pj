package boot.sagu.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.sagu.dto.AdminActionLogDto;
import boot.sagu.dto.MemberDto;
import boot.sagu.service.AdminServiceInter;
import boot.sagu.service.MemberServiceInter;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {
    


    @Autowired
    private MemberServiceInter memberService;
    
    @Autowired
    private AdminServiceInter adminService;

    // 회원 목록 조회 (페이징 및 검색)
    @GetMapping("/members")
    public ResponseEntity<?> getMembers(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "search", defaultValue = "") String search) {
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<MemberDto> membersPage = adminService.getMembersWithPaging(pageable, search);
            
            return ResponseEntity.ok(Map.of(
                "content", membersPage.getContent(),
                "totalPages", membersPage.getTotalPages(),
                "totalElements", membersPage.getTotalElements(),
                "currentPage", page,
                "size", size
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("회원 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 회원 상세 정보 조회
    @GetMapping("/members/{memberId}")
    public ResponseEntity<?> getMemberDetail(@PathVariable(name = "memberId") Long memberId) {
        try {
            MemberDto member = memberService.getMemberById(memberId);
            if (member != null) {
                return ResponseEntity.ok(member);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("회원 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 회원 정보 수정
    @PutMapping("/members/{memberId}")
    public ResponseEntity<?> updateMember(@PathVariable(name = "memberId") Long memberId, @RequestBody MemberDto updateData) {
        try {
            MemberDto existingMember = memberService.getMemberById(memberId);
            if (existingMember == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원을 찾을 수 없습니다.");
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
            if (updateData.getTier() != null) {
                existingMember.setTier(updateData.getTier());
            }

            memberService.updateProfile(existingMember);
            
            return ResponseEntity.ok(Map.of("message", "회원 정보가 성공적으로 수정되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("회원 정보 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 회원 상태 변경 (밴/해제)
    @PutMapping("/members/{memberId}/status")
    public ResponseEntity<?> updateMemberStatus(
            @PathVariable(name = "memberId") Long memberId, 
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            String reason = statusData.get("reason");
            
            if (newStatus == null || (!newStatus.equals("ACTIVE") && !newStatus.equals("BANNED"))) {
                return ResponseEntity.badRequest().body("유효하지 않은 상태값입니다.");
            }

            MemberDto existingMember = memberService.getMemberById(memberId);
            if (existingMember == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원을 찾을 수 없습니다.");
            }

            existingMember.setStatus(newStatus);
            memberService.updateProfile(existingMember);
            
            return ResponseEntity.ok(Map.of("message", "회원 상태가 성공적으로 변경되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("회원 상태 변경 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 회원 삭제
    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<?> deleteMember(@PathVariable(name = "memberId") Long memberId) {
        try {
            MemberDto existingMember = memberService.getMemberById(memberId);
            if (existingMember == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원을 찾을 수 없습니다.");
            }

            // 실제 삭제 대신 상태를 DELETED로 변경 (데이터 보존)
            existingMember.setStatus("DELETED");
            memberService.updateProfile(existingMember);
            
            return ResponseEntity.ok(Map.of("message", "회원이 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("회원 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 관리자 작업 로그 기록
    @PostMapping("/action-logs")
    public ResponseEntity<?> createActionLog(@RequestBody AdminActionLogDto logData) {
        try {
            AdminActionLogDto savedLog = adminService.createActionLog(logData);
            return ResponseEntity.ok(savedLog);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("작업 로그 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 관리자 작업 로그 조회
    @GetMapping("/action-logs")
    public ResponseEntity<?> getActionLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page - 1, size);
            Page<AdminActionLogDto> logsPage = adminService.getActionLogsWithPaging(pageable);
            
            return ResponseEntity.ok(Map.of(
                "content", logsPage.getContent(),
                "totalPages", logsPage.getTotalPages(),
                "totalElements", logsPage.getTotalElements(),
                "currentPage", page,
                "size", size
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("작업 로그 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}