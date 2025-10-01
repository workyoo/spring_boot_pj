package boot.sagu.mapper;

import java.util.List;
import java.util.Map;

import boot.sagu.dto.CarDto;
import boot.sagu.dto.ItemDto;
import boot.sagu.dto.PostsDto;
import boot.sagu.dto.RealEstateDto;
import boot.sagu.dto.RegionDto;
import boot.sagu.dto.ReportsDto;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.bind.annotation.RequestParam;

@Mapper
public interface PostsMapperInter {
	public void insertPost(PostsDto pdto);
	public List<PostsDto> getAllPostData();
	public Map<String, Object> getPostData(@RequestParam("postId") Long postId);
	public List<Map<String, Object>> getPostListWithNick();
	public void increaseViewCount(@RequestParam("postId") Long postId);
	
	//	좋아요	
	public int countFavorite(@Param("postId") Long postId);
	public int existsFavorite(@Param("postId") Long postId, @Param("memberId") Long memberId);
	public int insertFavorite(@Param("postId") Long postId, @Param("memberId") Long memberId);
	public int deleteFavorite(@Param("postId") Long postId, @Param("memberId") Long memberId);
	
	// 게시글 공통 수정 (posts)
    int updatePost(PostsDto post);

    // 자동차 서브 수정 (cars)
    int updateCar(CarDto car);

    // 부동산 서브 수정 (real_estates)
    int updateRealEstate(RealEstateDto realEstate);

    // 중고물품 서브 수정 (used_items)
    int updateItem(ItemDto item);
    


    // (선택) 경매 종료시간 보정
    int updateAuctionEndTimeToNowPlus24H(@Param("postId") Long postId);
    
    //삭제
    void deletePost(@Param("postId") Long postId);
    
    // 어드민 권한으로 게시글 삭제 (memberId=1인 경우 모든 게시글 삭제 가능)
    void deletePostByAdmin(@Param("postId") Long postId, @Param("adminId") Long adminId);
	
	//신고
	public int insertReport(ReportsDto dto);
	
	// 신고 목록 조회
	List<Map<String, Object>> getAllReports();
	
	// 신고 상태 업데이트
	int updateReportStatus(@Param("reportId") Long reportId, @Param("status") String status);
	
	//검색
	List<PostsDto> searchAll(
		@Param("keyword") String keyword,
		@Param("postType") String postType, // "ALL" 또는 "CARS"/"REAL_ESTATES"/"ITEMS"
		@Param("status") String status, // "ALL" 또는 "ON_SALE"/"SOLD"/"RESERVED"
		@Param("tradeType") String tradeType, // "ALL" 또는 "SALE"/"AUCTION"/"SHARE"
		@Param("minPrice") Integer minPrice,
		@Param("maxPrice") Integer maxPrice,
		@Param("minYear") Integer minYear,
		@Param("maxYear") Integer maxYear,
		@Param("minArea") Integer minArea,
		@Param("maxArea") Integer maxArea,
		@Param("categoryId") String categoryId, // 중고물품 카테고리 ID
		@Param("sortBy") String sortBy, // "price", "created_at", "view_count"
		@Param("sortOrder") String sortOrder, // "asc", "desc"
		@Param("size") int size,
		@Param("offset") int offset,
		@Param("memberId") Long memberId
	);
	
	int countSearchAll(
		@Param("keyword") String keyword,
		@Param("postType") String postType,
		@Param("status") String status,
		@Param("tradeType") String tradeType,
		@Param("minPrice") Integer minPrice,
		@Param("maxPrice") Integer maxPrice,
		@Param("minYear") Integer minYear,
		@Param("maxYear") Integer maxYear,
		@Param("minArea") Integer minArea,
		@Param("maxArea") Integer maxArea,
		@Param("categoryId") String categoryId,
		@Param("memberId") Long memberId
	);
	
	// 판매 상태 변경
	int updatePostStatus(@Param("postId") Long postId, @Param("status") String status);
	
	// 판매 상태 변경 (거래자 포함)
	int updatePostStatusWithBuyer(@Param("postId") Long postId, @Param("status") String status, @Param("buyerId") Long buyerId);
	
	// 채팅방 참여자 조회
	List<Map<String, Object>> getChatParticipants(@Param("postId") Long postId);
	
	// 구매내역 조회
	List<Map<String, Object>> getPurchaseHistory(@Param("memberId") Long memberId);
	
	// 지역별 게시물 목록 조회
	List<Map<String, Object>> getPostListByRegion(Map<String, Object> regionParams);
	
	// 게시물 소유자 조회 (메서드명 수정)
	Long findPostOwnerId(@Param("postId") Long postId);
	
	// 지역 조회
	RegionDto getOneRegion(@Param("regionId") Long regionId);
	// 후기 조회
	List<Map<String, Object>> getReviewsForUser(@Param("memberId") Long memberId);
	
	// 총 게시물 수 조회
	int getTotalPostsCount();
	
}