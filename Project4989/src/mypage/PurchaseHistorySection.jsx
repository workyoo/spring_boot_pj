import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const PurchaseHistorySection = ({ userInfo }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = userInfo?.token || localStorage.getItem('jwtToken');
      
      // console.log('🔍 구매내역 조회 시작');
      // console.log('🔑 토큰:', token ? '존재함' : '없음');
      // console.log('👤 사용자 정보:', userInfo);
      
      const response = await axios.get(
        `http://localhost:4989/post/purchaseHistory`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // console.log('📡 API 응답:', response.data);

      if (response.data.success) {
        const purchases = response.data.purchases || [];
        // console.log('🛒 구매내역 데이터:', purchases);
        setPurchases(purchases);
      } else {
        // console.error('❌ API 실패:', response.data.message);
        setError('구매내역을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      // console.error('❌ 구매내역 조회 실패:', error);
      // console.error('❌ 에러 상세:', error.response?.data);
      setError('구매내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (postId) => {
    navigate(`/board/GoodsDetail?postId=${postId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SOLD':
        return 'success';
      case 'RESERVED':
        return 'warning';
      case 'ON_SALE':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SOLD':
        return '구매완료';
      case 'RESERVED':
        return '예약중';
      case 'ON_SALE':
        return '판매중';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          구매내역을 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (purchases.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          아직 구매한 상품이 없습니다
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          마음에 드는 상품을 찾아보세요!
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => navigate('/goods')}
        >
          상품 둘러보기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          구매내역 ({purchases.length}건)
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchPurchaseHistory}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          새로고침
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {purchases.map((purchase) => (
          <Grid item xs={12} sm={6} md={4} key={purchase.postId}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => handleViewDetail(purchase.postId)}
            >
              <CardMedia
                component="img"
                height="200"
                image={purchase.mainPhotoUrl ? `http://localhost:4989/postphoto/${purchase.mainPhotoUrl}` : '/placeholder-image.jpg'}
                alt={purchase.title}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.3
                }}>
                  {purchase.title}
                </Typography>
                
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                  {purchase.price ? new Intl.NumberFormat().format(purchase.price) + '원' : '가격 미정'}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={getStatusText(purchase.status)}
                    color={getStatusColor(purchase.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={purchase.tradeType === 'SALE' ? '판매' : purchase.tradeType === 'AUCTION' ? '경매' : '나눔'}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>판매자:</strong> {purchase.sellerNickname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>구매일:</strong> {formatDate(purchase.updatedAt)}
                  </Typography>
                  {purchase.postType && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>카테고리:</strong> {
                        purchase.postType === 'ITEMS' ? '중고물품' :
                        purchase.postType === 'CARS' ? '자동차' :
                        purchase.postType === 'REAL_ESTATES' ? '부동산' : purchase.postType
                      }
                    </Typography>
                  )}
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetail(purchase.postId);
                  }}
                >
                  상세보기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PurchaseHistorySection;
