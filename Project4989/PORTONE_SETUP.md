  # 포트원 결제 설정 가이드

## 1. 포트원 계정 설정

### 1.1 포트원 가입
- [포트원](https://www.portone.io/) 사이트에서 가입
- 사업자 인증 및 가맹점 승인 대기

### 1.2 가맹점 식별코드 확인
- 포트원 대시보드에서 `imp_`로 시작하는 가맹점 식별코드 확인
- 예: `imp_12345678`

## 2. 프로젝트 설정

### 2.1 프론트엔드 설정 파일 수정
`src/config/portone.js` 파일에서 다음 값을 실제 값으로 변경:

```javascript
export const PORTONE_CONFIG = {
  // 실제 가맹점 식별코드로 변경
  IMP_CODE: 'imp_12345678', // 여기에 실제 코드 입력
  
  // KG이니시스 설정 (변경 불필요)
  PG: 'html5_inicis',
  
  // 결제 수단 (변경 불필요)
  PAY_METHOD: 'card',
  
  // URL 설정 (필요시 변경)
  SUCCESS_URL: `${window.location.origin}/auction/payment/success`,
  FAIL_URL: `${window.location.origin}/auction/payment/fail`,
  MOBILE_REDIRECT_URL: `${window.location.origin}/auction/detail`,
};
```

### 2.2 백엔드 설정 파일 수정
`Spring4989/src/main/resources/application.yml`에 다음 설정 추가:

```yaml
portone:
  api-key: 실제_REST_API_키
  api-secret: 실제_REST_API_시크릿
  # 포트원 채널 설정
  channel-key: 실제_채널키
  # 웹결제 signkey (위변조 방지용)
  webhook-secret: 실제_웹훅_시크릿
  # KG이니시스 설정
  inicis:
    merchant-id: 실제_이니시스_가맹점ID
    license-key: 실제_이니시스_라이센스키
```

### 2.3 설정값 설명

각 설정값의 의미와 획득 방법:

- **`api-key`**: 포트원 대시보드 → 개발자센터 → REST API 키
- **`api-secret`**: 포트원 대시보드 → 개발자센터 → REST API 시크릿
- **`channel-key`**: 포트원 대시보드 → 채널 설정 → 채널키
- **`webhook-secret`**: 포트원 대시보드 → 웹훅 설정 → 시크릿키
- **`inicis.merchant-id`**: KG이니시스에서 발급받은 가맹점 ID
- **`inicis.license-key`**: KG이니시스에서 발급받은 라이센스 키

## 3. KG이니시스 설정

### 3.1 KG이니시스 가입
- [KG이니시스](https://www.inicis.com/) 사이트에서 가입
- 포트원과 연동 계약 체결

### 3.2 PG 설정
포트원 대시보드에서:
1. PG사 설정 → KG이니시스 선택
2. 가맹점 ID, 라이센스 키 등 입력
3. 테스트 모드 활성화 (개발 단계)

## 4. 테스트 결제

### 4.1 테스트 카드 정보
```
카드번호: 4242-4242-4242-4242
유효기간: 12/25
CVC: 123
```

### 4.2 테스트 환경
- 개발 환경에서는 테스트 모드로 설정
- 실제 결제 전에 충분한 테스트 진행

## 5. 보안 고려사항

### 5.1 결제 검증
- 백엔드에서 결제 금액 및 상태 검증 필수
- 위변조 방지를 위한 사전 결제 등록 사용

### 5.2 에러 처리
- 결제 실패 시 적절한 에러 메시지 표시
- 네트워크 오류 등 예외 상황 처리

## 6. 배포 시 주의사항

### 6.1 환경별 설정
- 개발/스테이징/운영 환경별로 다른 설정 사용
- 운영 환경에서는 테스트 모드 비활성화

### 6.2 SSL 인증서
- HTTPS 환경에서만 결제 기능 동작
- SSL 인증서 필수

## 7. 문제 해결

### 7.1 결제창이 열리지 않는 경우
- 브라우저 팝업 차단 확인
- 포트원 스크립트 로딩 상태 확인
- 네트워크 연결 상태 확인

### 7.2 결제 실패 시
- 포트원 대시보드에서 결제 로그 확인
- 백엔드 로그에서 에러 메시지 확인
- 결제 금액 및 주문번호 중복 여부 확인

## 8. 연락처

- 포트원 고객센터: 1544-0714
- KG이니시스 고객센터: 1544-8666
- 프로젝트 개발팀: [연락처 정보]
