package boot.sagu.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import boot.sagu.dto.ContactDto;
import boot.sagu.mapper.ContactMapper;

@Service
public class ContactService {
    
    @Autowired
    private ContactMapper contactMapper;
    
    // 문의 등록
    public void submitContact(ContactDto contactDto) {
        contactMapper.insertContact(contactDto);
    }
    
    // 모든 문의 조회 (관리자용)
    public List<ContactDto> getAllContacts() {
        return contactMapper.getAllContacts();
    }
    
    // 특정 문의 조회
    public ContactDto getContactById(Long contactId) {
        return contactMapper.getContactById(contactId);
    }
    
    // 문의 상태 업데이트
    public void updateContactStatus(Long contactId, String status) {
        contactMapper.updateContactStatus(contactId, status);
    }
    
    // 관리자 답변 추가
    public void replyToContact(Long contactId, String adminReply) {
        contactMapper.updateAdminReply(contactId, adminReply);
    }
    
    // 사용자별 문의 조회
    public List<ContactDto> getContactsByMemberId(Long memberId) {
        return contactMapper.getContactsByMemberId(memberId);
    }
    
    // 문의 개수 조회
    public int getContactCount() {
        return contactMapper.getContactCount();
    }
    
    // 처리 대기 중인 문의 개수
    public int getPendingContactCount() {
        return contactMapper.getPendingContactCount();
    }
    
    // 문의 답변 완료된 문의 목록 조회 (알림용)
    public List<ContactDto> getContactNotificationsByMemberId(Long memberId) {
        return contactMapper.getContactNotificationsByMemberId(memberId);
    }

    // 문의 답변 알림 읽음 처리
    public void markContactAsRead(Long contactId) {
        contactMapper.markContactAsRead(contactId);
    }
    
    public int countContact() {
    	return contactMapper.countContact();
    }
}
