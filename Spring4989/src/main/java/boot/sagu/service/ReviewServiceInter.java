package boot.sagu.service;

import boot.sagu.dto.ReviewDto;

public interface ReviewServiceInter {
    boolean createReview(ReviewDto reviewDto);
    boolean checkReviewExists(Long postId, Long reviewerId, Long reviewOppositeId);
}
