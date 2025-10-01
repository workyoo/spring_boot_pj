package boot.sagu.mapper;

import java.util.List;
import java.util.Map;

import boot.sagu.dto.AuctionDto;
import boot.sagu.dto.AuctionGuaranteeDTO;
import boot.sagu.dto.PostsDto;

public interface AuctionMapperInter {
    
    // 기존 메서드들
    List<PostsDto> getAuctionPosts();
    PostsDto getAuctionDetail(long postId);
    void insertBid(AuctionDto auctionDto);
    AuctionDto getHighestBid(long postId);
    List<PostsDto> getEndedAuctions();
    void updateAuctionStatus(long postId, String status, Long winnerId);
    List<Map<String, Object>> getAuctionPhotos(long postId);
    int countAuctionGuaranteeByPostAndMember(long postId, long memberId);
    void insertGuarantee(AuctionGuaranteeDTO guaranteeDTO);
    List<AuctionGuaranteeDTO> findNonWinnerGuarantees(long postId, long winnerId);
    void updateGuaranteeStatus(long guaranteeId, String status);
    int getStartPrice(long postId);
    void deleteAuction(long postId);
    void deleteUsedItemsByPostId(long postId);
    void deletePhotosByPostId(long postId);
    void deleteFavoritesByPostId(long postId);
    void deleteChatroomsByPostId(long postId);
    List<Map<String, Object>> getBidHistory(long postId);
    void incrementViewCount(long postId);
    AuctionGuaranteeDTO findGuarantee(long postId, long memberId);
    
    // 마이페이지 판매 내역 관련 메서드들
    Map<String, Object> getMyPostsCounts(int memberId);
    Map<String, Object> getMyPostsStatusCounts(Map<String, Object> params);
    List<PostsDto> getMyPosts(Map<String, Object> params);
    int getMyPostsTotalCount(Map<String, Object> params);
    
    // 마이페이지 입찰 내역 관련 메서드들
    List<Map<String, Object>> getMyBids(int memberId, String status, int offset, int limit);
    int getMyBidsTotalCount(int memberId);
    Map<String, Object> getMyBidsStatusCounts(int memberId);
    
    // 마이페이지 찜한 상품 관련 메서드들
    Map<String, Object> getMyFavoritesCounts(int memberId);
    List<Map<String, Object>> getMyFavorites(Map<String, Object> params);
    int getMyFavoritesTotalCount(Map<String, Object> params);
    Map<String, Object> getMyFavoritesTypeCounts(int memberId);
}
