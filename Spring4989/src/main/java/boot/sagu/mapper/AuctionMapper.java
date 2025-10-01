package boot.sagu.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.AuctionDto;
import boot.sagu.dto.AuctionGuaranteeDTO;
import boot.sagu.dto.FavoritesDto;
import boot.sagu.dto.MemberDto;
import boot.sagu.dto.PostsDto;

@Mapper
public interface AuctionMapper {
	public List<PostsDto> getAuctionPosts(@Param("sortType") String sortType); // 경매글 리스트용 (정렬 포함)
	public PostsDto getAuctionDetail(@Param("postId") long postId); // 경매글 상세 조회용
	public void insertBid(AuctionDto auctionDto); // 입찰 정보 저장용
	public AuctionDto getHighestBid(@Param("postId") long postId); // 최고가 조회용
	public MemberDto getMemberNickname(@Param("memberId") long memberId); // 작성자 닉네임 조회용
	
	// 경매 종료 처리용 메서드들
	public List<PostsDto> getEndedAuctions(); // 종료된 경매 목록 조회
	public void updateWinnerId(@Param("postId") long postId, @Param("winnerId") long winnerId); // winner_id 업데이트
	public void updateAuctionStatus(@Param("postId") long postId, @Param("status") String status); // 경매 상태 업데이트
	public void updateAuctionStatusAndEndTime(@Param("postId") long postId, @Param("status") String status); // 수동 경매 종료 시 상태와 종료시간 업데이트
	

	
	// 경매 사진 조회
	public List<Map<String, Object>> getAuctionPhotos(@Param("postId") long postId);
	
	//보증금 메서드
	public int countAuctionGuaranteeByPostAndMember(@Param("postId")long postId,@Param("memberId")long memberId); //게시글에 보증금 납부했는지
	//보증금 납부
	public void insertGuarantee(AuctionGuaranteeDTO AuctionGuaranteeDto); 
	//낙찰자가 아닌 사람들의 입찰자들의 리스트뽑기 	
	public List<AuctionGuaranteeDTO> findNonWinnerGuarantees(@Param("postId")long postId,@Param("winnerId")long winnerId);
	//보증금 상태관리
	public int updateGuaranteeStatus(@Param("guaranteeId")long guaranteeId,@Param("status") String status);
	//경매 시작가
	public int getStartPrice(@Param("postId") long postId);
	

	// 경매 삭제
	public void deleteAuction(@Param("postId") long postId);
	
	// 경매 삭제 전 연관된 used_items 데이터 삭제
	public void deleteUsedItemsByPostId(@Param("postId") long postId);
	
	// 경매 삭제 전 연관된 사진 데이터 삭제
	public void deletePhotosByPostId(@Param("postId") long postId);
	
	// 경매 삭제 전 연관된 favorites 데이터 삭제
	public void deleteFavoritesByPostId(@Param("postId") long postId);
	
	// 경매 삭제 전 연관된 chatroom 데이터 삭제
	public void deleteChatroomsByPostId(@Param("postId") long postId);

	
	// 입찰 기록 조회 (최근 5개, 닉네임 포함)
	public List<Map<String, Object>> getBidHistory(@Param("postId") long postId);
	
	// 조회수 증가
	public void incrementViewCount(@Param("postId") long postId);
	


	// 보증금 단건 조회
	public AuctionGuaranteeDTO findGuarantee(@Param("postId") long postId,
	                                  @Param("memberId") long memberId);
	
	//유찰 시 해당 글의 PAID 보증금 전체 조회
	public List<AuctionGuaranteeDTO> findPaidGuaranteesByPost(@Param("postId") long postId);

	// ==================================마이페이지 판매 내역 관련 메서드==================================
	
	// 내 게시글 타입별 개수 조회
	public Map<String, Object> getMyPostsCounts(@Param("memberId") int memberId);
	
	// 내 게시글 상태별 개수 조회 (타입 필터 적용)
	public Map<String, Object> getMyPostsStatusCounts(Map<String, Object> params);
	
	// 내 게시글 목록 조회 (페이징 포함)
	public List<PostsDto> getMyPosts(Map<String, Object> params);
	
	// 내 게시글 총 개수 조회 (페이징용)
	public int getMyPostsTotalCount(Map<String, Object> params);

	// ==================================마이페이지 입찰 내역 관련 메서드==================================
	
	// 내 입찰 기록 조회 (페이징 포함)
	public List<Map<String, Object>> getMyBids(@Param("memberId") int memberId, 
	                                           @Param("status") String status,
	                                           @Param("offset") int offset, 
	                                           @Param("limit") int limit);
	
	// 내 입찰 기록 총 개수
	public int getMyBidsTotalCount(@Param("memberId") int memberId);
	
	// 내 입찰 기록 상태별 개수
	public Map<String, Object> getMyBidsStatusCounts(@Param("memberId") int memberId);


	// 경매 게시글만 조회
	public List<Map<String, Object>> getMyAuctionPosts(@Param("memberId") long memberId,
												@Param("status") String status);

	// 일반거래 게시글만 조회
	public List<Map<String, Object>> getMyGeneralPosts(@Param("memberId") long memberId,
												@Param("status") String status);

	// 나눔 게시글만 조회
	public List<Map<String, Object>> getMyGiveawayPosts(@Param("memberId") long memberId,
												 @Param("status") String status);

	// 유찰 게시글만 조회 (경매에서만 발생)
	public List<Map<String, Object>> getMyCancelledAuctionPosts(@Param("memberId") long memberId);
	
	public int existsGuaranteeByImpUid(@Param("impUid") String impUid);

	// ==================================마이페이지 찜한 상품 관련 메서드==================================
	
	// 내 찜한 상품 타입별 개수 조회
	public Map<String, Object> getMyFavoritesCounts(@Param("memberId") int memberId);
	
	// 내 찜한 상품 목록 조회 (페이징 포함)
	public List<Map<String, Object>> getMyFavorites(Map<String, Object> params);
	
	// 내 찜한 상품 총 개수 조회 (페이징용)
	public int getMyFavoritesTotalCount(Map<String, Object> params);
	
	// 내 찜한 상품 타입별 개수 조회
	public Map<String, Object> getMyFavoritesTypeCounts(@Param("memberId") int memberId);


}
