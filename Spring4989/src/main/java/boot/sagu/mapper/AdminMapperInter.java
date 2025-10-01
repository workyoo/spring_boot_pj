package boot.sagu.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.AdminActionLogDto;

@Mapper
public interface AdminMapperInter {
    
    // 관리자 작업 로그 저장
    void insertActionLog(AdminActionLogDto logData);
    
    // 관리자 작업 로그 조회 (페이징)
    List<AdminActionLogDto> getActionLogsWithPaging(@Param("size") int size, @Param("offset") int offset);
    
    // 관리자 작업 로그 총 개수
    int countActionLogs();
}
