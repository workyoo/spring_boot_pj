import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const ResetPasswordForm = ({ onBack }) => {
    const [formData, setFormData] = useState({
        loginId: '',
        phoneNumber: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const { newPassword } = formData;
        if (!newPassword) {
            setPasswordError('');
            return;
        }
        const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{10,}$/;
        
        if (!strongPasswordRegex.test(newPassword)) {
            setPasswordError('비밀번호는 10자 이상, 대/소문자, 숫자, 특수문자를 포함해야 합니다.');
        } else {
            setPasswordError('');
        }
    }, [formData.newPassword]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendVerification = async () => {
        if (!formData.loginId || !formData.phoneNumber) {
            setMessage('아이디와 전화번호를 모두 입력해주세요.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:4989/verify-for-password-reset', {
                loginId: formData.loginId,
                phoneNumber: formData.phoneNumber
            });
            await axios.post('http://localhost:4989/sms/send', {
                phoneNumber: formData.phoneNumber
            });
            setStep(2);
            setMessage('인증번호가 발송되었습니다.');
        } catch (error) {
            setMessage(error.response?.data?.message || '정보 확인 또는 SMS 발송에 실패했습니다.');
        }
        setLoading(false);
    };

    const handleVerifyCode = async () => {
        if (!formData.verificationCode) {
            setMessage('인증번호를 입력해주세요.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:4989/sms/verify', {
                phoneNumber: formData.phoneNumber,
                code: formData.verificationCode
            });
            setStep(3);
            setMessage('인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
        } catch (error) {
            setMessage('인증번호가 일치하지 않습니다.');
        }
        setLoading(false);
    };

    const handleResetPassword = async () => {
        if (passwordError) {
            setMessage(passwordError);
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:4989/reset-password', {
                loginId: formData.loginId,
                newPassword: formData.newPassword
            });
            setStep(4);
            setMessage('비밀번호가 성공적으로 변경되었습니다.');
        } catch (error) {
            setMessage('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        }
        setLoading(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
                비밀번호 재설정
            </Typography>

            {message && (
                <Alert severity={step === 4 ? 'success' : 'info'} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            {step === 1 && (
                <Box>
                    <TextField
                        fullWidth
                        name="loginId"
                        label="아이디"
                        value={formData.loginId}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        name="phoneNumber"
                        label="전화번호 (01012345678)"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSendVerification}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : '인증번호 발송'}
                    </Button>
                </Box>
            )}

            {step === 2 && (
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {formData.phoneNumber}로 발송된 인증번호를 입력해주세요.
                    </Typography>
                    <TextField
                        fullWidth
                        name="verificationCode"
                        label="인증번호"
                        value={formData.verificationCode}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleVerifyCode}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : '인증번호 확인'}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => setStep(1)}
                        sx={{ mt: 1 }}
                    >
                        다시 입력하기
                    </Button>
                </Box>
            )}

            {step === 3 && (
                <Box>
                    <TextField
                        fullWidth
                        name="newPassword"
                        label="새 비밀번호"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                        error={!!passwordError}
                        helperText={passwordError}
                    />
                    <TextField
                        fullWidth
                        name="confirmPassword"
                        label="새 비밀번호 확인"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleResetPassword}
                        disabled={loading || !!passwordError}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : '비밀번호 변경'}
                    </Button>
                </Box>
            )}

            {step === 4 && (
                <Box>
                    <Typography variant="h6" align="center" color="primary" sx={{ mb: 2 }}>
                        비밀번호 변경 완료!
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                        새로운 비밀번호로 로그인해주세요.
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={onBack}
                        sx={{ mt: 2 }}
                    >
                        로그인하러 가기
                    </Button>
                </Box>
            )}

            {step !== 4 && (
                <Button fullWidth variant="text" onClick={onBack} sx={{ mt: 2 }}>
                    로그인으로 돌아가기
                </Button>
            )}
        </Paper>
    );
};

export default ResetPasswordForm;