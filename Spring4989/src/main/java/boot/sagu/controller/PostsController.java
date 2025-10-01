package boot.sagu.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import boot.sagu.config.JwtUtil;
import boot.sagu.dto.CarDto;
import boot.sagu.dto.ItemDto;
import boot.sagu.dto.MemberDto;
import boot.sagu.dto.MemberRegionDto;
import boot.sagu.dto.PostsDto;
import boot.sagu.dto.RealEstateDto;
import boot.sagu.dto.RegionDto;
import boot.sagu.dto.ReportsDto;
import boot.sagu.service.CarService;
import boot.sagu.service.EstateService;
import boot.sagu.service.ItemService;
import boot.sagu.service.MemberServiceInter;
import boot.sagu.service.PostsService;
import boot.sagu.service.RegionService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/post")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5176", "http://localhost:5177"})
public class PostsController {
   
   @Autowired
   private PostsService postService;
   
   @Autowired
   private JwtUtil jwtUtil;
   
   @Autowired
   private MemberServiceInter memberService;
   
   @Autowired
   CarService carService;
   
   @Autowired
   EstateService estateService;
   
   @Autowired
   ItemService itemService;
   
   @Autowired
   RegionService regionService;
   
//   @GetMapping("/list")
//   public List<PostsDto> list()
//   {
//      return postService.getAllPostData();
//   }
   
   @GetMapping("/list")
   public List<Map<String, Object>> list() {
       return postService.getPostListWithNick();
   }
   
   @GetMapping("/search")
   public ResponseEntity<Map<String, Object>> search(
         @RequestParam(value = "keyword", required = false) String keyword,
         @RequestParam(value = "postType", required = false) String postType,
         @RequestParam(value = "status", required = false) String status,
         @RequestParam(value = "tradeType", required = false) String tradeType,
         @RequestParam(value = "minPrice", required = false) Integer minPrice,
         @RequestParam(value = "maxPrice", required = false) Integer maxPrice,
         @RequestParam(value = "minYear", required = false) Integer minYear,
         @RequestParam(value = "maxYear", required = false) Integer maxYear,
         @RequestParam(value = "minArea", required = false) Integer minArea,
         @RequestParam(value = "maxArea", required = false) Integer maxArea,
         @RequestParam(value = "categoryId", required = false) String categoryId,
         @RequestParam(value = "sortBy", required = false) String sortBy,
         @RequestParam(value = "sortOrder", required = false) String sortOrder,
         @RequestParam(value = "page", defaultValue = "1") int page,
         @RequestParam(value = "size", defaultValue = "12") int size,
         @RequestHeader(value="Authorization", required=false) String authorization,
         @ModelAttribute MemberRegionDto mrdto) {
      
      try {
         // 검색 파라미터를 Map으로 구성
         Map<String, Object> searchParams = new HashMap<>();
         searchParams.put("keyword", keyword);
         searchParams.put("postType", postType);
         searchParams.put("status", status);
         searchParams.put("tradeType", tradeType);
         searchParams.put("minPrice", minPrice);
         searchParams.put("maxPrice", maxPrice);
         searchParams.put("minYear", minYear);
         searchParams.put("maxYear", maxYear);
         searchParams.put("minArea", minArea);
         searchParams.put("maxArea", maxArea);
         searchParams.put("categoryId", categoryId);
         searchParams.put("sortBy", sortBy);
         searchParams.put("sortOrder", sortOrder);
         searchParams.put("page", page);
         searchParams.put("size", size);
         
         // ✅ 로그인 시에만 memberId 주입 (regionId는 사용하지 않음)
           Long memberId = null;
           if (authorization != null && authorization.startsWith("Bearer ")) {
               try {
                   String token = authorization.substring(7);
                   memberId = ((long)jwtUtil.extractMemberId(token));
               } catch (Exception ignored) {}
           }
           searchParams.put("memberId", memberId); // 로그인이면 값, 아니면 null
         
         // ✅ regionId 처리 (로그인시에만 지역 제한)
         /*
          * Long memberId = null; try { if (authorization != null &&
          * authorization.startsWith("Bearer ")) { String token =
          * authorization.substring(7); memberId =
          * ((long)jwtUtil.extractMemberId(token)); // 유효성 검사 포함 if (memberId != 0 &&
          * mrdto.getRegionId() != 0) {
          * 
          * } } } catch (Exception ignore) { // 토큰 무효/만료 → regionId 그대로 null }
          * 
          * searchParams.put("memberId", memberId );
          */
         
         List<PostsDto> searchResults = postService.searchAll(searchParams);
         int totalCount = postService.countSearchAll(searchParams);
         
         Map<String, Object> response = new HashMap<>();
         response.put("content", searchResults);
         response.put("totalElements", totalCount);
         response.put("currentPage", page);
         response.put("size", size);
         response.put("totalPages", (int) Math.ceil((double) totalCount / size));
         
         return ResponseEntity.ok(response);
      } catch (Exception e) {
         Map<String, Object> errorResponse = new HashMap<>();
         errorResponse.put("error", "검색 중 오류가 발생했습니다: " + e.getMessage());
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
      }
   }
   
