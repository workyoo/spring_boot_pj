package boot.sagu.service;

import java.util.List;
import java.util.Map;

import boot.sagu.dto.AuctionDto;
import boot.sagu.dto.AuctionGuaranteeDTO;
import boot.sagu.dto.FavoritesDto;
import boot.sagu.dto.MemberDto;
import boot.sagu.dto.PostsDto;


public interface AuctionServiceInter {
	
		public List<PostsDto> getAuctionPosts();
	
	 	// 경매 상세 정보
	   public PostsDto getAuctionDetail(long postId);
	   
	   // 최고 입찰 정보
	   public AuctionDto getHighestBid(long postId);
	   
	   // 회원 닉네임 조회
	   public MemberDto getMemberNickname(long memberId);
	   

	   
	   // 입찰 처리
	   public String placeBid(AuctionDto auctionDto);
	   
	   // 경매 종료
	   public String endAuction(long postId);
	   
	   // 자동 경매 종료 체크 (스케줄러용)
	   public void checkAndEndAuctions();
	   
	   // 경매 사진 조회
	   public List<Map<String, Object>> getAuctionPhotos(long postId);
	
	   public int getStartPrice(long postId); //시작가
	   public boolean isGuaranteePaid(long postId,long memberId); //게시글에 보증금 납부했는지
	   public void insertGuarantee(AuctionGuaranteeDTO AuctionGuaranteeDto); //보증금 납부
	   public List<AuctionGuaranteeDTO> findNonWinnerGuarantees(long postId,long winnerId);//낙찰자가 아닌 사람들의 입찰자들의 리스트뽑기
	   public void updateGuaranteeStatus(long guaranteeId,String status); //보증금 관리
	   
	   public String placeBidWithGuarantee(AuctionDto auctionDto); //최초 입찰 시 보증금 없으면 결제링크 반환
	
	   public void insertBid(AuctionDto auctionDto); // 입찰 정보 저장용
	   

	   public int existsGuaranteeByImpUid(String impUid);
	   
	   // ==================================마이페이지 입찰 내역 관련 메서드==================================
	   
	   // 내 입찰 기록 조회 (페이징 포함)
	   public List<Map<String, Object>> getMyBids(int memberId, String status, int offset, int limit);
	   
	   // 내 입찰 기록 총 개수
	   public int getMyBidsTotalCount(int memberId);
	   
	   // 내 입찰 기록 상태별 개수
	   public Map<String, Object> getMyBidsStatusCounts(int memberId);
}
