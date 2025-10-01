import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
            // 1. 토큰을 localStorage에 저장합니다.
            localStorage.setItem('jwtToken', token);
            
            // 2. 앞으로의 모든 axios 요청 헤더에 토큰을 기본으로 설정합니다.
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // 3. 모든 처리가 끝나면 메인 페이지로 이동시킵니다.
            //    (이제 Root 컴포넌트의 useEffect가 이 토큰을 보고 userInfo를 채울 것입니다)
            navigate('/');
            
        } else {
            // 토큰이 없으면 로그인 실패 처리
            alert("소셜 로그인에 실패했습니다.");
            navigate('/login');
        }
    }, [location, navigate]); // 의존성 배열도 간단해집니다.

    return <div>로그인 처리 중입니다...</div>;
};

export default AuthCallback;