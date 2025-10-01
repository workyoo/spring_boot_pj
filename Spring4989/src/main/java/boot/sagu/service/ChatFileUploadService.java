package boot.sagu.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import boot.sagu.dto.ChatFileDto;
import boot.sagu.dto.ChatMessageDto;
import boot.sagu.dto.WebSocketMessageDto;
import boot.sagu.mapper.ChatFileMapper;

@Service
public class ChatFileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(ChatFileUploadService.class);

    private final ChatMessageService chatMessageService;
    
    @Autowired
    private ChatFileMapper chatFileMapper;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ⭐ 수정: yml에 설정하지 않고 코드에서 직접 URL을 설정
    	private final String SERVER_BASE_URL = "http://192.168.10.136:4989";

    // 파일 저장 경로
    private final String UPLOAD_BASE_PATH = "C:/SIST0217/Project4989/Spring4989/src/main/resources/static/chatsave/";

    // 웹에서 접근할 URL의 상대 경로
    private final String WEB_URL_PATH = "/chatsave/";

    public ChatFileUploadService(ChatMessageService chatMessageService, SimpMessagingTemplate messagingTemplate) {
        this.chatMessageService = chatMessageService;
        this.messagingTemplate = messagingTemplate;
    }
    
    @Transactional
    public ChatFileDto uploadChatImage(MultipartFile file, Long chatRoomId, Long senderId) throws IOException {
        
        logger.info("ChatFileUploadService.uploadChatImage 메서드 시작: chatRoomId={}, senderId={}", chatRoomId, senderId);

        // 1. 파일 검증
        if (file.isEmpty()) {
            logger.warn("업로드된 파일이 비어 있습니다.");
            throw new IllegalArgumentException("업로드된 파일이 없습니다.");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            logger.warn("이미지 파일이 아닙니다. Content-Type: {}", contentType);
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
        
        if (file.getSize() > 10 * 1024 * 1024) {
            logger.warn("파일 크기가 10MB를 초과했습니다. 파일 크기: {}", file.getSize());
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }
        
        // 2. 파일 저장 경로 및 파일명 생성
        String todayPath = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        
        String uploadDir = UPLOAD_BASE_PATH + todayPath + File.separator;

        logger.info("파일 저장 디렉토리: {}", uploadDir);

        Path uploadPathDir = Paths.get(uploadDir);
        if (!Files.exists(uploadPathDir)) {
            logger.info("디렉토리가 없어 새로 생성합니다: {}", uploadDir);
            Files.createDirectories(uploadPathDir);
        }
        
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".") ?
                                 originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        
        String newFilename = UUID.randomUUID().toString() + fileExtension;
        
        String filePath = uploadDir + newFilename;
        
        String fileUrl = WEB_URL_PATH + todayPath + "/" + newFilename;

        logger.info("최종 저장될 파일 경로: {}", filePath);
        logger.info("DB에 저장될 URL: {}", fileUrl);
        
        File dest = new File(filePath);
        file.transferTo(dest);
        
        logger.info("파일 시스템에 파일 저장 완료.");

        // 3. chatmessage 테이블에 메시지 삽입 (messageId 생성)
        ChatMessageDto chatMessageDto = new ChatMessageDto();
        chatMessageDto.setChatRoomId(chatRoomId);
        chatMessageDto.setSenderId(senderId);
        chatMessageDto.setMessageType("image");
        chatMessageDto.setMessageContent(fileUrl);
        java.sql.Timestamp timestamp = java.sql.Timestamp.valueOf(LocalDateTime.now());
        chatMessageDto.setCreatedAt(timestamp);
        
        logger.info("chatMessageService.insertMessage 호출 준비...");
        chatMessageService.insertMessage(chatMessageDto);
        
        Long generatedMessageId = chatMessageDto.getMessageId();
        logger.info("새로운 메시지 생성 완료. messageId: {}", generatedMessageId);

        // 4. chatfile 테이블에 파일 정보 저장
        ChatFileDto chatFileDto = new ChatFileDto();
        chatFileDto.setChatRoomId(chatRoomId);
        chatFileDto.setMessageId(generatedMessageId);
        chatFileDto.setFileUrl(fileUrl);
        chatFileDto.setFileSize(file.getSize());
        java.sql.Timestamp uploadedTimestamp = java.sql.Timestamp.valueOf(LocalDateTime.now());
        chatFileDto.setUploadAt(uploadedTimestamp);
        
        logger.info("chatFileMapper.insertChatFile 호출 준비...");
        chatFileMapper.insertChatFile(chatFileDto);
        
        logger.info("파일 정보 DB 저장 완료. fileId: {}", chatFileDto.getFileId());
        
        // ⭐ 수정: 웹소켓을 통해 클라이언트에 메시지 전송
        String absoluteImageUrl = SERVER_BASE_URL + fileUrl;
        
        WebSocketMessageDto webSocketMessage = new WebSocketMessageDto();
        webSocketMessage.setType("CHAT"); 
        webSocketMessage.setChatRoomId(chatRoomId);
        webSocketMessage.setSenderId(senderId);
        webSocketMessage.setMessageType("image");
        webSocketMessage.setMessageContent(absoluteImageUrl);
        webSocketMessage.setTimestamp(timestamp);
        webSocketMessage.setMessageId(generatedMessageId);

        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, webSocketMessage);

        return chatFileDto;
    }

    // 메시지 ID로 파일 정보 조회
    public ChatFileDto getChatFileByMessageId(Long messageId) {
        return chatFileMapper.getChatFileByMessageId(messageId);
    }
    
    // 채팅방의 모든 파일 정보 조회
    public java.util.List<ChatFileDto> getChatFilesByRoomId(Long chatRoomId) {
        return chatFileMapper.getChatFilesByRoomId(chatRoomId);
    }
    
    
    
}