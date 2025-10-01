import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← 뒤로가기
          </button>
          <h1 className="legal-title">이용약관</h1>
          <div className="legal-meta">
            <span>최종 수정일: 2025년 1월 13일</span>
            <span>시행일: 2025년 1월 13일</span>
          </div>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>제1조 (목적)</h2>
            <p>본 약관은 (주)중고거래4989(이하 "회사")가 제공하는 중고거래 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section className="legal-section">
            <h2>제2조 (정의)</h2>
            <div className="definition-list">
              <div className="definition-item">
                <strong>1. "서비스"</strong>
                <p>회사가 제공하는 중고거래 중개 서비스 및 관련 부가서비스를 의미합니다.</p>
              </div>
              <div className="definition-item">
                <strong>2. "회원"</strong>
                <p>본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다.</p>
              </div>
              <div className="definition-item">
                <strong>3. "게시물"</strong>
                <p>회원이 서비스에 게시한 상품 정보, 댓글, 후기 등을 의미합니다.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>제3조 (약관의 효력 및 변경)</h2>
            <p>1. 본 약관은 서비스 이용 신청 시 회원이 동의하고, 회사가 승낙함으로써 효력이 발생합니다.</p>
            <p>2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</p>
            <p>3. 약관 변경 시 변경사항을 사전에 공지하고, 회원에게 통지합니다.</p>
          </section>

          <section className="legal-section">
            <h2>제4조 (서비스의 제공)</h2>
            <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
            <ul>
              <li>중고상품 거래 중개 서비스</li>
              <li>경매 서비스</li>
              <li>채팅 및 소통 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
            <p>2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</p>
          </section>

          <section className="legal-section">
            <h2>제5조 (회원의 의무)</h2>
            <p>1. 회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ul>
              <li>허위 정보 게시</li>
              <li>타인의 권리 침해</li>
              <li>서비스 운영 방해</li>
              <li>불법적인 상품 거래</li>
              <li>기타 관련 법령 위반 행위</li>
            </ul>
            <p>2. 회원은 자신의 계정 정보를 안전하게 관리해야 합니다.</p>
          </section>

          <section className="legal-section">
            <h2>제6조 (회사의 의무)</h2>
            <p>1. 회사는 안정적이고 지속적인 서비스 제공을 위해 노력합니다.</p>
            <p>2. 회사는 회원의 개인정보를 보호하기 위해 보안 시스템을 구축합니다.</p>
            <p>3. 회사는 서비스 이용과 관련된 회원의 불만사항을 신속하게 처리합니다.</p>
          </section>

          <section className="legal-section">
            <h2>제7조 (서비스 이용 제한)</h2>
            <p>1. 회사는 다음의 경우 서비스 이용을 제한할 수 있습니다:</p>
            <ul>
              <li>본 약관 위반 시</li>
              <li>서비스 운영 방해 시</li>
              <li>타 회원의 권리 침해 시</li>
              <li>기타 관련 법령 위반 시</li>
            </ul>
            <p>2. 서비스 이용 제한 시 회원에게 사유와 기간을 통지합니다.</p>
          </section>

          <section className="legal-section">
            <h2>제8조 (책임 제한)</h2>
            <p>1. 회사는 회원 간의 거래에 대해 중개자로서의 책임만을 부담합니다.</p>
            <p>2. 회사는 천재지변, 전쟁, 기타 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</p>
          </section>

          <section className="legal-section">
            <h2>제9조 (분쟁 해결)</h2>
            <p>1. 서비스 이용과 관련하여 발생한 분쟁은 회사와 회원 간의 합의로 해결합니다.</p>
            <p>2. 합의가 이루어지지 않을 경우 관련 법령에 따라 해결합니다.</p>
          </section>

          <section className="legal-section">
            <h2>제10조 (준거법 및 관할법원)</h2>
            <p>1. 본 약관은 대한민국 법률에 따라 해석됩니다.</p>
            <p>2. 서비스 이용으로 발생한 분쟁에 대해 소송이 필요할 경우, 회사의 본사 소재지를 관할하는 법원을 관할법원으로 합니다.</p>
          </section>

          <section className="legal-section">
            <h2>부칙</h2>
            <p>본 약관은 2025년 1월 13일부터 시행합니다.</p>
          </section>
        </div>

        <div className="legal-footer">
          <p>본 약관에 대한 문의사항이 있으시면 고객센터로 연락해 주시기 바랍니다.</p>
          <button 
            className="contact-button"
            onClick={() => navigate('/contact')}
          >
            고객센터 문의
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