   // 테스트용 간단한 검색 엔드포인트
   @GetMapping("/search-simple")
   public ResponseEntity<Map<String, Object>> searchSimple(
         @RequestParam(value = "keyword", required = false) String keyword,
         @RequestParam(value = "page", defaultValue = "1") int page,
         @RequestParam(value = "size", defaultValue = "12") int size) {
      
      try {
               // 간단한 검색 파라미터를 Map으로 구성
      Map<String, Object> searchParams = new HashMap<>();
      searchParams.put("keyword", keyword);
      searchParams.put("postType", "ALL");
      searchParams.put("status", "ALL");
      searchParams.put("tradeType", "ALL");
      searchParams.put("categoryId", "ALL");
      searchParams.put("sortBy", "");
      searchParams.put("sortOrder", "");
      searchParams.put("page", page);
      searchParams.put("size", size);
      
      // 디버깅용 로그
      System.out.println("=== search-simple 디버깅 ===");
      System.out.println("요청된 페이지: " + page);
      System.out.println("요청된 크기: " + size);
      System.out.println("searchParams: " + searchParams);
         
         List<PostsDto> searchResults = postService.searchAll(searchParams);
         int totalCount = postService.countSearchAll(searchParams);
         
         Map<String, Object> response = new HashMap<>();
         response.put("content", searchResults);
         response.put("totalElements", totalCount);
         response.put("currentPage", page);
         response.put("size", size);
         response.put("totalPages", (int) Math.ceil((double) totalCount / size));
         
         return ResponseEntity.ok(response);
      } catch (Exception e) {
         Map<String, Object> errorResponse = new HashMap<>();
         errorResponse.put("error", "검색 중 오류가 발생했습니다: " + e.getMessage());
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
      }
   }
   
   @PostMapping("/upload")
   public String fileUpload(@RequestParam("uploadFile") MultipartFile uploadFile,HttpSession session) 
   {
      
      return null;
   }
   
   @PostMapping("/insert")
   public void insertPostWithPhoto(@ModelAttribute PostsDto pdto,
         @ModelAttribute CarDto cdto,
         @ModelAttribute RealEstateDto rdto,
         @ModelAttribute ItemDto idto,
         @RequestParam(value = "uploadFiles", required = false) List<MultipartFile> uploadFiles,
         @RequestHeader(value = "Authorization", required = false) String authorization,
          HttpSession session)
   {
      // JWT 토큰에서 사용자 정보 추출
      if (authorization != null && authorization.startsWith("Bearer ")) {
         String token = authorization.substring(7);
         try {
            String loginId = jwtUtil.extractUsername(token);
            MemberDto member = memberService.getMemberByLoginId(loginId);
            pdto.setMemberId((long) member.getMemberId());
            System.out.println("로그인한 사용자 ID: " + member.getMemberId());
         } catch (Exception e) {
            System.out.println("JWT 토큰 처리 중 오류: " + e.getMessage());
            // 토큰이 유효하지 않으면 기본값 설정 (테스트용)
            pdto.setMemberId(1L); // 임시로 1번 사용자로 설정
         }
      } else {
         // Authorization 헤더가 없으면 기본값 설정 (테스트용)
         pdto.setMemberId(1L); // 임시로 1번 사용자로 설정
         System.out.println("Authorization 헤더가 없어서 기본 사용자 ID 설정: " + pdto.getMemberId());
      }
      
      postService.insertPostWithPhoto(pdto, uploadFiles, session, cdto, rdto, idto);
   }
   
   @GetMapping("/detail")
   public Map<String, Object> getPostDetail(@RequestParam("postId") Long postId) {
       return postService.getPostData(postId);
   }
   
   @GetMapping("/cardetail")
   public CarDto getOneCarData(@RequestParam("postId") Long postId)
   {
      return carService.getOneCarData(postId);
   }
   
   @GetMapping("/itemdetail")
   public ItemDto getOneItemData(@RequestParam("postId") Long postId)
   {
      return itemService.getOneItemData(postId);
   }
   
