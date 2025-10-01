package boot.sagu.mapper;

import boot.sagu.dto.ReviewDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ReviewMapperInter {
    int insertReview(ReviewDto reviewDto);
    int checkReviewExists(@Param("postId") Long postId, @Param("reviewerId") Long reviewerId, @Param("reviewOppositeId") Long reviewOppositeId);
}
