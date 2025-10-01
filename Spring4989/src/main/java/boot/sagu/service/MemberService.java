package boot.sagu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import boot.sagu.dto.MemberDto;
import boot.sagu.mapper.MemberMapper;

@Service
public class MemberService implements MemberServiceInter {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @Override
    public void signup(MemberDto dto, MultipartFile profileImageFile) {
    	
    	// 1. 프로필 이미지가 존재하면 업로드하고 URL을 받아옵니다.
        if (profileImageFile != null && !profileImageFile.isEmpty()) {
            String profileImageUrl = fileUploadService.uploadFile(profileImageFile);
            // 2. 받아온 URL을 DTO에 설정합니다.
            dto.setProfileImageUrl(profileImageUrl);
        }
        
    	
        // 비밀번호를 암호화
        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        // 암호화된 비밀번호를 DTO에 다시 설정
        dto.setPassword(encodedPassword);
        // 암호화된 DTO를 DB에 저장
        memberMapper.signup(dto);
    }

	@Override
	public MemberDto getMemberByLoginId(String loginId) {
		// TODO Auto-generated method stub
		return memberMapper.findByLoginId(loginId);
	}

	@Override
	public MemberDto getMemberById(Long memberId) {
		return memberMapper.findById(memberId);
	}

	@Override
	public boolean isLoginIdAvailable(String loginId) {
		// TODO Auto-generated method stub
		return memberMapper.countByLoginId(loginId) == 0;
	}

	@Override
	public MemberDto findByEmailAndPhone(String email, String phoneNumber) {
		return memberMapper.findByEmailAndPhone(email, phoneNumber);
	}

	@Override
	public MemberDto findByLoginIdAndPhone(String loginId, String phoneNumber) {
		return memberMapper.findByLoginIdAndPhone(loginId, phoneNumber);
	}

	@Override
	public void updatePassword(String loginId, String newPassword) {
		// 새 비밀번호를 암호화
		String encodedPassword = passwordEncoder.encode(newPassword);
		// 암호화된 비밀번호로 업데이트
		memberMapper.updatePassword(loginId, encodedPassword);
	}
	
	@Override
	public void updateProfile(MemberDto member) {
		// 프로필 정보 업데이트
		memberMapper.updateProfile(member);
	}
	
	@Override
	public String updateProfileImage(String loginId, MultipartFile profileImageFile) {
		// 1. 프로필 이미지 업로드
		String profileImageUrl = fileUploadService.uploadFile(profileImageFile);
		
		// 2. DB에 프로필 이미지 URL 업데이트
		memberMapper.updateProfileImage(loginId, profileImageUrl);
		
		return profileImageUrl;
	}

	@Override
	public int countAllMembers() {
		// TODO Auto-generated method stub
		return memberMapper.countAllMembers();
	}
	
}