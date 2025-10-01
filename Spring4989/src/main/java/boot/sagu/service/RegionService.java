package boot.sagu.service;

import boot.sagu.dto.RegionDto;
import boot.sagu.mapper.RegionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegionService {

    @Autowired
    private RegionMapper regionMapper;

    // 지역 목록 조회 (페이지네이션)
    public Page<RegionDto> getRegions(Pageable pageable) {
        int offset = (int) pageable.getOffset();
        int pageSize = pageable.getPageSize();
        
        List<RegionDto> regions = regionMapper.getRegionsWithPagination(offset, pageSize);
        int totalCount = regionMapper.getTotalCount();
        
        return new PageImpl<>(regions, pageable, totalCount);
    }

    // 지역 상세 조회
    public RegionDto getRegionById(Integer regionId) {
        return regionMapper.getRegionById(regionId);
    }

    // 새 지역 추가
    public RegionDto createRegion(RegionDto regionDto) {
        regionMapper.insertRegion(regionDto);
        return regionDto;
    }

    // 지역 수정
    public RegionDto updateRegion(RegionDto regionDto) {
        RegionDto existingRegion = regionMapper.getRegionById(regionDto.getRegionId());
        if (existingRegion != null) {
            regionMapper.updateRegion(regionDto);
            return regionDto;
        }
        return null;
    }

    // 지역 삭제
    public boolean deleteRegion(Integer regionId) {
        RegionDto existingRegion = regionMapper.getRegionById(regionId);
        if (existingRegion != null) {
            regionMapper.deleteRegion(regionId);
            return true;
        }
        return false;
    }
    
    // 모든 province 목록 조회
    public List<String> getDistinctProvinces() {
        return regionMapper.getDistinctProvinces();
    }
    
    // 특정 province의 city 목록 조회
    public List<String> getCitiesByProvince(String province) {
        return regionMapper.getCitiesByProvince(province);
    }
    
    // 특정 city의 district 목록 조회
    public List<String> getDistrictsByCity(String province, String city) {
        return regionMapper.getDistrictsByCity(province, city);
    }
    
    // 특정 district의 town 목록 조회
    public List<String> getTownsByDistrict(String province, String city, String district) {
        return regionMapper.getTownsByDistrict(province, city, district);
    }
    
 // 키워드로 지역 검색 (자동완성용)

    // 키워드로 지역 검색 (자동완성용)
    public List<RegionDto> searchRegionsByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        return regionMapper.searchRegionsByKeyword(keyword.trim());
    }
}
