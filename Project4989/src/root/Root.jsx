import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RouterMain from './RouterMain';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Root = () => {
  // 앱 전체에서 사용할 로그인 사용자 정보를 담을 state
  const [userInfo, setUserInfo] = useState(null);
  const [token, setToken] = useState(null);

  // 컴포넌트가 처음 렌더링될 때(새로고침 등) 한 번만 실행되는 자동 로그인 로직
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    console.log('Root - 토큰 확인:', token ? '있음' : '없음');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        console.log('Root - 토큰 디코딩 성공:', decodedToken);
        console.log('Root - 토큰 만료 시간:', decodedToken.exp);
        console.log('Root - 현재 시간:', currentTime);

        // 토큰 만료 검사 추가
        if (decodedToken.exp < currentTime) {
          console.log('토큰이 만료되었습니다. 로그아웃 처리합니다.');
          localStorage.removeItem('jwtToken');
          delete axios.defaults.headers.common['Authorization'];
          setUserInfo(null);
          setToken(null);
          return;
        }

        // 토큰이 유효한 경우에만 사용자 정보 설정
        const userData = {
          loginId: decodedToken.sub,
          memberId: decodedToken.memberId,
          nickname: decodedToken.nickname,
          role: decodedToken.role,
          profileImageUrl: decodedToken.profileImageUrl,
        };
        console.log('Root - 사용자 정보 설정:', userData);
        setUserInfo(userData);
        setToken(token);

        // 새로고침 후에도 모든 axios 요청 헤더에 토큰을 포함시킵니다.
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('axios 헤더 세팅됨:', axios.defaults.headers.common['Authorization']);
      } catch (error) {
        console.error('토큰 디코딩 실패:', error);
        localStorage.removeItem('jwtToken');
        delete axios.defaults.headers.common['Authorization'];
        setUserInfo(null);
        setToken(null);
      }
    }
  }, []);

  // axios 응답 인터셉터 설정 - 401 에러 시 자동 로그아웃
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('인증 만료, 자동 로그아웃');
          localStorage.removeItem('jwtToken');
          delete axios.defaults.headers.common['Authorization'];
          setUserInfo(null);
          setToken(null);
          // 필요시 로그인 페이지로 리다이렉트
          // window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // 로그인 성공 시 LoginForm에서 호출될 함수
  const handleLoginSuccess = (userData) => {
    setUserInfo(userData);
    const newToken = localStorage.getItem('jwtToken');
    setToken(newToken);
  };

  // 로그아웃 시 Header에서 호출될 함수
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    delete axios.defaults.headers.common['Authorization'];
    setUserInfo(null);
    setToken(null);
  };

  // 사용자 정보 업데이트 함수
  const updateUserInfo = (updatedUserInfo) => {
    setUserInfo(updatedUserInfo);
  };



  return (
    <AuthContext.Provider value={{ userInfo, token, handleLogout, updateUserInfo }}>
      <BrowserRouter>
        {/* RouterMain에 handleLoginSuccess 함수를 props로 전달 */}
        <RouterMain handleLoginSuccess={handleLoginSuccess} />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default Root;