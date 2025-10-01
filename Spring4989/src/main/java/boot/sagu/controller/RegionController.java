package boot.sagu.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import boot.sagu.dto.RegionDto;
import boot.sagu.mapper.RegionMapper;
import boot.sagu.service.RegionService;

@RestController
@RequestMapping("/api/regions")
public class RegionController {

    @Autowired
    private RegionService regionService;
    
    @Autowired
    private RegionMapper regionMapper;

    // 대한민국 특별시/광역시 목록 (예외 처리를 위한 데이터)
    private static final List<String> SPECIAL_METRO_CITIES = Arrays.asList(
            "서울", "부산", "대구", "인천",
            "광주", "대전", "울산", "세종특별자치시"
    );
    
    // 지역 목록 조회 (페이지네이션)
    @GetMapping
    public ResponseEntity<Page<RegionDto>> getRegions(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<RegionDto> regions = regionService.getRegions(pageable);
        return ResponseEntity.ok(regions);
    }

    // 지역 검색 (자동완성용) - {regionId} 패턴과 완전히 다른 경로 사용
    @GetMapping("/find")
    public ResponseEntity<List<RegionDto>> searchRegions(@RequestParam("keyword") String keyword) {
        try {
            System.out.println("=== Region Search Debug ===");
            System.out.println("Received keyword: " + keyword);
            System.out.println("Keyword type: " + (keyword != null ? keyword.getClass().getSimpleName() : "null"));
            System.out.println("Keyword length: " + (keyword != null ? keyword.length() : "N/A"));
            System.out.println("==========================");
            
            List<RegionDto> searchResults = regionService.searchRegionsByKeyword(keyword);
            System.out.println("Search results count: " + searchResults.size());
            return ResponseEntity.ok(searchResults);
        } catch (Exception e) {
            System.err.println("=== Region Search Error ===");
            System.err.println("Error type: " + e.getClass().getSimpleName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            System.err.println("==========================");
            return ResponseEntity.internalServerError().build();
        }
    }

    // 지역 상세 조회 - {regionId} 패턴
    @GetMapping("/{regionId}")
    public ResponseEntity<RegionDto> getRegion(@PathVariable(name = "regionId") Integer regionId) {
        RegionDto region = regionService.getRegionById(regionId);
        if (region != null) {
            return ResponseEntity.ok(region);
        }
        return ResponseEntity.notFound().build();
    }

    // 키워드로 지역 검색
//    @GetMapping("/search")
//    public ResponseEntity<List<RegionDto>> searchRegions(@RequestParam("keyword") String keyword) {
//        if (keyword == null || keyword.trim().isEmpty()) {
//            return ResponseEntity.badRequest().build();
//        }
//        
//        List<RegionDto> regions = regionService.searchRegionsByKeyword(keyword.trim());
//        return ResponseEntity.ok(regions);
//    }

    // 새 지역 추가
    @PostMapping("/register")
    public ResponseEntity<?> createRegion(@RequestBody RegionDto requestDto) {
    	 // 1. 필수 정보 유효성 검사
        if (requestDto.getAddress() == null || requestDto.getAddress().isEmpty() ||
            requestDto.getLatitude() == 0 || requestDto.getLongitude() == 0) {
            return ResponseEntity.badRequest().body("필수 정보가 누락되었습니다.");
        }

        String address = requestDto.getAddress();
        String[] addressParts = address.split(" ");

        String province = null;
        String city = null;
        String district = null;
        String town = null;

        // 2. 주소 파싱 로직
        if (addressParts.length > 0) {
            String firstPart = addressParts[0];

            // 2-1. 특별시/광역시 예외 처리
            if (SPECIAL_METRO_CITIES.contains(firstPart)) {
                // 예: "서울특별시 강남구 압구정동"
                province = firstPart; // "서울특별시"
                // city는 null로 처리
                if (addressParts.length > 1) {
                    district = addressParts[1]; // "강남구"
                }
                if (addressParts.length > 2) {
                    town = addressParts[2]; // "압구정동"
                }
            }
            // 2-2. 일반 '도' 주소 처리
            else if(addressParts.length > 3){
                // 예: "경기 성남시 분당구 백현동"
                province = firstPart; // "경기"
                if (addressParts.length > 1) {
                    city = addressParts[1]; // "성남시"
                }
                if (addressParts.length > 2) {
                    district = addressParts[2]; // "분당구"
                }
                if (addressParts.length > 3) {
                    town = addressParts[3]; // "백현동"
                }
            }
            
            else {
            	 // 예: "경기 하남시 미사동"
                province = firstPart; // "경기"
                if (addressParts.length > 1) {
                    city = addressParts[1]; // "하남시"
                }
                if (addressParts.length > 2) {
                	town = addressParts[2]; // "미사동"
                }
            }
        }
        
        // 3. 파싱된 데이터로 DTO 생성 및 저장
        RegionDto region = new RegionDto();
        region.setProvince(province);
        region.setCity(city);
        region.setDistrict(district);
        region.setTown(town);
        region.setLatitude(requestDto.getLatitude());
        region.setLongitude(requestDto.getLongitude());

        try {
            System.out.println("Province: " + province);
            System.out.println("City: " + city);
            System.out.println("District: " + district);
            System.out.println("Town: " + town);

            regionMapper.insertRegion(region);
            return ResponseEntity.ok("주소 정보가 성공적으로 저장되었습니다.");
        } catch (Exception e) {
            System.err.println("DB 저장 오류: " + e.getMessage());
            e.printStackTrace(); 
            return ResponseEntity.status(500).body("DB 저장 중 오류가 발생했습니다.");
        }
    }

    // 지역 수정
    @PutMapping("/{regionId}")
    public ResponseEntity<RegionDto> updateRegion(
            @PathVariable(name = "regionId") Integer regionId,
            @RequestBody RegionDto regionDto) {
        
        regionDto.setRegionId(regionId);
        RegionDto updatedRegion = regionService.updateRegion(regionDto);
        if (updatedRegion != null) {
            return ResponseEntity.ok(updatedRegion);
        }
        return ResponseEntity.notFound().build();
    }

    // 지역 삭제
    @DeleteMapping("/{regionId}")
    public ResponseEntity<Void> deleteRegion(@PathVariable(name = "regionId") Integer regionId) {
        boolean deleted = regionService.deleteRegion(regionId);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}