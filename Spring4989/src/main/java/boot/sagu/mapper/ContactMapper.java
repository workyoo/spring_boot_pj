package boot.sagu.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import boot.sagu.dto.ContactDto;

@Mapper
public interface ContactMapper {
    // 문의 등록
    void insertContact(ContactDto contactDto);
    
    // 모든 문의 조회 (관리자용)
    List<ContactDto> getAllContacts();
    
    // 특정 문의 조회
    ContactDto getContactById(@Param("contactId") Long contactId);
    
    // 문의 상태 업데이트
    void updateContactStatus(@Param("contactId") Long contactId, @Param("status") String status);
    
    // 관리자 답변 추가
    void updateAdminReply(@Param("contactId") Long contactId, @Param("adminReply") String adminReply);
    
    // 사용자별 문의 조회
    List<ContactDto> getContactsByMemberId(@Param("memberId") Long memberId);
    
    // 문의 개수 조회
    int getContactCount();
    
    // 처리 대기 중인 문의 개수
    int getPendingContactCount();
    
    // 문의 답변 완료된 문의 목록 조회 (알림용)
    List<ContactDto> getContactNotificationsByMemberId(@Param("memberId") Long memberId);

    // 문의 답변 알림 읽음 처리
    void markContactAsRead(@Param("contactId") Long contactId);
    
    public int countContact();
}
