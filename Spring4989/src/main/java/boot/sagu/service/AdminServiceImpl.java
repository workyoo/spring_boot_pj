package boot.sagu.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import boot.sagu.dto.AdminActionLogDto;
import boot.sagu.dto.MemberDto;
import boot.sagu.mapper.AdminMapperInter;
import boot.sagu.mapper.MemberMapper;

@Service
public class AdminServiceImpl implements AdminServiceInter {

    @Autowired
    private MemberMapper memberMapper;
    
    @Autowired
    private AdminMapperInter adminMapper;

    @Override
    public Page<MemberDto> getMembersWithPaging(Pageable pageable, String search) {
        // 검색 조건과 페이징 회원 목록 조회
        List<MemberDto> members;
        int totalCount;
        
        if (search != null && !search.trim().isEmpty()) {
            // 검색어가 있는 경우
            members = memberMapper.searchMembers(search, pageable.getPageSize(), (int) pageable.getOffset());
            totalCount = memberMapper.countSearchMembers(search);
        } else {
            // 검색어가 없는 경우
            members = memberMapper.getAllMembersWithPaging(pageable.getPageSize(), (int) pageable.getOffset());
            totalCount = memberMapper.countAllMembers();
        }
        
        return new PageImpl<>(members, pageable, totalCount);
    }

    @Override
    public AdminActionLogDto createActionLog(AdminActionLogDto logData) {
        // 생성 시간 설정
        logData.setCreatedAt(LocalDateTime.now());
        
        // IP 주소 설정 (실제로는 HttpServletRequest에서 가져와야 함)
        if (logData.getIpAddress() == null) {
            logData.setIpAddress("127.0.0.1");
        }
        
        // 로그 저장
        adminMapper.insertActionLog(logData);
        
        return logData;
    }

    @Override
    public Page<AdminActionLogDto> getActionLogsWithPaging(Pageable pageable) {
        List<AdminActionLogDto> logs = adminMapper.getActionLogsWithPaging(
            pageable.getPageSize(), (int) pageable.getOffset());
        int totalCount = adminMapper.countActionLogs();
        
        return new PageImpl<>(logs, pageable, totalCount);
    }
    

}