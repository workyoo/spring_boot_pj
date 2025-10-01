package boot.sagu.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해 CORS를 허용합니다.
                .allowedOrigins("http://localhost:5173") // 이 도메인에서의 요청만 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE") // 허용할 HTTP 메서드
                .allowedHeaders("*") // 모든 헤더를 허용
                .allowCredentials(true) // 쿠키를 포함한 요청을 허용
                .maxAge(3600); // 캐싱 시간 설정 (초 단위)
    }
}