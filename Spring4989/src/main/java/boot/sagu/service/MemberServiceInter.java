package boot.sagu.service;

import org.springframework.web.multipart.MultipartFile;

import boot.sagu.dto.MemberDto;

public interface MemberServiceInter {
    public void signup(MemberDto dto,MultipartFile profileImageFile);
    public MemberDto getMemberByLoginId(String loginId);
    public MemberDto getMemberById(Long memberId); // 추가
    boolean isLoginIdAvailable(String loginId);
    // 아이디 찾기 - 이메일과 전화번호로 회원 조회
    public MemberDto findByEmailAndPhone(String email, String phoneNumber);
    
    // 비밀번호 재설정을 위한 회원 확인 - 아이디와 전화번호로 회원 조회
    public MemberDto findByLoginIdAndPhone(String loginId, String phoneNumber);
    
    // 비밀번호 업데이트
    public void updatePassword(String loginId, String newPassword);
    
    // 마이페이지 관련 메서드들
    public void updateProfile(MemberDto member);
    public String updateProfileImage(String loginId, MultipartFile profileImageFile);
    
    public int countAllMembers();
    
}