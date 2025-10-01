package boot.sagu.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import boot.sagu.dto.MemberRegionDto;

import java.util.List;
import java.util.Map;

@Mapper
public interface MemberRegionMapper {
   public void insertMemberRegion(MemberRegionDto dto);
   
   public int countMemberRegionsByMemberId(@Param("memberId") int memberId);

   public int findMaxIsPrimaryByMemberId(@Param("memberId") int memberId);
   
   // 회원의 주소 목록 조회 (간단한 형태)
   public List<Map<String, Object>> findMemberAddressesByMemberId(@Param("memberId") int memberId);
   
   // 특정 주소 삭제
   public int deleteMemberAddress(@Param("memberRegionId") int memberRegionId, @Param("memberId") int memberId);
   
   // 다음 주소를 기본주소로 설정
   public void setNextAddressAsPrimary(@Param("addressId") int addressId);
   
   // 가장 오래된 주소의 ID 조회
   public Integer findOldestAddressId(@Param("memberId") int memberId);
   
   // 모든 주소의 기본주소 상태를 해제
   public void clearAllPrimaryAddresses(@Param("memberId") int memberId);
}
