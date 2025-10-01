package boot.sagu.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import boot.sagu.config.AppConfig;

@Service
public class FileUploadService {


    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            return null;
        }
        try {
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            
            // AppConfig의 상수를 직접 사용
            File dest = new File(AppConfig.UPLOAD_DIR + uniqueFileName);
            file.transferTo(dest);
            
            return "/save/" + uniqueFileName;
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패: " + e.getMessage());
        }
    }
}