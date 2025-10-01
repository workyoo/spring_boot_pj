package boot.sagu.config;

import java.time.Duration;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class HttpClientConfig {
	
	  @Bean
	  RestTemplate restTemplate(RestTemplateBuilder b) {
		    return b.setConnectTimeout(Duration.ofSeconds(5))
		            .setReadTimeout(Duration.ofSeconds(10))
		            .build();
		  }
}
