import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/api';
import './CreditTierDisplay.css';

const CreditTierDisplay = ({ memberId, showDetails = false, onCreditDataLoaded }) => {
  const { userInfo } = useContext(AuthContext);
  const [creditTier, setCreditTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTierInfo, setShowTierInfo] = useState(false);

  useEffect(() => {
    // 로그인 상태일 때만 신용도 정보를 가져옴
    if (memberId && userInfo) {
      fetchCreditTier();
    }
  }, [memberId, userInfo]);

  const fetchCreditTier = async () => {
    try {
      setLoading(true);
      console.log('신용도 등급 조회 시작, memberId:', memberId);

      const response = await api.get(`/api/credit-tier/${memberId}`);
      console.log('신용도 등급 API 응답:', response.data);

            if (response.data.success) {
        const creditData = response.data.data;
        setCreditTier(creditData);
        console.log('신용도 등급 데이터 설정됨:', creditData);
        
        // 부모 컴포넌트에 신용도 데이터 전달
        if (onCreditDataLoaded) {
          console.log('부모 컴포넌트에 데이터 전달:', creditData);
          onCreditDataLoaded(creditData);
        } else {
          console.log('onCreditDataLoaded 콜백이 없음');
        }
      } else {
        console.log('API 응답이 success가 아님:', response.data);
      }
    } catch (error) {
      console.error('신용도 등급 조회 실패:', error);
      console.error('에러 상세:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case '거래왕': return '#FFD700'; // 금색
      case '마스터': return '#C0C0C0'; // 은색
      case '장인': return '#CD7F32'; // 동색
      case '거래꾼': return '#4CAF50'; // 초록색
      case '초보상인': return '#2196F3'; // 파란색
      default: return '#9E9E9E'; // 회색
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case '거래왕': return '👑';
      case '마스터': return '⭐';
      case '장인': return '🔧';
      case '거래꾼': return '💼';
      case '초보상인': return '🛒';
      default: return '👤';
    }
  };

  const getTierInfo = () => {
    return [
      { tier: '초보상인', range: '0~199점', color: '#2196F3', description: '신규 회원으로 기본 신용도 보유' },
      { tier: '거래꾼', range: '200~399점', color: '#4CAF50', description: '기본 거래 경험을 쌓은 회원' },
      { tier: '장인', range: '400~599점', color: '#CD7F32', description: '안정적인 거래 실적을 보유한 회원' },
      { tier: '마스터', range: '600~799점', color: '#C0C0C0', description: '높은 신용도와 거래 실적을 보유한 회원' },
      { tier: '거래왕', range: '800~1000점', color: '#FFD700', description: '최고 수준의 신용도와 거래 실적을 보유한 회원' }
    ];
  };

  // 로그아웃 상태에서는 신용도 정보를 표시하지 않음
  if (!userInfo) {
    return null;
  }

  if (loading) {
    return <div className="credit-tier-loading">등급 정보 로딩 중...</div>;
  }

  if (!creditTier) {
    return <div className="credit-tier-default">등급 정보 없음</div>;
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* 신용도 등급 뱃지 - 상단 중앙 배치 */}
      <Box sx={{ mb: 2 }}>
        <Chip
          icon={<span style={{ fontSize: '12px' }}>{getTierIcon(creditTier.tier)}</span>}
          label={creditTier.tier}
          sx={{
            backgroundColor: getTierColor(creditTier.tier),
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 6px',
            height: '24px',
            '& .MuiChip-label': {
              paddingLeft: '3px'
            }
          }}
        />
      </Box>

      {showDetails && (
        <Box className="credit-tier-details">
          <div className="credit-tier-score">
            <span className="score-label">총점:</span>
            <span className="score-value">{creditTier.totalScore}점</span>
          </div>
          <div className="credit-tier-breakdown">
            <div className="breakdown-item">
              <span>거래량: {creditTier.transactionScore}점</span>
              <span className="breakdown-detail">({creditTier.completedTransactions}건)</span>
            </div>
            <div className="breakdown-item">
              <span>평점: {creditTier.ratingScore}점</span>
              <span className="breakdown-detail">({creditTier.averageRating.toFixed(1)}점)</span>
            </div>
            <div className="breakdown-item">
              <span>신고: {creditTier.penaltyScore}점</span>
              <span className="breakdown-detail">({creditTier.reportCount}건)</span>
            </div>
          </div>

          {/* 등급 정보 버튼 */}
          <Box sx={{ mt: 2 }}>
            <Tooltip title="등급 정보 보기" arrow>
              <Button
                variant="outlined"
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => setShowTierInfo(true)}
                sx={{
                  borderColor: getTierColor(creditTier.tier),
                  color: getTierColor(creditTier.tier),
                  '&:hover': {
                    borderColor: getTierColor(creditTier.tier),
                    backgroundColor: `${getTierColor(creditTier.tier)}10`
                  }
                }}
              >
                등급 정보!
              </Button>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* 등급 정보 다이얼로그 */}
      <Dialog
        open={showTierInfo}
        onClose={() => setShowTierInfo(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <Typography variant="h6">신용도 등급 체계</Typography>
          <IconButton onClick={() => setShowTierInfo(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {getTierInfo().map((tierInfo, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: `${tierInfo.color}10`,
                  border: `1px solid ${tierInfo.color}30`
                }}
              >
                <Chip
                  label={tierInfo.tier}
                  size="small"
                  sx={{
                    backgroundColor: tierInfo.color,
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: tierInfo.color }}>
                    {tierInfo.range}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tierInfo.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTierInfo(false)} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreditTierDisplay;