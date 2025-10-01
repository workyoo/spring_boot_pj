package boot.sagu.service;

import boot.sagu.config.CustomUserDetails;
import boot.sagu.dto.MemberDto;
import boot.sagu.dto.SocialAccountDto;
import boot.sagu.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = null;
        String providerId = null;
        String nickname = null;
        String profileImageUrl = null;

        if ("google".equals(registrationId)) {
            providerId = (String) attributes.get("sub");
            email = (String) attributes.get("email");
            nickname = (String) attributes.get("name");
            profileImageUrl = (String) attributes.get("picture");
        } else if ("kakao".equals(registrationId)) {
            providerId = String.valueOf(attributes.get("id"));
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            if (kakaoAccount != null) {
                email = (String) kakaoAccount.get("email");
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                if (profile != null) {
                    nickname = (String) profile.get("nickname");
                    profileImageUrl = (String) profile.get("profile_image_url");
                }
            }
        }
        
        MemberDto member;
        if (email != null) {
            member = memberMapper.findByEmail(email);
        } else {
            member = memberMapper.findByProviderAndProviderId(registrationId, providerId);
        }

        if (member == null) {
            // 닉네임 중복 확인 및 처리 로직
            String finalNickname = nickname;
            int count = 1;
            while (memberMapper.findByNickname(finalNickname) != null) {
                finalNickname = nickname + "_" + count;
                count++;
            }

            // 신규 회원 자동 가입
            member = new MemberDto();
            String loginId = (email != null && !email.isEmpty()) ? email : registrationId + "_" + providerId;
            
            member.setLoginId(loginId);
            member.setEmail(email);
            member.setNickname(finalNickname); // 중복 처리된 닉네임으로 설정
            member.setProfileImageUrl(profileImageUrl);
            member.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            member.setRole("ROLE_USER");
            
            memberMapper.signup(member);
            
            MemberDto newMember = memberMapper.findByLoginId(loginId);
            
            SocialAccountDto socialAccount = new SocialAccountDto();
            socialAccount.setMemberId(newMember.getMemberId());
            socialAccount.setProvider(registrationId);
            socialAccount.setProviderId(providerId);
            
            memberMapper.insertSocialAccount(socialAccount);
            member = newMember;
        }
        
        return new CustomUserDetails(member, attributes);
    }
}