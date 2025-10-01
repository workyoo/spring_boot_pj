// src/main/java/boot/sagu/config/SecurityConfig.java
package boot.sagu.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import boot.sagu.dto.MemberDto;
import boot.sagu.service.CustomOAuth2UserService;
import boot.sagu.service.CustomUserDetailsService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }



    // JWT 발급 → /auth/callback?token=...
    @Bean
    public AuthenticationSuccessHandler oAuth2LoginSuccessHandler() {
        return (request, response, authentication) -> {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            MemberDto member = userDetails.getMember();
            String token = jwtUtil.generateToken(member); // ← 네 JwtUtil 시그니처에 맞게 유지
            response.sendRedirect("http://localhost:5173/auth/callback?token=" + token);
        };
    }

    // CORS (헤더 와일드카드 + Authorization 노출) — 유지/보강
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOriginPatterns(java.util.List.of(
            "http://localhost:5173",
            "https://*.ngrok-free.app", // ★ 추가
            "http://*.ngrok-free.app",
            //"http://58.234.180.37:*"

            "http://192.168.10.136:5173",
            "http://192.168.10.138:5173"
        ));
        c.setAllowedMethods(java.util.List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        c.setAllowedHeaders(java.util.List.of("*"));
        c.setAllowCredentials(true);
        c.addExposedHeader("Authorization");
        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // REST/JWT 환경: 기본 폼/베이식 로그인 비활성화
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(authz -> authz
                // 프리플라이트 허용
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 로그인/회원가입 등 공개
                .requestMatchers("/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/login").permitAll()
                .requestMatchers("/signup", "/login/**", "/oauth2/**", "/save/**",
                                 "/check-loginid", "/postphoto/**").permitAll()
                .requestMatchers("/sms/**", "/find-id",
                                 "/verify-for-password-reset", "/reset-password").permitAll()

                // 멤버 조회는 인증
                .requestMatchers(HttpMethod.GET, "/member/**").authenticated()

                // 알림 API 공개(기존 유지)
                .requestMatchers("/api/notifications/**").permitAll()

                // Contact API 인증 필요
                .requestMatchers("/api/contact/**").authenticated()

                // 제출/입찰/삭제는 인증
                .requestMatchers("/submit").authenticated()
                .requestMatchers("/auction/*/bids", "/auction/delete/**").authenticated()

                // 결제: webhook 공개, confirm 인증
                .requestMatchers(HttpMethod.POST, "/api/auctions/portone/webhook").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auctions/portone/confirm").authenticated()

                // 채팅/WS 공개(기존 유지)
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/chat/**", "/chat/rooms/**", "/chat/rooms",
                                 "/unread-count/**", "/api/chat/**",
                                 "/room/create-with-message", "/room/enter",
                                 "/estate/**", "/listMessage/**",
                                 "/chatsave/**", "/read").permitAll()

                // 지역/주소
                .requestMatchers("/api/regions/**").permitAll()
                .requestMatchers("/api/region/**").permitAll()
                .requestMatchers("/api/member-region/register").permitAll()
                .requestMatchers("/api/member-region/addresses/**").authenticated()

                // 채팅 신고(기존 유지: 전체 공개)
                .requestMatchers("/api/chat-declarations/**").permitAll()

                // 게시물/카테고리 조회 공개
                .requestMatchers("/post/**", "/goods/**", "/cars/**").permitAll()

                // 경매 조회/방(공개) — 중복 제거 & 탭 오타 수정
                .requestMatchers("/auction").permitAll()
                .requestMatchers("/auction/photos/**", "/auction/detail/**", "/auction/highest-bid/**",
                                 "/auction/image/**", "/auction/member/**", "/auction/favorite/count/**",
                                 "/auction/bid-history/**", "/auction/room/**").permitAll()

                // 토큰 갱신 공개
                .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()

                // 에러 공개
                .requestMatchers("/error").permitAll()

                // 그 외 모두 인증
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) -> {
                // 디버그 로그(기존 유지)
                System.out.println("=== Security Exception Details ===");
                System.out.println("Request URI: " + req.getRequestURI());
                System.out.println("Request Method: " + req.getMethod());
                System.out.println("Authorization Header: " + req.getHeader("Authorization"));
                System.out.println("Error: " + e.getMessage());
                System.out.println("Error Type: " + e.getClass().getSimpleName());
                System.out.println("================================");

                res.setContentType("application/json;charset=UTF-8");
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                res.getWriter().write("{\"error\": \"Unauthorized\"}");
            }));

        // JWT 필터: UsernamePasswordAuthenticationFilter 앞에
        http.addFilterBefore(new JwtAuthenticationFilter(jwtUtil, customUserDetailsService),
                UsernamePasswordAuthenticationFilter.class);

        // OAuth2 로그인(기존 유지)
        http.oauth2Login(oauth2 -> oauth2
            .userInfoEndpoint(u -> u.userService(customOAuth2UserService))
            .successHandler(oAuth2LoginSuccessHandler())
        );

        return http.build();
    }




}



