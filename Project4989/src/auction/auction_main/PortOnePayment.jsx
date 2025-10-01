// src/components/auction/PortOnePayment.jsx
import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { PORTONE_CONFIG, PAYMENT_ERROR_MESSAGES } from '../../config/portone';
import api from '../../lib/api';
import './PortOnePayment.css';

// 포트원 스크립트 로드 (1회)
function loadPortOneScript() {
  return new Promise((resolve, reject) => {
    if (window.IMP) return resolve();
    const existing = document.querySelector('script[src="https://cdn.iamport.kr/v1/iamport.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/v1/iamport.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * mode: 'DEPOSIT' | 'ESCROW'
 *  - DEPOSIT(보증금): 결제 성공 시 /api/auctions/portone/confirm 호출
 *  - ESCROW(에스크로): 웹훅으로 처리되므로 프론트에서 별도 confirm 호출 불필요
 */
export default function PortOnePayment({
  mode = 'DEPOSIT',
  postId,
  // memberId는 서버가 JWT로 판별하므로 굳이 안 써도 됨. (사용자 정보는 영수증 표기용)
  amount,
  merchantUid,
  onPaymentComplete,
  onPaymentCancel,
}) {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const launchedRef = useRef(false);

  useEffect(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;

    const guardKey = `__portone_open_${mode}_${postId}_${merchantUid}`;
    if (window[guardKey]) return;
    window[guardKey] = true;

    (async () => {
      try {
        await loadPortOneScript();
        if (!window.IMP) throw new Error('PortOne SDK not loaded');

        const { IMP } = window;
        IMP.init(PORTONE_CONFIG.IMP_CODE);

        // 로그인 체크 (토큰은 api 인스턴스가 헤더로 보냄)
        const raw = localStorage.getItem('jwtToken') || localStorage.getItem('accessToken');
        if (!raw) {
          alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
          navigate(`/login?redirect=/auction/detail/${postId}`);
          window[guardKey] = false;
          return;
        }

        const buyer_email = userInfo?.loginId || userInfo?.email || '';
        const buyer_name  = userInfo?.nickname || '구매자';
        const buyer_tel   = userInfo?.phone || userInfo?.tel || '';

        if (!merchantUid) {
          alert('결제 식별자(merchantUid)가 없습니다. 다시 시도해주세요.');
          window[guardKey] = false;
          onPaymentCancel?.();
          return;
        }

        const payName = mode === 'ESCROW' ? '에스크로 결제' : '경매 보증금';

        IMP.request_pay(
          {
            pg: PORTONE_CONFIG.PG,
            pay_method: PORTONE_CONFIG.PAY_METHOD,
            merchant_uid: merchantUid,
            amount: Number(amount),
            name: payName,
            buyer_email,
            buyer_name,
            buyer_tel,
            m_redirect_url: `${PORTONE_CONFIG.MOBILE_REDIRECT_URL}/${postId}`,
          },
          async (rsp) => {
            window[guardKey] = false;

            if (rsp.success) {
              try {
                if (mode === 'DEPOSIT') {
                  // ✅ 보증금은 confirm API로 서버 검증 + 적립 (memberId는 서버가 JWT에서 추출)
                  await api.post('/api/auctions/portone/confirm', {
                    postId: Number(postId),
                    impUid: rsp.imp_uid,
                    merchantUid,
                    paidAmount: rsp.paid_amount,
                  });
                } else {
                  // ✅ 에스크로는 웹훅이 escrowService.handleEscrowPaid()로 처리
                  // 필요시 여기서 /api/escrow/order/{postId}/me 재조회로 상태 갱신 가능
                  // await api.get(`/api/escrow/order/${postId}/me`);
                }

                onPaymentComplete?.();
              } catch (err) {
                console.error('결제 후 처리 실패:', err);
                alert(`${PAYMENT_ERROR_MESSAGES.FAILED} (검증/후처리 실패)`);
                onPaymentCancel?.(rsp);
              }
            } else {
              const msg =
                rsp.error_code === 'PAY_CANCEL'
                  ? PAYMENT_ERROR_MESSAGES.CANCELLED
                  : `${PAYMENT_ERROR_MESSAGES.FAILED}${rsp.error_msg ? `: ${rsp.error_msg}` : ''}`;
              alert(msg);
              onPaymentCancel?.();
            }
          }
        );
      } catch (e) {
        window[guardKey] = false;
        console.error('PortOne 초기화 실패:', e);
        alert('결제창을 열 수 없습니다. 잠시 후 다시 시도해주세요.');
        onPaymentCancel?.();
      }
    })();

    return () => {
      window[guardKey] = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = mode === 'ESCROW' ? '에스크로 결제' : '보증금 결제';
  const subtitle = mode === 'ESCROW' ? '낙찰 금액 결제(차감형)입니다.' : '경매 참여를 위해 보증금을 결제해주세요.';

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <div className="payment-icon">
            {mode === 'ESCROW' ? '💰' : '🏆'}
          </div>
          <h2 className="payment-title">{title}</h2>
          <p className="payment-subtitle">{subtitle}</p>
        </div>
        
        <div className="payment-details">
          <div className="payment-amount">
            <span className="amount-label">결제 금액</span>
            <span className="amount-value">{Number(amount).toLocaleString()}원</span>
          </div>
          
          <div className="payment-info">
            <div className="info-item">
              <span className="info-label">결제 수단</span>
              <span className="info-value">KG이니시스 (카드)</span>
            </div>
            <div className="info-item">
              <span className="info-label">결제 방법</span>
              <span className="info-value">결제창 자동 열림</span>
            </div>
          </div>
        </div>
        
        <div className="payment-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">결제창을 불러오는 중입니다...</p>
          <p className="loading-hint">
            결제창이 열리지 않으면 새로고침 후 다시 시도해주세요.
          </p>
        </div>
        
        <div className="payment-footer">
          <div className="security-badge">
            <span className="security-icon">🔒</span>
            <span>보안 결제</span>
          </div>
        </div>
      </div>
    </div>
  );
}
