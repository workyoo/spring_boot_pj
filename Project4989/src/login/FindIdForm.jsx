import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const FindIdForm = ({ onBack }) => {
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        verificationCode: ''
    });
    const [step, setStep] = useState(1); // 1: 정보입력, 2: SMS인증, 3: 결과표시
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [foundId, setFoundId] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 1단계: SMS 인증코드 발송
    const handleSendVerification = async () => {
        if (!formData.email || !formData.phoneNumber) {
            setMessage('이메일과 전화번호를 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            // SMS 발송
            await axios.post('http://localhost:4989/sms/send', {
                phoneNumber: formData.phoneNumber
            });
            
            setStep(2);
            setMessage('인증번호가 발송되었습니다.');
        } catch (error) {
            setMessage('SMS 발송에 실패했습니다. 전화번호를 확인해주세요.');
        }
        setLoading(false);
    };

    // 2단계: 인증번호 확인 및 아이디 찾기
    const handleVerifyAndFindId = async () => {
        if (!formData.verificationCode) {
            setMessage('인증번호를 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            // 인증번호 확인
            await axios.post('http://localhost:4989/sms/verify', {
                phoneNumber: formData.phoneNumber,
                code: formData.verificationCode
            });

            // 인증 성공 후 아이디 찾기
            const response = await axios.post('http://localhost:4989/find-id', {
                email: formData.email,
                phoneNumber: formData.phoneNumber
            });

            setFoundId(response.data.loginId);
            setStep(3);
            setMessage('아이디를 찾았습니다!');
        } catch (error) {
            if (error.response?.status === 400) {
                setMessage('인증번호가 일치하지 않습니다.');
            } else if (error.response?.status === 404) {
                setMessage('입력하신 정보와 일치하는 회원을 찾을 수 없습니다.');
            } else {
                setMessage('오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
        setLoading(false);
    };

    const handleReset = () => {
        setFormData({ email: '', phoneNumber: '', verificationCode: '' });
        setStep(1);
        setMessage('');
        setFoundId('');
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
                아이디 찾기
            </Typography>

            {message && (
                <Alert severity={step === 3 ? 'success' : 'info'} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            {step === 1 && (
                <Box>
                    <TextField
                        fullWidth
                        name="email"
                        label="이메일"
                        type="email"
                        value={formData.email}
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
                        onClick={handleVerifyAndFindId}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : '인증하고 아이디 찾기'}
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
                    <Typography variant="h6" align="center" color="primary" sx={{ mb: 2 }}>
                        찾은 아이디: {foundId}
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleReset}
                        sx={{ mt: 2 }}
                    >
                        다시 찾기
                    </Button>
                </Box>
            )}

            <Button
                fullWidth
                variant="text"
                onClick={onBack}
                sx={{ mt: 2 }}
            >
                로그인으로 돌아가기
            </Button>
        </Paper>
    );
};

export default FindIdForm;

