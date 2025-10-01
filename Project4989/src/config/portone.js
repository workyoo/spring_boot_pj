// 포트원 결제 설정
export const PORTONE_CONFIG = {
  // 실제 가맹점 식별코드로 변경 필요
  IMP_CODE: 'imp73456146',
  
  // KG이니시스 설정
  PG: 'html5_inicis',
  
  // 결제 수단
  PAY_METHOD: 'card',
  
  // 결제 성공/실패 URL
  SUCCESS_URL: `${window.location.origin}/auction/payment/success`,
  FAIL_URL: `${window.location.origin}/auction/payment/fail`,
  
  // 모바일 리다이렉트 URL
  MOBILE_REDIRECT_URL: `${window.location.origin}/auction/detail`,
};

// 결제 상태 상수
export const PAYMENT_STATUS = {
  READY: 'ready',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
};

// 결제 에러 메시지
export const PAYMENT_ERROR_MESSAGES = {
  CANCELLED: '결제가 취소되었습니다.',
  FAILED: '결제에 실패했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  INVALID_AMOUNT: '유효하지 않은 결제 금액입니다.',
  ALREADY_PAID: '이미 결제가 완료되었습니다.',
};
