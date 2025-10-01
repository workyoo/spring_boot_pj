package boot.sagu.service;


import boot.sagu.mapper.ChatFileMapper;
import boot.sagu.mapper.ChatMapper;
import boot.sagu.mapper.ChatMessageMapper;

import java.io.File;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ChatCleanUpScheduler {

	 private final ChatMessageMapper chatMessageMapper;
	    private final ChatMapper chatRoomMapper;
	    private final ChatFileMapper chatFileMapper;
	    
	    private final String uploadDir = "C:/SIST0217/Project4989/Spring4989/src/main/resources/static";

	    public ChatCleanUpScheduler(ChatMessageMapper chatMessageMapper, ChatMapper chatRoomMapper, ChatFileMapper chatFileMapper) {
	        this.chatMessageMapper = chatMessageMapper;
	        this.chatRoomMapper = chatRoomMapper;
	        this.chatFileMapper = chatFileMapper;
	    }

	    @Scheduled(cron = "0 22 16 * * ?")
	    public void cleanupOldDeletedData() {
	    	int hours = 24;
	    	
	        // 각 테이블의 매퍼를 사용하여 삭제 쿼리 호출
	        chatMessageMapper.deleteOldMessages(24);
	        chatRoomMapper.deleteOldChatRooms(24);

	        // 1. DB에서 삭제할 파일들의 경로를 먼저 조회
	        List<String> filePathsToDelete = chatFileMapper.getOldFilePaths(hours);
	        int deletedFileCount = 0;

	        // 2. 실제 파일 시스템에서 파일 삭제
	        for (String filePath : filePathsToDelete) {
	        	// 수정 후: `uploadDir`과 `filePath`를 결합하여 완전한 경로를 만듭니다.
	        	File file = new File(uploadDir, filePath);
	            if (file.exists() && file.delete()) {
	                deletedFileCount++;
	            } else {
	                System.err.println("파일 삭제 실패: " + filePath);
	            }
	        }
	        System.out.println("실제 파일 " + deletedFileCount + "개 삭제 완료.");

	        // 3. DB에서 오래된 'chatfile' 데이터 삭제
	        chatFileMapper.deleteOldChatFiles(hours);
	        System.out.println("DB chatfile 레코드 삭제 완료.");
	        
	        System.out.println("오래된 데이터 삭제 작업 완료!");
	    }
}