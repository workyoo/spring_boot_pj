package boot.sagu.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import boot.sagu.dto.EscrowOrderDTO;

@Mapper
public interface EscrowMapper {

	public int insertEscrowOrder(EscrowOrderDTO dto);
	public int markPaidByMerchantUid(@Param("merchantUid") String merchantUid, @Param("impUid") String impUid);
	// 낙찰자 본인의 에스크로 전표 1건 조회(최신)
    public EscrowOrderDTO findByPostAndBuyer(@Param("postId") long postId,
                                   @Param("memberId") long memberId);
}
