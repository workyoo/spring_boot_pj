package boot.sagu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import boot.sagu.dto.MemberDto;
import boot.sagu.mapper.MemberMapper;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private MemberMapper memberMapper;

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        // 1. DB에서 loginId로 회원 정보 조회
        MemberDto member = memberMapper.findByLoginId(loginId);

        // 2. 사용자를 찾지 못하면 예외 발생 (가장 중요한 부분!)
        if (member == null) {
            throw new UsernameNotFoundException("해당 아이디를 찾을 수 없습니다: " + loginId);
        }

        // 3. 사용자를 찾았다면 UserDetails 객체로 만들어 반환
        return User.builder()
                .username(member.getLoginId())
                .password(member.getPassword())
                .roles("USER")
                .build();
    }
}