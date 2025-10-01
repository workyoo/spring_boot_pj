import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import './LegalPages.css';

const Contact = () => {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await api.post('/api/contact/submit', contactForm);
      
      if (response.data.status === 'SUCCESS') {
        setSubmitMessage('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
        setContactForm({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitMessage('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('문의 접수 실패:', error);
      setSubmitMessage('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="legal-title">고객센터</h1>
          <div className="legal-meta">
            <span>24시간 문의 접수</span>
            <span>빠른 답변 보장</span>
          </div>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>📞 연락처 정보</h2>
            <div className="contact-info">
              <h3>고객센터</h3>
              <p><strong>전화:</strong> 1588-4989</p>
              <p><strong>이메일:</strong> support@4989.com</p>
              <p><strong>운영시간:</strong> 평일 09:00 ~ 18:00 (주말/공휴일 휴무)</p>
              <p><strong>주소:</strong> 서울특별시 강남구 테헤란로 123, (주)중고거래4989</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>❓ 자주 묻는 질문</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>Q: 회원가입은 어떻게 하나요?</h3>
                <p>A: 홈페이지 상단의 '회원가입' 버튼을 클릭하여 이메일 또는 소셜 계정으로 가입할 수 있습니다.</p>
              </div>
              
              <div className="faq-item">
                <h3>Q: 상품을 등록하려면 어떻게 해야 하나요?</h3>
                <p>A: 로그인 후 '상품 등록' 메뉴를 통해 상품 정보와 사진을 업로드하여 등록할 수 있습니다.</p>
              </div>
              
              <div className="faq-item">
                <h3>Q: 경매에 참여하려면 어떻게 해야 하나요?</h3>
                <p>A: 경매 상품 페이지에서 보증금을 결제한 후 입찰할 수 있습니다. 보증금은 시작가의 10%입니다.</p>
              </div>
              
              <div className="faq-item">
                <h3>Q: 거래 중 문제가 발생했어요. 어떻게 해야 하나요?</h3>
                <p>A: 고객센터로 연락하시거나, 해당 상품 페이지의 '신고하기' 기능을 이용해주세요.</p>
              </div>
              
              <div className="faq-item">
                <h3>Q: 개인정보를 변경하고 싶어요.</h3>
                <p>A: 마이페이지의 '프로필 수정' 메뉴에서 개인정보를 변경할 수 있습니다.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>📝 문의하기</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">이름 *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                  placeholder="이름을 입력해주세요"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">이메일 *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                  placeholder="이메일을 입력해주세요"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">제목 *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="문의 제목을 입력해주세요"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">문의내용 *</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="문의하실 내용을 자세히 입력해주세요"
                ></textarea>
              </div>
              
              {submitMessage && (
                <div className={`submit-message ${submitMessage.includes('성공') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}
              
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? '접수 중...' : '문의 접수하기'}
              </button>
            </form>
          </section>

          <section className="legal-section">
            <h2>🚨 긴급 신고</h2>
            <div className="emergency-contact">
              <h3>사기/불법 거래 신고</h3>
              <p>사기나 불법 거래를 발견하셨다면 즉시 신고해주세요.</p>
              <div className="emergency-buttons">
                <button className="emergency-button report">
                  🚨 사기 신고
                </button>
                <button className="emergency-button illegal">
                  ⚠️ 불법 거래 신고
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <p>더 자세한 도움이 필요하시면 언제든 연락해주세요.</p>
          <p>고객 여러분의 소중한 의견을 기다리고 있습니다.</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
