package boot.sagu.dto;

import lombok.Data;

@Data
public class CreditTierDto {
    private int memberId;
    private String tier; // 초보상인, 거래꾼, 장인, 마스터, 거래왕
    private int totalScore; // 총점 (0~1000)
    private int transactionScore; // 거래량 점수 (0~450)
    private int ratingScore; // 평점 점수 (0~450)
    private int penaltyScore; // 신고 패널티 (0~-200)
    private int completedTransactions; // 완료된 거래 수
    private double averageRating; // 평균 평점
    private int reportCount; // 신고 횟수
    private String updatedAt;
}
