package boot.sagu.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import boot.sagu.dto.AuctionDto;
import boot.sagu.dto.AuctionGuaranteeDTO;
import boot.sagu.dto.EscrowOrderDTO;
import boot.sagu.dto.PostsDto;
import boot.sagu.mapper.AuctionMapper;
import boot.sagu.mapper.EscrowMapper;
import boot.sagu.service.PortOneService.PortOnePayment;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class EscrowService {

	   private final PortOneService portOneService;
	    private final AuctionMapper auctionMapper;     // 최종가 조회
	    private final EscrowMapper escrowMapper;       // 에스크로 전표
	    private final AuctionService auctionService;

	    @Transactional
	    public void handleEscrowPaid(Long postId, Long buyerId, String impUid, String merchantUid) {
	        if (postId == null || buyerId == null || impUid == null || merchantUid == null) return;

	        // 1) 포트원 결제 단건 조회(서버 검증)
	        PortOnePayment pay = portOneService.getPayment(impUid);
	        if (pay == null || !"paid".equalsIgnoreCase(pay.getStatus())) return;

	        // 2) 최종가 조회
	        AuctionDto highest = auctionMapper.getHighestBid(postId);
	        if (highest == null || highest.getBidAmount() == null) return;
	        int finalPrice = highest.getBidAmount().intValue();

	        // 3) 낙찰자의 보증금 조회
	        AuctionGuaranteeDTO g = auctionMapper.findGuarantee(postId, buyerId);
	        int deposit = (g != null && g.getAmount() != null) ? g.getAmount().intValue() : 0;

	        // 4) 기대 결제 금액 = 최종가 - 보증금 (음수 방지)
	        int expected = Math.max(0, finalPrice - deposit);

	        // 5) 금액/merchant_uid 검증 (차감형)
	        if (pay.getAmount() != expected || !merchantUid.equals(pay.getMerchantUid())) {
	            // 위변조/금액 불일치 → 즉시 취소 권장
	            portOneService.cancelPayment(impUid, "에스크로 검증 실패(차감형)", null);
	            return;
	        }

	        // 6) 에스크로 전표 상태 갱신
	        escrowMapper.markPaidByMerchantUid(merchantUid, impUid);

	        // 7) 비낙찰자 보증금 환불
	        auctionService.refundNonWinners(postId, buyerId);

	        // 8) 낙찰자 보증금은 환불하지 않음 → 'APPLIED(차감됨)' 처리
	        if (g != null && "PAID".equalsIgnoreCase(g.getStatus())) {
	            auctionMapper.updateGuaranteeStatus(g.getGuaranteeId(), "APPLIED");
	        }
	    }
	    
	    @Transactional
	    public void endAsCancelled(long postId) {
	        // 1) 상태만 유찰로
	        auctionMapper.updateAuctionStatus(postId, "CANCELLED");

	        // 2) 남아있는 PAID 보증금 전체 조회
	        List<AuctionGuaranteeDTO> list = auctionMapper.findPaidGuaranteesByPost(postId);
	        if (list == null || list.isEmpty()) return;

	        // 3) 개별 환불 시도 (실패해도 다음 사람 계속)
	        for (AuctionGuaranteeDTO g : list) {
	            try {
	                portOneService.refundPayment(g.getImpUid(), g.getAmount());
	                auctionMapper.updateGuaranteeStatus(g.getGuaranteeId(), "REFUNDED");
	            } catch (Exception e) {
	                // TODO: 로그만 남기고 다음 사람 처리
	                // log.warn("유찰 환불 실패 postId={}, guaranteeId={}, err={}", postId, g.getGuaranteeId(), e.toString());
	            }
	        }
	    }
	    
	    public EscrowOrderDTO findMyEscrowOrder(long postId, long memberId) {
	        return escrowMapper.findByPostAndBuyer(postId, memberId); // mapper에서 SELECT
	    }
	    
	    @Transactional
	    public Map<String, Object> createOrderForWinner(long postId, long memberId) {
	        PostsDto auction = auctionMapper.getAuctionDetail(postId);
	        if (auction == null) throw new IllegalStateException("경매글을 찾을 수 없습니다.");
	        if (!"SOLD".equalsIgnoreCase(auction.getStatus()))
	            throw new IllegalStateException("경매가 종료되지 않았습니다.");
	        if (auction.getWinnerId() == null || auction.getWinnerId() != memberId)
	            throw new IllegalStateException("낙찰자만 잔금 결제를 할 수 있습니다.");

	        AuctionDto highest = auctionMapper.getHighestBid(postId);
	        if (highest == null || highest.getBidAmount() == null)
	            throw new IllegalStateException("최종 입찰가가 없습니다.");
	        int finalPrice = highest.getBidAmount().intValue();

	        AuctionGuaranteeDTO g = auctionMapper.findGuarantee(postId, memberId);
	        int deposit = (g != null && g.getAmount() != null) ? g.getAmount().intValue() : 0;

	        int amount = Math.max(0, finalPrice - deposit);

	        String merchantUid = "escrow_" + postId + "_" + memberId + "_" + System.currentTimeMillis();

	        if (amount > 0) {
	            portOneService.ensurePreparedForAuction(merchantUid, amount, "경매 잔금(에스크로)");
	        }

	        return Map.of("amount", amount, "merchantUid", merchantUid);
	    }

}