   @GetMapping("/estatedetail")
   public RealEstateDto getOneEstateData(@RequestParam("postId") Long postId)
   {
      return estateService.getOneEstateData(postId);
   }
   
   @PostMapping("/viewcount")
   public void increaseViewCount(@RequestParam("postId") Long postId)
   {
      postService.increaseViewCount(postId);
   }

   
   @GetMapping("/count")
    public Map<String, Object> count(@RequestParam("postId") Long postId) {
        int count = postService.countFavorite(postId);
        return Map.of("count", count);
    }
   
   @GetMapping("/checkfav")
   public Map<String, Boolean> isFavorited(@RequestParam("postId") Long postId,
         @RequestHeader("Authorization") String authorization)
   {
      String token = authorization.substring(7);
      long memberId=jwtUtil.extractMemberId(token);
      boolean favorited=postService.isFavorited(postId, (long)memberId);
      return Map.of("favorited",favorited);
   }
   
   @PostMapping("/toggle")
   public Map<String, Object> toggleFavorite(@RequestParam("postId") Long postId,
         @RequestHeader("Authorization") String authorization)
   {
      String token=authorization.substring(7);
      long memberId=jwtUtil.extractMemberId(token);
      boolean nowFavorited=postService.toggleFavorite(postId, (long)memberId);
      int count=postService.countFavorite(postId);
      return Map.of("favorited",nowFavorited,"count",count);
   }
   
   
   @PostMapping(value = "/update")
    public ResponseEntity<Void> updatePost(
            @ModelAttribute PostsDto post,                     // postId 필수
            @ModelAttribute CarDto car,
            @ModelAttribute RealEstateDto realEstate,
            @ModelAttribute ItemDto item,
            @RequestParam(value = "uploadFiles", required = false) List<MultipartFile> uploadFiles,
            @RequestParam(value = "deletePhotoIds", required = false) List<Long> deletePhotoIds,
            @RequestParam(value = "mainPhotoId", required = false) Long mainPhotoId,
            @RequestHeader("Authorization") String authorization,
            HttpSession session
    ) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        long actorId = jwtUtil.extractMemberId(authorization.substring(7));

