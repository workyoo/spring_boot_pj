import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

const PrivacyPolicy = () => {
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
          <h1 className="legal-title">개인정보처리방침</h1>
          <div className="legal-meta">
            <span>최종 수정일: 2025년 1월 13일</span>
            <span>시행일: 2025년 1월 13일</span>
          </div>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. 개인정보의 처리 목적</h2>
            <p>(주)중고거래4989(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.</p>
            <ul>
              <li>회원 가입 및 관리</li>
              <li>서비스 제공 및 운영</li>
              <li>거래 중개 및 결제 처리</li>
              <li>고객 상담 및 문의 응대</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
              <li>마케팅 및 광고 활용 (사전 동의 시)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. 개인정보의 처리 및 보유기간</h2>
            <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            
            <div className="retention-table">
              <h3>개인정보 보유기간</h3>
              <div className="table-row">
                <div className="table-header">구분</div>
                <div className="table-header">보유기간</div>
                <div className="table-header">근거</div>
              </div>
              <div className="table-row">
                <div className="table-cell">회원정보</div>
                <div className="table-cell">회원탈퇴 시까지</div>
                <div className="table-cell">서비스 이용계약</div>
              </div>
              <div className="table-row">
                <div className="table-cell">거래정보</div>
                <div className="table-cell">5년</div>
                <div className="table-cell">전자상거래법</div>
              </div>
              <div className="table-row">
                <div className="table-cell">결제정보</div>
                <div className="table-cell">5년</div>
                <div className="table-cell">전자상거래법</div>
              </div>
              <div className="table-row">
                <div className="table-cell">로그기록</div>
                <div className="table-cell">3개월</div>
                <div className="table-cell">통신비밀보호법</div>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>3. 개인정보의 제3자 제공</h2>
            <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
            
            <div className="third-party-table">
              <h3>제3자 제공 현황</h3>
              <div className="table-row">
                <div className="table-header">제공받는 자</div>
                <div className="table-header">제공 목적</div>
                <div className="table-header">제공 항목</div>
                <div className="table-header">보유기간</div>
              </div>
              <div className="table-row">
                <div className="table-cell">결제업체</div>
                <div className="table-cell">결제 처리</div>
                <div className="table-cell">결제정보</div>
                <div className="table-cell">결제 완료 시까지</div>
              </div>
              <div className="table-row">
                <div className="table-cell">택배업체</div>
                <div className="table-cell">배송 서비스</div>
                <div className="table-cell">배송정보</div>
                <div className="table-cell">배송 완료 시까지</div>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. 개인정보처리의 위탁</h2>
            <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            
            <div className="consignment-table">
              <h3>위탁업무 현황</h3>
              <div className="table-row">
                <div className="table-header">수탁업체</div>
                <div className="table-header">위탁업무</div>
                <div className="table-header">위탁기간</div>
              </div>
              <div className="table-row">
                <div className="table-cell">클라우드 서비스 업체</div>
                <div className="table-cell">데이터 저장 및 관리</div>
                <div className="table-cell">계약기간</div>
              </div>
              <div className="table-row">
                <div className="table-cell">고객상담 업체</div>
                <div className="table-cell">고객상담 및 문의응대</div>
                <div className="table-cell">계약기간</div>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>5. 정보주체의 권리·의무 및 행사방법</h2>
            <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul>
              <li>개인정보 열람요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제요구</li>
              <li>처리정지 요구</li>
            </ul>
            
            <h3>권리행사 방법</h3>
            <p>제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
          </section>

          <section className="legal-section">
            <h2>6. 개인정보의 파기</h2>
            <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
            
            <h3>파기방법</h3>
            <ul>
              <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
              <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. 개인정보의 안전성 확보 조치</h2>
            <p>회사는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보 조치를 취하고 있습니다.</p>
            <ul>
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>개인정보에 대한 접근 제한</li>
              <li>개인정보를 취급하는 직원의 최소화 및 교육</li>
              <li>개인정보보호 전담기구의 운영</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. 개인정보 보호책임자</h2>
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            
            <div className="contact-info">
              <h3>개인정보 보호책임자</h3>
              <p><strong>성명:</strong> [담당자명]</p>
              <p><strong>직책:</strong> 개인정보보호책임자</p>
              <p><strong>연락처:</strong> 02-1234-5678</p>
              <p><strong>이메일:</strong> privacy@4989.com</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>9. 개인정보 처리방침 변경</h2>
            <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
          </section>

          <section className="legal-section">
            <h2>10. 개인정보의 열람청구</h2>
            <p>정보주체는 개인정보보호법 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다. 회사는 정보주체의 개인정보 열람청구가 신속하게 처리되도록 노력하겠습니다.</p>
            
            <div className="contact-info">
              <h3>개인정보 열람청구 접수·처리 부서</h3>
              <p><strong>부서명:</strong> 개인정보보호팀</p>
              <p><strong>담당자:</strong> [담당자명]</p>
              <p><strong>연락처:</strong> 02-1234-5678</p>
              <p><strong>이메일:</strong> privacy@4989.com</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>11. 권익침해 구제방법</h2>
            <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 개인정보보호위원회, 개인정보보호위원회 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
            
            <div className="contact-info">
              <h3>관련 기관 연락처</h3>
              <p><strong>개인정보분쟁조정위원회:</strong> 1833-6972</p>
              <p><strong>개인정보보호위원회:</strong> 02-2100-2494</p>
              <p><strong>대검찰청 사이버수사과:</strong> 02-3480-3573</p>
              <p><strong>경찰청 사이버안전국:</strong> 182</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <p>개인정보처리방침에 대한 문의사항이 있으시면 개인정보보호책임자에게 연락해 주시기 바랍니다.</p>
          <button 
            className="contact-button"
            onClick={() => navigate('/contact')}
          >
            문의하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
