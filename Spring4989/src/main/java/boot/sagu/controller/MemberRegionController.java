package boot.sagu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

import boot.sagu.dto.MemberRegionDto;
import boot.sagu.mapper.MemberRegionMapper;
import boot.sagu.mapper.MemberMapper;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member-region")
public class MemberRegionController {

    @Autowired
    private MemberRegionMapper memberRegionMapper;
    
    @Autowired
    private MemberMapper memberMapper;

    @PostMapping("/register")
    public ResponseEntity<String> registerMemberRegion(@RequestBody MemberRegionDto requestDto) {
        if (requestDto.getMemberId() == 0 || requestDto.getRegionId() == 0) {
            return ResponseEntity.badRequest().body("필수 정보(회원ID, 지역ID)가 누락되었습니다.");
        }

        try {
            // 해당 회원의 기존 주소 개수 조회
            int existingAddressCount = memberRegionMapper.countMemberRegionsByMemberId(requestDto.getMemberId());
            
            // 주소가 없으면 is_primary = 1, 있으면 is_primary = 0
            int isPrimary = (existingAddressCount == 0) ? 1 : 0;
            requestDto.setIsPrimary(isPrimary);

            // 데이터베이스에 저장
            memberRegionMapper.insertMemberRegion(requestDto);
            
            return ResponseEntity.ok("회원의 주소 정보가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            System.err.println("DB 저장 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("DB 저장 중 오류가 발생했습니다.");
        }
    }
    
    // 회원의 주소 목록 조회
    @GetMapping("/addresses")
    public ResponseEntity<List<Map<String, Object>>> getMemberAddresses(
            @RequestParam("loginId") String loginId) {
        
        try {
            // loginId로 member_id 조회
            Integer memberId = memberMapper.findMemberIdByLoginId(loginId);
            if (memberId == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 회원의 주소 목록 조회
            List<Map<String, Object>> addresses = memberRegionMapper.findMemberAddressesByMemberId(memberId);
            
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            System.err.println("주소 목록 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // 회원의 특정 주소 삭제
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<String> deleteMemberAddress(
            @PathVariable("addressId") int addressId,
            @RequestParam("loginId") String loginId) {
        
        try {
            // loginId로 member_id 조회
            Integer memberId = memberMapper.findMemberIdByLoginId(loginId);
            if (memberId == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 해당 주소가 해당 회원의 것인지 확인하고 삭제
            int deletedCount = memberRegionMapper.deleteMemberAddress(addressId, memberId);
            
            if (deletedCount > 0) {
                // 삭제 후 남은 주소가 있다면, 가장 오래된 주소를 기본주소로 설정
                int remainingAddressCount = memberRegionMapper.countMemberRegionsByMemberId(memberId);
                if (remainingAddressCount > 0) {
                    System.out.println("남은 주소가 있습니다. 다음 주소를 기본주소로 설정합니다.");
                    
                    // 1단계: 가장 오래된 주소의 ID 조회
                    Integer oldestAddressId = memberRegionMapper.findOldestAddressId(memberId);
                    if (oldestAddressId != null) {
                        // 2단계: 해당 주소를 기본주소로 설정
                        memberRegionMapper.setNextAddressAsPrimary(oldestAddressId);
                        System.out.println("다음 주소를 기본주소로 설정 완료: " + oldestAddressId);
                    }
                }
                
                return ResponseEntity.ok("주소가 성공적으로 삭제되었습니다.");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("주소 삭제 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("주소 삭제 중 오류가 발생했습니다.");
        }
    }
    
    // 일반주소를 기본주소로 변경
    @PutMapping("/addresses/{addressId}/set-primary")
    public ResponseEntity<String> setAddressAsPrimary(
            @PathVariable("addressId") int addressId,
            @RequestParam("loginId") String loginId) {
        
        try {
            // loginId로 member_id 조회
            Integer memberId = memberMapper.findMemberIdByLoginId(loginId);
            if (memberId == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 1단계: 현재 기본주소를 일반주소로 변경
            memberRegionMapper.clearAllPrimaryAddresses(memberId);
            
            // 2단계: 선택된 주소를 기본주소로 설정
            memberRegionMapper.setNextAddressAsPrimary(addressId);
            
            return ResponseEntity.ok("기본주소가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            System.err.println("기본주소 변경 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("기본주소 변경 중 오류가 발생했습니다.");
        }
    }
}