        postService.updatePostAll(post, car, realEstate, item,
                                  uploadFiles, deletePhotoIds, mainPhotoId,
                                  session, actorId);
        return ResponseEntity.ok().build();
    }
   
   @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable(name = "postId") Long postId,
                                           @RequestHeader("Authorization") String authorization,
                                           @ModelAttribute PostsDto dto) {
        // JWT 검증 로직 넣을 수 있음 (작성자 본인인지 확인)
      long actorId=jwtUtil.extractMemberId(authorization.substring(7));
        postService.deletePost(postId, dto, actorId);
        return ResponseEntity.ok().build();
    }
    
    // 어드민 권한으로 게시글 삭제 (memberId=1인 경우 모든 게시글 삭제 가능)
    @DeleteMapping("/admin/{postId}")
    public ResponseEntity<Map<String, Object>> deletePostByAdmin(
            @PathVariable(name = "postId") Long postId,
            @RequestHeader("Authorization") String authorization) {
        try {
            // JWT 토큰 검증
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "인증 토큰이 필요합니다."));
            }
            
            String token = authorization.substring(7);
            long adminId = jwtUtil.extractMemberId(token);
            
            // 관리자 권한 확인 (memberId가 1인 경우 관리자로 가정)
            if (adminId != 1) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", "관리자 권한이 필요합니다."));
            }
            
            // 어드민 권한으로 게시글 삭제
            postService.deletePostByAdmin(postId, adminId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "게시글이 성공적으로 삭제되었습니다."
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "게시글 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
   
   //신고
   @PostMapping("report")
   public ResponseEntity<?> insertReport(@ModelAttribute ReportsDto dto,
            @RequestHeader("Authorization") String authorization) 
   {
      long memberId = jwtUtil.extractMemberId(authorization.substring(7));
       dto.setReporterId(memberId);

       if ("POST".equals(dto.getTargetType())) {
           // post FK 체크 후 저장
       } else if ("MEMBER".equals(dto.getTargetType())) {
           // member FK 체크 후 저장
       } else {
           return ResponseEntity.badRequest().build();
       }

       postService.insertReport(dto);
       return ResponseEntity.ok().build();
   }
   

   
   // 채팅방 참여자 조회 API (판매완료 시 거래자 선택용)
   @GetMapping("/chatParticipants")
   public ResponseEntity<Map<String, Object>> getChatParticipants(
         @RequestParam("postId") Long postId,
         @RequestHeader("Authorization") String authorization) {
      
      try {
         // JWT 토큰에서 사용자 ID 추출
         if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
               .body(Map.of("success", false, "message", "인증 토큰이 필요합니다."));
         }
         
         String token = authorization.substring(7);
         long memberId = jwtUtil.extractMemberId(token);
         
         // 권한 확인 (작성자 본인만 가능)
         Long ownerId = postService.findPostOwnerId(postId);
         if (ownerId == null || !ownerId.equals(memberId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
               .body(Map.of("success", false, "message", "권한이 없습니다."));
         }
         
         // 채팅방 참여자 조회
         List<Map<String, Object>> participants = postService.getChatParticipants(postId);
         
         return ResponseEntity.ok(Map.of(
            "success", true, 
            "participants", participants
         ));
         
      } catch (Exception e) {
         System.err.println("채팅방 참여자 조회 중 오류 발생: " + e.getMessage());
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", "서버 오류가 발생했습니다."));
      }
   }

   // 판매 상태 변경 API (거래자 선택 포함)
   @PutMapping("/updateStatus")
   public ResponseEntity<Map<String, Object>> updatePostStatus(
         @RequestParam("postId") Long postId,
         @RequestParam("status") String status,
         @RequestParam(value = "buyerId", required = false) Long buyerId,
         @RequestHeader("Authorization") String authorization) {
      
      try {
         // JWT 토큰에서 사용자 ID 추출
         if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
               .body(Map.of("success", false, "message", "인증 토큰이 필요합니다."));
         }
         
         String token = authorization.substring(7);
         long memberId = jwtUtil.extractMemberId(token);
         
         // 권한 확인 및 상태 변경 실행
         boolean success = postService.updatePostStatus(postId, status, buyerId, memberId);
         
         if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "상태가 성공적으로 변경되었습니다."));
         } else {
            return ResponseEntity.badRequest()
               .body(Map.of("success", false, "message", "상태 변경에 실패했습니다."));
         }
         
      } catch (Exception e) {
         System.err.println("상태 변경 중 오류 발생: " + e.getMessage());
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", "서버 오류가 발생했습니다."));
      }
   }
   
   // 구매내역 조회 API
   @GetMapping("/purchaseHistory")
   public ResponseEntity<Map<String, Object>> getPurchaseHistory(
         @RequestHeader("Authorization") String authorization) {
      
      try {
         // System.out.println("🔍 구매내역 조회 API 호출됨");
         
         // JWT 토큰에서 사용자 ID 추출
         if (authorization == null || !authorization.startsWith("Bearer ")) {
            // System.err.println("❌ 인증 토큰이 없음");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
               .body(Map.of("success", false, "message", "인증 토큰이 필요합니다."));
         }
         
         String token = authorization.substring(7);
         long memberId = jwtUtil.extractMemberId(token);
         // System.out.println("👤 조회 요청 사용자 ID: " + memberId);
         
         // 구매내역 조회
         List<Map<String, Object>> purchases = postService.getPurchaseHistory(memberId);
         // System.out.println("🛒 조회된 구매내역 개수: " + (purchases != null ? purchases.size() : "null"));
         
         if (purchases != null && !purchases.isEmpty()) {
            // System.out.println("📋 첫 번째 구매내역: " + purchases.get(0));
         }
         
         return ResponseEntity.ok(Map.of(
            "success", true,
            "purchases", purchases
         ));
         
      } catch (Exception e) {
         // System.err.println("❌ 구매내역 조회 중 오류 발생: " + e.getMessage());
         e.printStackTrace();
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", "구매내역 조회 중 오류가 발생했습니다."));
      }
   }
   
   @GetMapping("/regiondetail")
   public ResponseEntity<RegionDto> getOneRegion(@RequestParam("regionId") Long regionId)
   {
      RegionDto region = postService.getOneRegion(regionId);
      if (region != null) {
         return ResponseEntity.ok(region);
      }
      return ResponseEntity.notFound().build();
   }
   
   // 지역별 필터링 API
   @GetMapping("/listByRegion")
   public List<Map<String, Object>> listByRegion(
         @RequestParam(value = "province", required = false) String province,
         @RequestParam(value = "city", required = false) String city,
         @RequestParam(value = "district", required = false) String district,
         @RequestParam(value = "town", required = false) String town) {
      
      Map<String, Object> regionParams = new HashMap<>();
      regionParams.put("province", province);
      regionParams.put("city", city);
      regionParams.put("district", district);
      regionParams.put("town", town);
      
      return postService.getPostListByRegion(regionParams);
   }
   
   // 지역 목록 조회 API (province, city, district, town별)
   @GetMapping("/regions")
   public Map<String, Object> getRegions(
         @RequestParam(value = "type", required = false) String type,
         @RequestParam(value = "province", required = false) String province,
         @RequestParam(value = "city", required = false) String city,
         @RequestParam(value = "district", required = false) String district) {
      
      Map<String, Object> result = new HashMap<>();
      
      try {
         switch (type) {
            case "provinces":
               result.put("data", regionService.getDistinctProvinces());
               break;
            case "cities":
               result.put("data", regionService.getCitiesByProvince(province));
               break;
            case "districts":
               result.put("data", regionService.getDistrictsByCity(province, city));
               break;
            case "towns":
               result.put("data", regionService.getTownsByDistrict(province, city, district));
               break;
            default:
               result.put("error", "Invalid type parameter");
         }
      } catch (Exception e) {
         result.put("error", e.getMessage());
      }
      
      return result;
   }
   
   // 신고 목록 조회 API
   @GetMapping("/reports")
   public ResponseEntity<Map<String, Object>> getAllReports(
         @RequestHeader("Authorization") String authorization) {
      try {
         // JWT 토큰 검증
         if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
               .body(Map.of("success", false, "message", "인증 토큰이 필요합니다."));
         }
         
         String token = authorization.substring(7);
         long memberId = jwtUtil.extractMemberId(token);
         
         // 관리자 권한 확인 (memberId가 1인 경우 관리자로 가정)
         if (memberId != 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
               .body(Map.of("success", false, "message", "관리자 권한이 필요합니다."));
         }
         
         List<Map<String, Object>> reports = postService.getAllReports();
         return ResponseEntity.ok(Map.of(
            "success", true,
            "reports", reports
         ));
      } catch (Exception e) {
         e.printStackTrace();
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", "신고 목록 조회 중 오류가 발생했습니다."));
      }
   }
   
       // 신고 상태 업데이트 API
    @PutMapping("/reports/{reportId}/status")
    public ResponseEntity<Map<String, Object>> updateReportStatus(
          @PathVariable(name = "reportId") Long reportId,
          @RequestParam("status") String status,
          @RequestHeader("Authorization") String authorization) {
      try {
         // JWT 토큰 검증
         if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
               .body(Map.of("success", false, "message", "인증 토큰이 필요합니다."));
         }
         
         String token = authorization.substring(7);
         long memberId = jwtUtil.extractMemberId(token);
         
         // 관리자 권한 확인 (memberId가 1인 경우 관리자로 가정)
         if (memberId != 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
               .body(Map.of("success", false, "message", "관리자 권한이 필요합니다."));
         }
         
         int result = postService.updateReportStatus(reportId, status);
         if (result > 0) {
            return ResponseEntity.ok(Map.of(
               "success", true,
               "message", "신고 상태가 업데이트되었습니다."
            ));
         } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
               .body(Map.of("success", false, "message", "신고를 찾을 수 없습니다."));
         }
      } catch (Exception e) {
         e.printStackTrace();
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", "신고 상태 업데이트 중 오류가 발생했습니다."));
      }
   }
   
   // 후기 조회 API (테스트용 - JWT 인증 없이)
   @GetMapping("/reviews/test")
   public ResponseEntity<Map<String, Object>> getUserReviewsTest(
         @RequestParam("memberId") Long memberId) {
      
      try {
         System.out.println("🔍 후기 조회 테스트 API 호출됨 - memberId: " + memberId);
         
         // review_opposite_id가 현재 로그인한 사용자인 후기들을 가져오기
         List<Map<String, Object>> reviews = postService.getReviewsForUser(memberId);
         System.out.println("📝 조회된 후기 개수: " + (reviews != null ? reviews.size() : "null"));
         
         if (reviews != null && !reviews.isEmpty()) {
            System.out.println("📋 첫 번째 후기: " + reviews.get(0));
         }
         
         return ResponseEntity.ok(Map.of(
            "success", true,
            "reviews", reviews
         ));
         
      } catch (Exception e) {
         System.err.println("❌ 후기 조회 중 오류 발생: " + e.getMessage());
         e.printStackTrace();
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", "후기 조회 중 오류가 발생했습니다."));
      }
   }
   
   // 총 게시글 수 조회 API
   @GetMapping("/total-count")
   public ResponseEntity<Map<String, Object>> getTotalPostsCount() {
      try {
         int totalPosts = postService.getTotalPostsCount();
         return ResponseEntity.ok(Map.of(
            "success", true,
            "totalPosts", totalPosts
         ));
      } catch (Exception e) {
         e.printStackTrace();
         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "message", "총 게시글 수 조회 중 오류가 발생했습니다."));
      }
   }
   
}