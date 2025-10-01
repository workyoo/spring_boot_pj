import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignupForm.css';

function SignupForm() {
  // 1. 폼 데이터 State
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    confirmPassword: '', // 비밀번호 확인 필드 추가
    nickname: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(''); // 비밀번호 확인 에러 추가
  const [idCheckMessage,setIdCheckMessage]= useState('');
  const [email, setEmail] = useState({ localPart: '', domain: '' });
  const [emailDomain, setEmailDomain] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('https://placehold.co/150x150');
  
  const emailDomains = ['naver.com', 'gmail.com', 'daum.net', 'nate.com', 'hanmail.net'];
  const fileInputRef = useRef(null);

  const navi = useNavigate();

  // 2. 핸들러 함수들
  useEffect(() => {
    if (emailDomain === 'direct') {
      setEmail(prev => ({ ...prev, domain: '' }));
    } else {
      setEmail(prev => ({ ...prev, domain: emailDomain }));
    }
  }, [emailDomain]);

  // 비밀번호 유효성 검사 로직
  useEffect(() => {
    const { password } = formData;
    // 10자 이상, 대문자, 특수문자, 숫자 포함 정규식
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{10,}$/;
    
    if (password && !strongPasswordRegex.test(password)) {
      setPasswordError('비밀번호는 10자 이상이어야 하며, 대문자, 특수문자, 숫자를 포함해야 합니다.');
    } else {
      setPasswordError(''); // 유효하면 에러 메시지 없음
    }
  }, [formData.password]);

  // 비밀번호 확인 검증 로직 추가
  useEffect(() => {
    const { password, confirmPassword } = formData;
    
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else if (confirmPassword && password === confirmPassword) {
      setConfirmPasswordError(''); // 일치하면 에러 메시지 없음
    }
  }, [formData.password, formData.confirmPassword]);

  // 아이디 입력란에서 포커스가 벗어났을 때 실행될 함수
  const handleIdBlur = async () => {
    if (!formData.loginId) {
      setIdCheckMessage('');
      return;
    }
    try {
      // 백엔드에 중복 확인 요청
      await axios.get(`${import.meta.env.VITE_API_BASE}/check-loginid?loginId=${formData.loginId}`);
      setIdCheckMessage({ text: '사용 가능한 아이디입니다.', color: 'green' });
    } catch (error) {
      // 409 Conflict 오류가 발생하면 중복된 아이디임
      if (error.response && error.response.status === 409) {
        setIdCheckMessage({ text: '이미 사용 중인 아이디입니다.', color: 'red' });
      } else {
        console.error('아이디 중복 확인 중 오류:', error);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleEmailChange = (e) => {
    setEmail({ ...email, [e.target.name]: e.target.value });
  };

  const handleSendCode = async () => {
    if (!phoneNumber) {
      alert('휴대폰 번호를 입력해주세요.');
      return;
    }
    try {
      // 실제 SMS 발송 대신 서버 콘솔에 인증번호를 출력하는 Mocking 방식 사용
      await axios.post(`${import.meta.env.VITE_API_BASE}/sms/send`, { phoneNumber });
      alert('인증번호가 발송되었습니다.');
      setIsCodeSent(true);
    } catch (error) {
      alert('인증번호 발송에 실패했습니다.');
      console.error(error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE}/sms/verify`, { phoneNumber, code: verificationCode });
      alert('인증 성공!');
      setIsVerified(true);
    } catch (error) {
      alert('인증번호가 일치하지 않습니다.');
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // 비밀번호 확인 검증
      if (formData.password !== formData.confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      const signupData = new FormData();
      
      // ✨ DTO의 각 필드를 개별적으로 FormData에 추가
      signupData.append('loginId', formData.loginId);
      signupData.append('password', formData.password);
      signupData.append('nickname', formData.nickname);
      signupData.append('email', `${email.localPart}@${email.domain}`);
      signupData.append('phoneNumber', phoneNumber);
      
      // 이미지 파일 추가
      if (profileImage) {
        signupData.append('profileImageFile', profileImage);
      }
      
      try {
        await axios.post('http://localhost:4989/signup', signupData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('회원가입 성공!');
        navi('/login');
      } catch (error) {
        alert('회원가입에 실패했습니다.');
        console.error(error);
      }
  };

  // 3. JSX 렌더링
  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2 className="signup-title">회원가입</h2>
          <p className="signup-subtitle">안전하고 편리한 중고거래를 시작하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          
          {/* 프로필 이미지 업로드 */}
          <div className="profile-image-section">
            <div className="profile-image-wrapper" onClick={() => {
              console.log('프로필 이미지 클릭됨');
              if (fileInputRef.current) {
                console.log('파일 입력 참조 존재함');
                fileInputRef.current.click();
              } else {
                console.log('파일 입력 참조가 없음');
              }
            }}>
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="profile-preview"
              />
              <div className="profile-image-overlay">
                <span className="profile-image-text">클릭하여 이미지 선택</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                console.log('파일 변경 이벤트 발생:', e.target.files);
                handleImageChange(e);
              }}
              className="profile-file-input"
              accept="image/*"
            />
            <p className="profile-hint">프로필 이미지를 클릭하여 사진을 선택하세요</p>
          </div>
          
          {/* 아이디 입력 */}
          <div className="form-group">
            <label className="form-label">아이디</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                name="loginId" 
                value={formData.loginId} 
                onChange={handleChange} 
                onBlur={handleIdBlur} 
                required 
                className="form-input"
                placeholder="아이디를 입력하세요"
              />
            </div>
            {idCheckMessage && (
              <p className={`id-check-message ${idCheckMessage.color}`}>
                {idCheckMessage.text}
              </p>
            )}
          </div>
          
          {/* 비밀번호 입력 */}
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="form-input"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          
          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label className="form-label">비밀번호 확인</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                className="form-input"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
            {formData.confirmPassword && !confirmPasswordError && (
              <p className="success-message">✅ 비밀번호가 일치합니다.</p>
            )}
            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
          </div>
          
          {/* 닉네임 입력 */}
          <div className="form-group">
            <label className="form-label">닉네임</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                name="nickname" 
                value={formData.nickname} 
                onChange={handleChange} 
                required 
                className="form-input"
                placeholder="닉네임을 입력하세요"
              />
            </div>
          </div>
          
          {/* 이메일 입력 */}
          <div className="form-group">
            <label className="form-label">이메일</label>
            <div className="email-input-group">
              <input 
                type="text" 
                name="localPart" 
                value={email.localPart} 
                onChange={handleEmailChange} 
                required 
                className="email-local-input"
                placeholder="이메일"
              />
              <span className="email-at">@</span>
              <input 
                type="text" 
                name="domain" 
                value={email.domain} 
                onChange={handleEmailChange} 
                required 
                disabled={emailDomain !== 'direct' && emailDomain !== ''} 
                className="email-domain-input"
                placeholder="도메인"
              />
              <select 
                value={emailDomain} 
                onChange={(e) => setEmailDomain(e.target.value)} 
                className="email-domain-select"
              >
                <option value="">선택</option>
                {emailDomains.map(d => <option key={d} value={d}>{d}</option>)}
                <option value="direct">직접입력</option>
              </select>
            </div>
          </div>

          {/* 휴대폰 번호 입력 */}
          <div className="form-group">
            <label className="form-label">휴대폰 번호</label>
            <div className="phone-input-group">
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                required 
                disabled={isVerified} 
                className="phone-input"
                placeholder="휴대폰 번호를 입력하세요"
              />
              <button 
                type="button" 
                onClick={handleSendCode} 
                disabled={isCodeSent} 
                className="send-code-btn"
              >
                인증번호 발송
              </button>
            </div>
          </div>

          {/* 인증번호 입력 */}
          {isCodeSent && !isVerified && (
            <div className="form-group">
              <label className="form-label">인증번호</label>
              <div className="verification-input-group">
                <input 
                  type="text" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)} 
                  required 
                  className="verification-input"
                  placeholder="인증번호를 입력하세요"
                />
                <button 
                  type="button" 
                  onClick={handleVerifyCode} 
                  className="verify-code-btn"
                >
                  인증 확인
                </button>
              </div>
            </div>
          )}
          
          {/* 인증 완료 메시지 */}
          {isVerified && (
            <div className="verification-success">
              <p className="success-message">✅ 휴대폰 인증이 완료되었습니다.</p>
            </div>
          )}

          {/* 회원가입 버튼 */}
          <button 
            type="submit" 
            disabled={!isVerified} 
            className="signup-btn"
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;