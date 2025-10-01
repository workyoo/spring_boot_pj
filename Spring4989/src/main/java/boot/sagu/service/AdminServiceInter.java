package boot.sagu.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import boot.sagu.dto.AdminActionLogDto;
import boot.sagu.dto.MemberDto;

public interface AdminServiceInter {
    
    // 회원 목록 조회 (페이징 및 검색)
    Page<MemberDto> getMembersWithPaging(Pageable pageable, String search);
    
    // 관리자 작업 로그 생성
    AdminActionLogDto createActionLog(AdminActionLogDto logData);
    
    // 관리자 작업 로그 조회 (페이징)
    Page<AdminActionLogDto> getActionLogsWithPaging(Pageable pageable);
}
