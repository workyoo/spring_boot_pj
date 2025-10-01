import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

// props로 onLoginSuccess 함수를 받습니다.
function LoginForm({ onLoginSuccess }) {
  const navi = useNavigate();

  // 폼 입력값을 관리하는 state
  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });

  // 입력값 변경 시 state를 업데이트하는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 폼 제출 시 실행되는 함수
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const base = import.meta.env.VITE_API_BASE;

    // JSON으로만 보냄: 서버가 username을 기대하든 loginId를 기대하든 OK
    const payload = {
      id: formData.loginId,
      username: formData.loginId,   // 백엔드가 username 기대할 때 대비
      loginId: formData.loginId,    // 백엔드가 loginId 기대할 때 대비
      password: formData.password,
    };

    const res = await axios.post(`${base}/login`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const token = res.data?.token || res.data?.accessToken || res.data?.jwt;
    if (!token) throw new Error("토큰 없음");

    localStorage.setItem("jwtToken", token);
    const decoded = jwtDecode(token);
    const userInfo = {
      loginId: decoded.sub,
      memberId: decoded.memberId,
      nickname: decoded.nickname,
      role: decoded.role,
      profileImageUrl: decoded.profileImageUrl,
    };
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    onLoginSuccess(userInfo);
    navi("/");
  } catch (err) {
    console.error("로그인 중 오류 발생:", err);
    alert(
      (err?.response?.data && typeof err.response.data === "string")
        ? err.response.data
        : "로그인 실패! 아이디 또는 비밀번호를 확인해주세요."
    );
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">로그인</h2>
          <p className="login-subtitle">안전하고 편리한 중고거래를 시작하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">아이디</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                name="loginId" 
                value={formData.loginId} 
                onChange={handleChange} 
                required 
                className="form-input"
                placeholder="아이디를 입력하세요"
              />
            </div>
          </div>
          
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
          </div>

          <button type="submit" className="login-btn">
            로그인
          </button>

          <div className="divider">
            <span>또는</span>
          </div>

          {/* 소셜로그인 */}
          <div className="social-login">
            <button 
              type='button' 
              className="social-btn kakao-btn"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE}/oauth2/authorization/kakao`}
            >
              <svg className="social-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 0.5625C4.03125 0.5625 0 3.65625 0 7.5C0 10.2188 1.59375 12.6562 4.03125 14.0625L3.09375 17.4375C3.03125 17.7188 3.28125 17.9375 3.5625 17.8125L7.5 16.2188C7.78125 16.2188 7.875 16.2188 8.15625 16.2188C12.9688 16.2188 16.875 12.6562 16.875 7.5C16.875 3.65625 12.9688 0.5625 9 0.5625Z" fill="#391B1B"/>
              </svg>
              카카오로 시작하기
            </button>
            
            <button 
              type='button' 
              className="social-btn google-btn"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE}/oauth2/authorization/google`}
            >
              <svg className="social-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              Google로 로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;