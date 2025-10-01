import React from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';

const StyledModal = styled(Modal)({
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
  },
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  border: '1px solid rgba(74, 144, 226, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(74, 144, 226, 0.15)',
  p: 4,
  outline: 'none',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
};

const StyledSelect = styled('select')({
  width: '100%',
  padding: '12px 16px',
  border: '2px solid rgba(74, 144, 226, 0.2)',
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  background: '#FFFFFF',
  transition: 'all 0.3s ease',
  boxSizing: 'border-box',
  marginTop: '16px',
  '&:focus': {
    outline: 'none',
    borderColor: '#4A90E2',
    boxShadow: '0 0 0 3px rgba(74, 144, 226, 0.1)',
    transform: 'translateY(-1px)',
  },
  '&:hover': {
    borderColor: '#4A90E2',
  },
});

const StyledTextarea = styled('textarea')({
  width: '100%',
  height: '150px',
  padding: '12px 16px',
  border: '2px solid rgba(74, 144, 226, 0.2)',
  borderRadius: '12px',
  fontSize: '14px',
  fontFamily: 'inherit',
  background: '#FFFFFF',
  transition: 'all 0.3s ease',
  boxSizing: 'border-box',
  marginTop: '16px',
  resize: 'vertical',
  lineHeight: '1.5',
  '&:focus': {
    outline: 'none',
    borderColor: '#4A90E2',
    boxShadow: '0 0 0 3px rgba(74, 144, 226, 0.1)',
    transform: 'translateY(-1px)',
  },
  '&:hover': {
    borderColor: '#4A90E2',
  },
});

const StyledButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '14px',
  fontFamily: 'inherit',
  transition: 'all 0.3s ease',
  minWidth: '100px',
  '&.MuiButton-contained': {
    background: '#4A90E2',
    border: '2px solid #4A90E2',
    '&:hover': {
      background: '#2E5BBA',
      borderColor: '#2E5BBA',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(74, 144, 226, 0.3)',
    },
    '&:disabled': {
      background: 'rgba(74, 144, 226, 0.3)',
      borderColor: 'rgba(74, 144, 226, 0.3)',
    },
  },
  '&.MuiButton-outlined': {
    border: '2px solid #4A90E2',
    color: '#4A90E2',
    '&:hover': {
      background: '#4A90E2',
      color: '#FFFFFF',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(74, 144, 226, 0.3)',
    },
    '&:disabled': {
      borderColor: 'rgba(74, 144, 226, 0.3)',
      color: 'rgba(74, 144, 226, 0.3)',
    },
  },
});

const StyledTypography = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#2E3C2E',
  marginBottom: '8px',
  fontFamily: 'inherit',
  background: 'linear-gradient(135deg, #2E3C2E 0%, #4F684E 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '&::after': {
    content: '""',
    display: 'block',
    width: '40px',
    height: '3px',
    background: '#4A90E2',
    borderRadius: '2px',
    marginTop: '8px',
  },
});

const ButtonContainer = styled('div')({
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
  justifyContent: 'flex-end',
});

const ReportModal = ({
  open, onClose,
  reason, onChangeReason,
  reportType, onChangeType,
  onSubmit, submitting
}) => {
  return (
    <StyledModal open={open} onClose={onClose} aria-labelledby="report-title">
      <Box sx={style}>
        <StyledTypography id="report-title" variant="h6">
          신고/문의
        </StyledTypography>

        <StyledSelect
          name="reportType"
          value={reportType}
          onChange={(e) => onChangeType(e.target.value)}
        >
          <option value="" disabled>신고대상타입을 선택해주세요</option>
          <option value="POST">게시글</option>
          <option value="MEMBER">작성자</option>
        </StyledSelect>

        <StyledTextarea
          name="reason"
          value={reason}
          onChange={onChangeReason}
          placeholder="신고/문의 사유를 자세히 작성해주세요..."
        />

        <ButtonContainer>
          <StyledButton
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={onSubmit}
            disabled={submitting || !reason.trim() || !reportType}
          >
            {submitting ? '전송 중...' : '신고하기'}
          </StyledButton>
        </ButtonContainer>
      </Box>
    </StyledModal>
  );
};

export default ReportModal;
