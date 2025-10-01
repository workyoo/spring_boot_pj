package boot.sagu.config;

import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import boot.sagu.dto.MemberDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;


@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // 디버깅을 위한 초기화 로그
    public JwtUtil() {
        System.out.println("JwtUtil 생성자 호출됨");
    }

    @PostConstruct
    public void init() {
        System.out.println("JWT Secret Key: " + secret);
        System.out.println("JWT Expiration: " + expiration);
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // 토큰에서 사용자 아이디(loginId) 추출
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 토큰 만료일 추출
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
    }

    // 토큰이 만료되었는지 확인
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 사용자 아이디를 기반으로 토큰 생성
    public String generateToken(MemberDto member) {
        // Payload에 추가할 클레임(정보)들을 Map으로 구성
        Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("nickname", member.getNickname());
        claims.put("loginid", member.getLoginId());
        claims.put("memberId", member.getMemberId());
        claims.put("role", member.getRole());
        claims.put("profileImageUrl", member.getProfileImageUrl());
        // 필요하다면 다른 정보도 추가 가능
        // claims.put("role", member.getRole()); 

        return Jwts.builder()
                .claims(claims) // 추가한 클레임들을 설정
                .subject(member.getLoginId()) // 토큰의 주체는 loginId로 설정
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(),Jwts.SIG.HS384)
                .compact();
    }
    //토큰에서 닉네임을 추출하는 헬퍼 메서드
    public String extractNickname(String token) {
        return extractClaim(token, claims -> claims.get("nickname", String.class));
    }

    //토큰에서 memberId를 추출하는 헬퍼 메서드
    public Integer extractMemberId(String token) {
        return extractClaim(token, claims -> claims.get("memberId", Integer.class));
    }

    // 토큰 유효성 검증
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}