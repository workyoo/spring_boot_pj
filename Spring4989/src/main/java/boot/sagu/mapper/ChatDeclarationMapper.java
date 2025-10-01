package boot.sagu.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.ChatDeclarationDto;
import boot.sagu.dto.ChatDeclarationResultDto;
import boot.sagu.dto.ChatDeclarationResultNotificationDto;

@Mapper
public interface ChatDeclarationMapper {

	public void insertDeclaration(ChatDeclarationDto dto);
	
	public List<ChatDeclarationDto> getChatDeclarationsForMember(long memberId);
	
	public List<ChatDeclarationDto> getAllDeclarations();
	
	/**
	 * 신고 결과 테이블에 데이터 삽입
	 * @param dto 신고 결과 DTO
	 */
	public void insertDeclarationResult(ChatDeclarationResultDto dto);
	
	/**
	 * 신고 ID로 신고 정보 조회
	 * @param declarationId 신고 ID
	 * @return 신고 정보
	 */
	public ChatDeclarationDto getDeclarationById(@Param("declarationId") Integer declarationId);
	
	/**
	 * chatdeclaration 테이블의 status와 result 업데이트
	 * @param params 파라미터 맵 (declarationId, status, result)
	 * @return 업데이트된 행의 수
	 */
	public void updateDeclarationStatus(java.util.Map<String, Object> params);
	
	/**
	 * 특정 회원이 받은 신고 결과 알림 목록 조회
	 * @param resultMemberId 신고 결과를 받은 회원 ID
	 * @return 신고 결과 알림 목록
	 */
	public List<ChatDeclarationResultNotificationDto> getDeclarationResultNotifications(@Param("resultMemberId") long resultMemberId);
	
	/**
	 * 신고 결과 알림을 읽음 처리
	 * @param chatdeclarationresultId 신고 결과 ID
	 */
	public void markDeclarationResultAsRead(@Param("chatdeclarationresultId") Integer chatdeclarationresultId);

	/**
	 * 특정 사용자의 읽지 않은 알림 개수 조회
	 * @param memberId 사용자 ID
	 * @return 읽지 않은 알림 개수
	 */
	public int getUnreadNotificationCount(@Param("memberId") String memberId);
	
	public int countReports();
}
