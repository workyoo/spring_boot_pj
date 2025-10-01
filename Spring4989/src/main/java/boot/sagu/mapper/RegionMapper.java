package boot.sagu.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.RegionDto;

@Mapper
public interface RegionMapper {
	
	public void insertRegion(RegionDto dto);
	
	public List<RegionDto> findRegionsByKeyword(String keyword);
	
	// 페이지네이션을 위한 메서드들
	public List<RegionDto> getRegionsWithPagination(@Param("offset") int offset, @Param("limit") int limit);
	
	public int getTotalCount();
	
	public RegionDto getRegionById(@Param("regionId") Integer regionId);
	
	public void updateRegion(RegionDto dto);
	
	public void deleteRegion(@Param("regionId") Integer regionId);
	
	// 모든 province 목록 조회
	public List<String> getDistinctProvinces();
	
	// 특정 province의 city 목록 조회
	public List<String> getCitiesByProvince(@Param("province") String province);
	
	// 특정 city의 district 목록 조회
	public List<String> getDistrictsByCity(@Param("province") String province, @Param("city") String city);
	
	// 특정 district의 town 목록 조회
	public List<String> getTownsByDistrict(@Param("province") String province, @Param("city") String city, @Param("district") String district);
	
	// 키워드로 지역 검색 (자동완성용)
		public List<RegionDto> searchRegionsByKeyword(@Param("keyword") String keyword);
}
