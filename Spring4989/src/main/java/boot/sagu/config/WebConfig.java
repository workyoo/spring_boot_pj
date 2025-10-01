package boot.sagu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
	@Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
    	if ("dev".equals(activeProfile)) {
            // 개발 환경: 절대 경로 사용 (실시간 반영)
            registry.addResourceHandler("/save/**")
                    .addResourceLocations("file:src/main/resources/static/save/"); 
            
            registry.addResourceHandler("/chatsave/**")
                    .addResourceLocations("file:src/main/resources/static/chatsave/");
            
            registry.addResourceHandler("/postphoto/**")
            		.addResourceLocations("file:src/main/webapp/save/");
        } else {
            // 운영 환경: classpath 사용
            registry.addResourceHandler("/save/**")
                    .addResourceLocations("classpath:/static/save/");
            
            registry.addResourceHandler("/chatsave/**")
                    .addResourceLocations("classpath:/static/chatsave/");
        }
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}