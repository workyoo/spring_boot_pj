package boot.sagu.service;

import boot.sagu.dto.ChatDeclarationDto;
import boot.sagu.dto.ChatDeclarationResultDto;
import boot.sagu.dto.ChatDeclarationResultNotificationDto;
import boot.sagu.mapper.ChatDeclarationMapper;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ChatDeclarationService implements ChatDeclarationServiceInter{

	@Autowired
    private final ChatDeclarationMapper chatDeclarationMapper;

    public ChatDeclarationService(ChatDeclarationMapper chatDeclarationMapper) {
        this.chatDeclarationMapper = chatDeclarationMapper;
    }

    public void insertDeclaration(ChatDeclarationDto dto) {
        chatDeclarationMapper.insertDeclaration(dto);
    }

	@Override
	public List<ChatDeclarationDto> getChatDeclarationsForMember(long memberId) {
		return chatDeclarationMapper.getChatDeclarationsForMember(memberId);
	}

	@Override
	public List<ChatDeclarationDto> getAllDeclarations() {
		// TODO Auto-generated method stub
		return chatDeclarationMapper.getAllDeclarations();
	}

	/**
	 * 채팅 신고 조치 처리
	 * @param declarationId 신고 ID
	 * @param reason 조치 사유
	 * @param actionType 조치 유형 (SANCTION/COMPANION)
	 */
	public void processAction(Integer declarationId, String reason, String actionType) {
		System.out.println(">>> [URGENT] 2025-08-23 03:33 - 최신 코드가 반영되었습니다!");
		System.out.println(">>> [DEBUG] ChatDeclarationService.processAction 호출됨");
		System.out.println(">>> [DEBUG] declarationId: " + declarationId);
		System.out.println(">>> [DEBUG] reason: " + reason);
		System.out.println(">>> [DEBUG] actionType: " + actionType);
		
		try {
			// 신고 대상 사용자 ID 가져오기
			ChatDeclarationDto declaration = chatDeclarationMapper.getDeclarationById(declarationId);
			if (declaration == null) {
				throw new RuntimeException("신고 정보를 찾을 수 없습니다: " + declarationId);
			}
			
			System.out.println(">>> [DEBUG] 조회된 신고 정보: " + declaration);
			
			// 신고 대상 사용자 ID 가져오기
			Integer resultMemberId = declaration.getDeclarationOppositeMemberId();
			System.out.println(">>> [DEBUG] resultMemberId: " + resultMemberId);
			
			if (resultMemberId == null) {
				throw new RuntimeException("신고 대상 사용자 ID를 찾을 수 없습니다: " + declarationId);
			}
			
			// DTO로 파라미터 전달
			ChatDeclarationResultDto resultDto = new ChatDeclarationResultDto();
			resultDto.setDeclarationId(declarationId);
			resultDto.setResultMemberId(resultMemberId);
			resultDto.setResultContent(reason);
			
			System.out.println(">>> [DEBUG] ChatDeclarationResultDto 생성: " + resultDto);
			
			// chatdeclarationresult 테이블에 결과 삽입
			System.out.println(">>> [DEBUG] insertDeclarationResult 호출 시작");
			try {
				chatDeclarationMapper.insertDeclarationResult(resultDto);
				System.out.println(">>> [DEBUG] insertDeclarationResult 호출 완료");
			} catch (Exception e) {
				System.err.println(">>> [ERROR] insertDeclarationResult 실행 중 예외 발생: " + e.getMessage());
				e.printStackTrace();
				throw e;
			}
			
			System.out.println(">>> [CRITICAL] insertDeclarationResult 완료 후 다음 단계로 진행합니다!");
			System.out.println(">>> [CRITICAL] 코드 수정이 제대로 반영되었는지 확인하는 로그입니다!");
			System.out.println(">>> [DEBUG] ===== updateDeclarationStatus 시작 ======");
			System.out.println(">>> [DEBUG] 이제 updateDeclarationStatus 로직을 실행합니다.");
			
			// chatdeclaration 테이블의 status와 result 업데이트
			System.out.println(">>> [DEBUG] updateDeclarationStatus 호출 시작");
			System.out.println(">>> [DEBUG] - declarationId: " + declarationId);
			System.out.println(">>> [DEBUG] - status: COMPLETE");
			System.out.println(">>> [DEBUG] - result: " + actionType);
			
			// ENUM 값 검증 및 매핑
			String statusValue = "COMPLETE";
			String resultValue = null;
			
			if ("SANCTION".equals(actionType)) {
				resultValue = "SANCTION";
			} else if ("COMPANION".equals(actionType)) {
				resultValue = "COMPANION";
			} else {
				throw new RuntimeException("잘못된 actionType입니다: " + actionType);
			}
			
			System.out.println(">>> [DEBUG] 최종 매핑된 값:");
			System.out.println(">>> [DEBUG] - status: " + statusValue);
			System.out.println(">>> [DEBUG] - result: " + resultValue);
			
			// Map으로 파라미터 전달
			java.util.Map<String, Object> params = new java.util.HashMap<>();
			params.put("declarationId", declarationId);
			params.put("status", statusValue);
			params.put("result", resultValue);
			
			System.out.println(">>> [DEBUG] 전달할 파라미터 맵: " + params);
			
			// 실제 업데이트 실행
			System.out.println(">>> [DEBUG] updateDeclarationStatus 매퍼 메서드 호출");
			System.out.println(">>> [DEBUG] chatDeclarationMapper 객체: " + chatDeclarationMapper);
			System.out.println(">>> [DEBUG] params 객체: " + params);
			System.out.println(">>> [DEBUG] params 타입: " + params.getClass().getName());
			System.out.println(">>> [DEBUG] params 내용:");
			for (java.util.Map.Entry<String, Object> entry : params.entrySet()) {
				System.out.println(">>> [DEBUG]   - " + entry.getKey() + ": " + entry.getValue() + " (타입: " + (entry.getValue() != null ? entry.getValue().getClass().getName() : "null") + ")");
			}
			
			try {
				chatDeclarationMapper.updateDeclarationStatus(params);
				System.out.println(">>> [DEBUG] updateDeclarationStatus 호출 완료");
			} catch (Exception e) {
				System.err.println(">>> [ERROR] updateDeclarationStatus 실행 중 예외 발생: " + e.getMessage());
				e.printStackTrace();
				throw e;
			}
			
			System.out.println(">>> [SUCCESS] 조치 처리가 성공적으로 완료되었습니다!");
			System.out.println(">>> [SUCCESS] declarationId: " + declarationId + ", actionType: " + actionType);
			
		} catch (Exception e) {
			System.err.println(">>> [ERROR] processAction 실행 중 예외 발생: " + e.getMessage());
			e.printStackTrace();
			throw e;
		}
	}
	
	@Override
	public List<ChatDeclarationResultNotificationDto> getDeclarationResultNotifications(long resultMemberId) {
		return chatDeclarationMapper.getDeclarationResultNotifications(resultMemberId);
	}
	
	@Override
	public void markDeclarationResultAsRead(Integer chatdeclarationresultId) {
		chatDeclarationMapper.markDeclarationResultAsRead(chatdeclarationresultId);
	}

	@Override
	public int getUnreadNotificationCount(String memberId) {
		return chatDeclarationMapper.getUnreadNotificationCount(memberId);
	}

	@Override
	public int countReports() {
		// TODO Auto-generated method stub
		return chatDeclarationMapper.countReports();
	}
}