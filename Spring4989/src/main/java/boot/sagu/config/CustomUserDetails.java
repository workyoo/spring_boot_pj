package boot.sagu.config;

import boot.sagu.dto.MemberDto;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

// UserDetails와 OAuth2User를 모두 구현하여 일반 로그인과 소셜 로그인을 함께 처리
public class CustomUserDetails implements UserDetails, OAuth2User {

    private final MemberDto member;
    private Map<String, Object> attributes;

    // 일반 로그인을 위한 생성자
    public CustomUserDetails(MemberDto member) {
        this.member = member;
    }

    // 소셜 로그인을 위한 생성자
    public CustomUserDetails(MemberDto member, Map<String, Object> attributes) {
        this.member = member;
        this.attributes = attributes;
    }

    // MemberDto를 직접 반환하는 getter
    public MemberDto getMember() {
        return member;
    }

    // === UserDetails 구현 ===
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 역할(Role) 정보를 반환 (DB에 저장된 role 사용)
        return Collections.singletonList(new SimpleGrantedAuthority(member.getRole()));
    }

    @Override
    public String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getUsername() {
        return member.getLoginId();
    }
    
    // 계정 상태 관련 설정 (모두 true로 반환하여 활성화 상태로 설정)
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
    
    // === OAuth2User 구현 ===
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        // OAuth2 공급자로부터 받은 사용자의 고유 ID를 반환
        // 여기서는 사용하지 않으므로 null 또는 고유 식별자를 반환하도록 설정
        return null; 
    }
}