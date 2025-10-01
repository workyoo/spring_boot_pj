package boot.sagu.service;

import java.util.List;

import boot.sagu.dto.ChatDeclarationDto;
import boot.sagu.dto.ChatDeclarationResultNotificationDto;

public interface ChatDeclarationServiceInter {

	public void insertDeclaration(ChatDeclarationDto dto);

	public List<ChatDeclarationDto> getChatDeclarationsForMember(long memberId);
	
	public List<ChatDeclarationDto> getAllDeclarations();
	
	/**
	 * 특정 회원이 받은 신고 결과 알림 목록 조회
	 * @param resultMemberId 신고 결과를 받은 회원 ID
	 * @return 신고 결과 알림 목록
	 */
	public List<ChatDeclarationResultNotificationDto> getDeclarationResultNotifications(long resultMemberId);
	
	/**
	 * 신고 결과 알림을 읽음 처리
	 * @param chatdeclarationresultId 신고 결과 ID
	 */
	public void markDeclarationResultAsRead(Integer chatdeclarationresultId);

	/**
	 * 특정 사용자의 읽지 않은 알림 개수 조회
	 * @param memberId 사용자 ID
	 * @return 읽지 않은 알림 개수
	 */
	public int getUnreadNotificationCount(String memberId);
	
	public int countReports();
}
