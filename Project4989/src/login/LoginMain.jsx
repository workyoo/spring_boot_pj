import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import FindIdForm from './FindIdForm';
import ResetPasswordForm from './ResetPasswordForm';

const LoginMain = ({ onLoginSuccess }) => {
    const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'findId', 'resetPassword'

    const renderCurrentView = () => {
        switch (currentView) {
            case 'login':
                return <LoginForm onLoginSuccess={onLoginSuccess} />;
            case 'signup':
                return <SignupForm />;
            case 'findId':
                return <FindIdForm onBack={() => setCurrentView('login')} />;
            case 'resetPassword':
                return <ResetPasswordForm onBack={() => setCurrentView('login')} />;
            default:
                return <LoginForm onLoginSuccess={onLoginSuccess} />;
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 2 }}>
            {currentView === 'login' && (
                <>
                    <LoginForm onLoginSuccess={onLoginSuccess} />
                    
                    {/* 찾기 링크들 */}
                    <Box sx={{ mt: -1, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            계정에 문제가 있으신가요?
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Button 
                                variant="text" 
                                size="small"
                                onClick={() => setCurrentView('findId')}
                                sx={{ color: 'primary.main' }}
                            >
                                아이디 찾기
                            </Button>
                            <Typography variant="body2" color="text.secondary">|</Typography>
                            <Button 
                                variant="text" 
                                size="small"
                                onClick={() => setCurrentView('resetPassword')}
                                sx={{ color: 'primary.main' }}
                            >
                                비밀번호 재설정
                            </Button>
                            <Typography variant="body2" color="text.secondary">|</Typography>
                            <Button 
                                variant="text" 
                                size="small"
                                onClick={() => setCurrentView('signup')}
                                sx={{ color: 'primary.main' }}
                            >
                                회원가입
                            </Button>
                        </Box>
                    </Box>
                </>
            )}
            
            {currentView !== 'login' && renderCurrentView()}
        </Box>
    );
};

export default LoginMain;

