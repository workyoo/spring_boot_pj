package boot.sagu.service;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class PortOneService {

    // === 설정값 ===
    @Value("${portone.api-base:https://api.iamport.kr}")
    private String base;

    @Value("${portone.api-key}")
    private String apiKey;

    @Value("${portone.api-secret}")
    private String apiSecret;

    @Value("${portone.channel-key:}")
    private String channelKey;

    @Value("${portone.webhook-secret:}")
    private String webhookSecret;

    @Value("${portone.inicis.merchant-id:}")
    private String inicisMerchantId;

    @Value("${portone.inicis.license-key:}")
    private String inicisLicenseKey;

    // === HTTP 클라이언트 ===
    @Autowired
    private RestTemplate restTemplate;

    // ---------- 공통 유틸 ----------
    private HttpHeaders bearer(String token) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setBearerAuth(token); // Authorization: Bearer <token>
        return h;
    }

    private String getAccessToken() {
        String url = base + "/users/getToken";

        // x-www-form-urlencoded 로 전송
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("imp_key", apiKey);
        form.add("imp_secret", apiSecret);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        ResponseEntity<Map> res =
            restTemplate.postForEntity(url, new HttpEntity<>(form, headers), Map.class);

        Map body = res.getBody();
        if (body == null || body.get("response") == null) {
            throw new IllegalStateException("PortOne token response empty: " + body);
        }
        Map response = (Map) body.get("response");
        Object token = response.get("access_token");
        if (token == null) {
            throw new IllegalStateException("PortOne token missing in response: " + body);
        }
        return token.toString();
    }

    // ---------- 사전등록(prepare) ----------
    /**
     * 보증금 사전등록을 idempotent하게 보장:
     * 1) POST /payments/prepare 시도
     * 2) 400이면 GET /payments/prepare/{merchant_uid}로 기존 금액 조회
     *    - 없으면 진짜 BadRequest
     *    - 있으면 금액 비교 → 다르면 충돌, 같으면 통과
     */
    public void ensurePreparedForAuction(String merchantUid, int amount, String name) {
        String token = getAccessToken();
        try {
            tryPrepare(merchantUid, amount, token);
            return; // 정상 사전등록
        } catch (HttpClientErrorException.BadRequest e) {
            // 중복 UID 또는 요청 형식 문제
            Integer prepared = getPreparedAmount(merchantUid, token).orElse(null);
            if (prepared == null) {
                // 해당 UID가 아예 없다 → 진짜 잘못된 요청
                throw e;
            }
            if (prepared.intValue() != amount) {
                // 이미 등록된 금액과 다르면 정책상 충돌
                throw new PortOneAmountConflictException(
                    "이미 등록된 보증금 금액(" + prepared + ")과 다릅니다."
                );
            }
            // 금액이 같으면 멱등(OK)
        }
    }
    
 // PortOneService.java 안에 추가
    public String requestPayment(String merchantUid, int amount, String name) {
        // 옛 코드와의 호환을 위한 얇은 래퍼
        preparePayment(merchantUid, amount);
        // 호출부에서 이 리턴값을 안 쓰더라도 형태 맞춰줌
        return "/payment-page?merchant_uid=" + merchantUid + "&amount=" + amount + "&name=" + name;
    }


    private void tryPrepare(String merchantUid, int amount, String token) {
        // POST /payments/prepare
        // 사전등록된 금액과 IMP.request_pay() 금액이 다르면 결제창 호출 자체가 차단됨. :contentReference[oaicite:1]{index=1}
        String url = base + "/payments/prepare";
        Map<String, Object> body = new HashMap<>();
        body.put("merchant_uid", merchantUid);
        body.put("amount", amount);

        restTemplate.postForEntity(url, new HttpEntity<>(body, bearer(token)), Map.class);
    }

    public Optional<Integer> getPreparedAmount(String merchantUid, String token) {
        // GET /payments/prepare/{merchant_uid} 로 단건 조회. :contentReference[oaicite:2]{index=2}
        String url = base + "/payments/prepare/" + merchantUid;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        try {
            ResponseEntity<Map> res =
                restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            Map response = (Map) res.getBody().get("response");
            if (response == null) return Optional.empty();
            Object amt = response.get("amount");
            return Optional.ofNullable(amt).map(x -> ((Number) x).intValue());
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        }
    }

    // (기존 API 유지용) 간단 prepare
    public void preparePayment(String merchantUid, int amount) {
        String token = getAccessToken();
        tryPrepare(merchantUid, amount, token);
    }

    // (기존 API 유지용) 메서드 이름 유지
    public void preparePaymentForAuction(String merchantUid, int amount, String name) {
        ensurePreparedForAuction(merchantUid, amount, name);
    }

    // ---------- 결제 단건 조회 ----------
    public PortOnePayment getPayment(String impUid) {
        // GET /payments/{imp_uid}  (Bearer 필요) :contentReference[oaicite:3]{index=3}
        String token = getAccessToken();
        String url = base + "/payments/" + impUid;
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<Map> res =
            restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        Map response = (Map) res.getBody().get("response");
        PortOnePayment pay = new PortOnePayment();
        pay.setImpUid((String) response.get("imp_uid"));
        pay.setMerchantUid((String) response.get("merchant_uid"));
        pay.setAmount(((Number) response.get("amount")).intValue());
        pay.setStatus((String) response.get("status"));
        return pay;
    }
    
    public PortOnePayment getPaymentByMerchantUid(String merchantUid) {
        String token = getAccessToken();
        String url = base + "/payments/find/" + merchantUid; // 포트원 v1: merchant_uid로 조회
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<Map> res =
            restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        Map body = res.getBody();
        if (body == null || body.get("response") == null) return null;

        Map response = (Map) body.get("response");
        PortOnePayment pay = new PortOnePayment();
        pay.setImpUid((String) response.get("imp_uid"));
        pay.setMerchantUid((String) response.get("merchant_uid"));
        Object amt = response.get("amount");
        if (amt != null) pay.setAmount(((Number) amt).intValue());
        pay.setStatus((String) response.get("status"));
        return pay;
    }
 


    // ---------- 결제 취소(환불) ----------
    public void cancelPayment(String impUid, String reason, BigDecimal amount) {
        // POST /payments/cancel  (Bearer 필요)  :contentReference[oaicite:4]{index=4}
        String token = getAccessToken();
        String url = base + "/payments/cancel";
        Map<String, Object> body = new HashMap<>();
        body.put("imp_uid", impUid);
        if (reason != null) body.put("reason", reason);
        if (amount != null) body.put("amount", amount);

        restTemplate.postForEntity(url, new HttpEntity<>(body, bearer(token)), Map.class);
    }

    // 기존 사용처 호환
    public void refundPayment(String impUid, BigDecimal amount) {
        cancelPayment(impUid, "보증금 환불", amount);
    }

    // ---------- 웹훅 서명 검증(그대로 유지) ----------
    public boolean verifyWebhookSignature(String signature, String body) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(webhookSecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmac = mac.doFinal(body.getBytes());
            String expectedSignature = Base64.getEncoder().encodeToString(hmac);
            return signature.equals(expectedSignature);
        } catch (Exception e) {
            return false;
        }
    }

    // ---------- 예외/DTO ----------
    public static class PortOneAmountConflictException extends RuntimeException {
        public PortOneAmountConflictException(String msg) { super(msg); }
    }

    public static class PortOnePayment {
        private String impUid;
        private String merchantUid;
        private String status;
        private int amount;
        public String getImpUid() { return impUid; }
        public void setImpUid(String impUid) { this.impUid = impUid; }
        public String getMerchantUid() { return merchantUid; }
        public void setMerchantUid(String merchantUid) { this.merchantUid = merchantUid; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getAmount() { return amount; }
        public void setAmount(int amount) { this.amount = amount; }
    }
}
