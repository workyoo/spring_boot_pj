// src/main/java/boot/sagu/config/JwtAuthenticationFilter.java
package boot.sagu.config;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import boot.sagu.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String uri = request.getRequestURI();
        final String bearer = request.getHeader("Authorization");
        System.out.println("[JWT] uri = " + uri);
        System.out.println("[JWT] Authorization = " + bearer);

        try {
            String jwt = getJwtFromRequest(request); // Bearer 파싱(대소문자/공백 관대)
            if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtUtil.extractUsername(jwt);
                System.out.println("[JWT] extractUsername = " + username);

                if (username != null) {
                    UserDetails user = customUserDetailsService.loadUserByUsername(username);
                    boolean valid = jwtUtil.validateToken(jwt, user.getUsername());
                    System.out.println("[JWT] validate = " + valid);

                    if (valid) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        System.out.println("[JWT] ✅ setAuthentication OK. principal=" + user.getUsername());
                    } else {
                        System.out.println("[JWT] ❌ token invalid");
                    }
                }
            } else if (jwt == null) {
                System.out.println("[JWT] no bearer token (parsed)");
            }
        } catch (Exception e) {
            System.out.println("[JWT] ❌ exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            // 예외가 나도 체인은 계속 처리. 인증 실패 시 EntryPoint가 401 처리.
        }

        filterChain.doFilter(request, response);
    }

    /** Authorization 헤더에서 "Bearer <token>" 추출 (대소문자 무시 + 앞뒤 공백 허용) */
    private String getJwtFromRequest(HttpServletRequest request) {
        String h = request.getHeader("Authorization");
        if (h == null) return null;
        String v = h.trim();
        if (v.length() >= 6 && v.regionMatches(true, 0, "Bearer", 0, 6)) {
            String token = v.substring(6).trim();
            return StringUtils.hasText(token) ? token : null;
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String requestURI = request.getRequestURI();

        // ✅ 결제 confirm은 절대 제외하지 않음 (여기서 false를 반환해야 필터를 태움)
        if ("/api/auctions/portone/confirm".equals(requestURI)) {
            return false;
        }
        // 인증 불필요 경로
        return requestURI.startsWith("/login") ||
               requestURI.startsWith("/signup") ||
               requestURI.startsWith("/oauth2") ||
               requestURI.startsWith("/sms") ||
               requestURI.startsWith("/find-id") ||
               requestURI.startsWith("/verify-for-password-reset") ||
               requestURI.startsWith("/reset-password") ||
               requestURI.startsWith("/check-loginid") ||
               requestURI.startsWith("/ws") ||
               requestURI.startsWith("/post") ||
               requestURI.startsWith("/chatsave") ||
               requestURI.startsWith("/read") ||
               requestURI.startsWith("/api/region/register") ||
               requestURI.startsWith("/api/member-region/register") ||
               requestURI.startsWith("/chat/") ||
               requestURI.startsWith("/api/chat/") ||
               requestURI.startsWith("/api/chat-declarations/") ||
               requestURI.startsWith("/save/") ||
               requestURI.startsWith("/api/notifications/") ||
               requestURI.startsWith("/api/auth") ||
               requestURI.equals("/api/auctions/portone/webhook") ||
               requestURI.startsWith("/api/auth") ||     // ← refresh 포함
               requestURI.equals("/error") ||
               // 경매 관련 공개 API들
               requestURI.startsWith("/auction/image/") ||
               requestURI.startsWith("/auction/photos/") ||
               requestURI.startsWith("/auction/detail/") ||
               requestURI.startsWith("/auction/highest-bid/") ||
               requestURI.startsWith("/auction/member/") ||
               requestURI.startsWith("/auction/favorite/count/") ||
               requestURI.startsWith("/auction/bid-history/") ||
               requestURI.startsWith("/auction/room/") ||
               requestURI.equals("/auction");
    }
}
