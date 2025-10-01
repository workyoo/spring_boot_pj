package boot.sagu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AppConfig {
	
    // 업로드 경로를 상수로 정의
	public static final String UPLOAD_DIR = "C:\\Users\\user\\Desktop\\4989\\Project4989\\Spring4989\\src\\main\\resources\\static\\save/";
	
	@Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}