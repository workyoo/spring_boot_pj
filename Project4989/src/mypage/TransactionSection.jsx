import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Pagination,
  CardMedia,
  CardActionArea
} from '@mui/material';
import './TransactionSection.css';
import {
  ShoppingCart,
  Gavel,
  CardGiftcard,
  AllInclusive,
  Visibility,
  AccessTime,
  CheckCircle,
  Cancel,
  Schedule,
  AttachMoney,
  Person,
  RemoveRedEye
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const TransactionSection = ({ userInfo }) => {
  const [typeFilter, setTypeFilter] = useState('all'); // all, auction, sale, share
  const [statusFilter, setStatusFilter] = useState('all'); // all, on_sale, reserved, sold, cancelled
  const [posts, setPosts] = useState([]);
  const [totalCounts, setTotalCounts] = useState({
    total: 0,
    auction: 0,
    sale: 0,
    share: 0
  });
  const [statusCounts, setStatusCounts] = useState({
    on_sale: 0,
    reserved: 0,
    sold: 0,
    cancelled: 0
  });

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const [postImages, setPostImages] = useState({}); // 각 게시글의 이미지 URL 저장
  const [imageErrors, setImageErrors] = useState(new Set()); // 이미지 로드 실패한 게시글 ID 저장

  const navigate = useNavigate();

  // 전체 카운트 조회 (한 번만 호출)
  const fetchTotalCounts = async () => {
    try {
      const response = await api.get(
        `/auction/my-posts-counts/${userInfo.memberId}`
      );
      setTotalCounts(response.data);
    } catch (error) {
      console.error('게시글 개수 조회 실패:', error);
    }
  };

  // 게시글의 이미지 가져오기
  const fetchPostImages = async (posts) => {
    const images = {};
    for (const post of posts) {
      try {
        const photoResponse = await api.get(`/auction/photos/${post.postId}`);
        if (photoResponse.data && photoResponse.data.length > 0) {
          // isMain이 true인 사진을 우선적으로 선택, 없으면 첫 번째 사진 사용
          const mainPhoto = photoResponse.data.find(photo => photo.isMain === true) || photoResponse.data[0];
          const imageUrl = mainPhoto.photoUrl;
          // 이미지 URL 생성 - postphoto 경로 사용
          const imageWithToken = `http://localhost:4989/postphoto/${imageUrl}`;
          images[post.postId] = { url: imageWithToken, originalUrl: imageUrl };
        }
      } catch (error) {
        console.error(`게시글 ${post.postId} 이미지 조회 실패:`, error);
      }
    }
    setPostImages(images);
  };

  // 게시글 조회 및 상태별 카운트 계산
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/auction/my-posts/${userInfo.memberId}`,
        {
          params: {
            type: typeFilter === 'all' ? null : typeFilter,
            status: statusFilter === 'all' ? null : statusFilter,
            page: currentPage,
            size: pageSize
          }
        }
      );


      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);

      // 서버에서 받은 상태별 카운트 사용
      if (response.data.statusCounts) {
        setStatusCounts(response.data.statusCounts);
      }

      // 게시글 이미지 가져오기
      await fetchPostImages(response.data.posts);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 현재 선택된 타입에 따른 상태별 카운트 계산
  const getCurrentStatusCounts = () => {
    if (typeFilter === 'all') {
      // 전체 선택 시 서버에서 받은 전체 카운트 사용
      return statusCounts;
    } else {
      // 특정 타입 선택 시 해당 타입의 게시글들만 계산
      const filteredPosts = posts.filter(post => post.tradeType === typeFilter);
      const counts = {
        on_sale: 0,
        reserved: 0,
        sold: 0,
        cancelled: 0
      };

      filteredPosts.forEach(post => {
        if (post.status === 'ON_SALE') counts.on_sale++;
        else if (post.status === 'RESERVED') counts.reserved++;
        else if (post.status === 'SOLD') {
          if (post.tradeType === 'AUCTION' && !post.winnerId) {
            counts.cancelled++; // 유찰
          } else {
            counts.sold++; // 거래완료
          }
        }
      });

      return counts;
    }
  };

  const currentStatusCounts = getCurrentStatusCounts();

  // 현재 선택된 타입의 전체 개수 (상태 필터와 무관하게 고정)
  const getCurrentTypeTotalCount = () => {
    if (typeFilter === 'all') {
      return totalCounts.total;
    } else {
      return totalCounts[typeFilter.toLowerCase()] || 0;
    }
  };

  const currentTypeTotalCount = getCurrentTypeTotalCount();

  // 타입별 필터 변경 시 상태 필터 초기화 및 카운트 업데이트
  const handleTypeFilterChange = (newTypeFilter) => {
    setTypeFilter(newTypeFilter);
    setStatusFilter('all'); // 상태 필터를 전체로 초기화
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // 상태별 필터 변경 시
  const handleStatusFilterChange = (newStatusFilter) => {
    setStatusFilter(newStatusFilter);
    setCurrentPage(1); // 첫 페이지로 이동
  };


  useEffect(() => {
    if (userInfo?.memberId) {
      fetchTotalCounts();
    }
  }, [userInfo?.memberId]);

  useEffect(() => {
    if (userInfo?.memberId) {
      setCurrentPage(1); // 필터 변경 시 첫 페이지로
      fetchPosts();
    }
  }, [userInfo?.memberId, typeFilter, statusFilter]);

  useEffect(() => {
    if (userInfo?.memberId) {
      fetchPosts();
    }
  }, [currentPage]);

  // 상태별 아이콘과 색상
  const getStatusInfo = (status, tradeType, winnerId) => {
    // 유찰 조건 체크
    if (status === 'SOLD' && tradeType === 'AUCTION' && !winnerId) {
      return { icon: <Cancel />, color: 'error', label: '유찰' };
    }

    switch (status) {
      case 'ON_SALE':
        return { icon: <Visibility />, color: 'primary', label: '판매중' };
      case 'RESERVED':
        return { icon: <Schedule />, color: 'warning', label: '예약중' };
      case 'SOLD':
        return { icon: <CheckCircle />, color: 'success', label: '거래완료' };
      default:
        return { icon: <Visibility />, color: 'default', label: status };
    }
  };

  // 타입별 아이콘과 색상
  const getTypeInfo = (type) => {
    switch (type) {
      case 'AUCTION':
        return { icon: <Gavel />, color: 'primary', label: '경매' };
      case 'SALE':
        return { icon: <ShoppingCart />, color: 'secondary', label: '일반거래' };
      case 'SHARE':
        return { icon: <CardGiftcard />, color: 'success', label: '나눔' };
      default:
        return { icon: <AllInclusive />, color: 'default', label: type };
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    if (!price) return '없음';
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // 페이지 변경 핸들러
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // 게시글 상세 페이지로 이동하는 함수
  const handlePostClick = (post) => {
    if (post.tradeType === 'AUCTION') {
      // 경매는 auction 상세 페이지로
      navigate(`/auction/detail/${post.postId}`);
    } else {
      // 일반 게시글과 나눔은 board 상세 페이지로
      navigate(`/board/GoodsDetail?postId=${post.postId}`);
    }
  };

  return (
    <Box className="transaction-section-container">
      {/* 타입별 필터 */}
      <Box className="transaction-filter-section">
        <Typography variant="h6" className="transaction-filter-title">
          게시글 타입
        </Typography>
        <Grid container spacing={2} className="transaction-filter-buttons">
          <Grid item>
            <Button
              variant={typeFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleTypeFilterChange('all')}
              startIcon={<AllInclusive />}
              className={`transaction-filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
            >
              전체 ({totalCounts.total})
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={typeFilter === 'AUCTION' ? 'contained' : 'outlined'}
              onClick={() => handleTypeFilterChange('AUCTION')}
              startIcon={<Gavel />}
              className={`transaction-filter-btn ${typeFilter === 'AUCTION' ? 'active' : ''}`}
            >
              경매 ({totalCounts.auction})
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={typeFilter === 'SALE' ? 'contained' : 'outlined'}
              onClick={() => handleTypeFilterChange('SALE')}
              startIcon={<ShoppingCart />}
              className={`transaction-filter-btn ${typeFilter === 'SALE' ? 'active' : ''}`}
            >
              일반거래 ({totalCounts.sale})
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={typeFilter === 'SHARE' ? 'contained' : 'outlined'}
              onClick={() => handleTypeFilterChange('SHARE')}
              startIcon={<CardGiftcard />}
              className={`transaction-filter-btn ${typeFilter === 'SHARE' ? 'active' : ''}`}
            >
              나눔 ({totalCounts.share})
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 상태별 필터 */}
      <Box className="transaction-filter-section">
        <Typography variant="h6" className="transaction-filter-title">
          게시글 상태
        </Typography>
        <Grid container spacing={2} className="transaction-filter-buttons">
          <Grid item>
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilterChange('all')}
              className={`transaction-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            >
              전체 ({currentTypeTotalCount})
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={statusFilter === 'ON_SALE' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilterChange('ON_SALE')}
              startIcon={<Visibility />}
              className={`transaction-filter-btn ${statusFilter === 'ON_SALE' ? 'active' : ''}`}
            >
              판매중 ({currentStatusCounts.onSale})
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={statusFilter === 'RESERVED' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilterChange('RESERVED')}
              startIcon={<Schedule />}
              className={`transaction-filter-btn ${statusFilter === 'RESERVED' ? 'active' : ''}`}
            >
              예약중 ({currentStatusCounts.reserved})
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={statusFilter === 'SOLD' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilterChange('SOLD')}
              startIcon={<CheckCircle />}
              className={`transaction-filter-btn ${statusFilter === 'SOLD' ? 'active' : ''}`}
            >
              거래완료 ({currentStatusCounts.sold})
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={statusFilter === 'cancelled' ? 'contained' : 'outlined'}
              onClick={() => handleStatusFilterChange('cancelled')}
              startIcon={<Cancel />}
              className={`transaction-filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            >
              유찰 ({currentStatusCounts.cancelled})
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 게시글 목록 */}
      <Box className="transaction-posts-container">
        <Typography variant="h6" className="transaction-posts-title">
          게시글 목록 ({totalCount}개)
        </Typography>

        {loading ? (
          <Box className="transaction-loading-container">
            <Box className="transaction-loading-content">
              <CircularProgress size={60} className="transaction-loading-spinner" />
              <Typography variant="h6" color="text.secondary" className="transaction-loading-text">
                게시글을 불러오는 중...
              </Typography>
            </Box>
          </Box>
        ) : posts.length === 0 ? (
          <Box className="transaction-empty-container">
            <Typography variant="h5" color="text.secondary" className="transaction-empty-title">
              📭 게시글이 없습니다
            </Typography>
            <Typography variant="body1" color="text.secondary">
              해당하는 게시글이 없습니다.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} className="transaction-posts-grid">
              {posts.map((post) => {
                const statusInfo = getStatusInfo(post.status, post.tradeType, post.winnerId);
                const typeInfo = getTypeInfo(post.tradeType);

                return (
                  <Grid item xs={12} sm={6} md={4} key={post.postId}>
                    <Card
                      className="transaction-post-card"
                      onClick={() => handlePostClick(post)}
                    >
                      {/* 이미지 - 고정 높이 */}
                      <Box className="transaction-post-image-container">
                        {postImages[post.postId] && !imageErrors.has(post.postId) ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={postImages[post.postId].url}
                            alt={post.title}
                            className="transaction-post-image"
                            onError={(e) => {
                              console.log('이미지 로드 실패:', postImages[post.postId].originalUrl);
                              console.log('실패한 이미지 URL:', e.target.src);
                              setImageErrors(prev => new Set(prev).add(post.postId));
                            }}
                            onLoad={() => {
                              console.log('이미지 로드 성공:', postImages[post.postId].originalUrl);
                            }}
                          />
                        ) : (
                          <Box className="transaction-post-no-image">
                            <Typography variant="body1">이미지 없음</Typography>
                          </Box>
                        )}
                      </Box>

                      <CardContent className="transaction-post-content">
                        {/* 칩들 - 고정 높이 */}
                        <Box className="transaction-post-chips">
                          <Chip
                            icon={typeInfo.icon}
                            label={typeInfo.label}
                            color={typeInfo.color}
                            size="small"
                            className="transaction-post-chip"
                          />
                          <Chip
                            icon={statusInfo.icon}
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                            className="transaction-post-chip"
                          />
                        </Box>

                        {/* 제목 - 고정 높이 */}
                        <Typography
                          variant="h6"
                          className="transaction-post-title"
                        >
                          {post.title}
                        </Typography>



                        {/* 가격 정보 - 고정 높이 */}
                        <Box className="transaction-post-price">
                          <Typography
                            variant="body1"
                            className="transaction-post-price-text"
                          >
                            <AttachMoney fontSize="small" />
                            {formatPrice(post.price)}
                          </Typography>
                        </Box>

                        {/* 추가 정보 - 고정 높이 */}
                        <Box className="transaction-post-view-count">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            className="transaction-post-view-count-text"
                          >
                            <RemoveRedEye fontSize="small" />
                            조회수: {post.viewCount || 0}
                          </Typography>
                        </Box>

                        {/* 날짜 정보 - 고정 높이 */}
                        <Box className="transaction-post-dates">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            className="transaction-post-date-text"
                          >
                            작성일: {formatDate(post.createdAt)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            className="transaction-post-date-text"
                          >
                            마감일: {post.auctionEndTime ? formatDate(post.auctionEndTime) : '없음'}
                          </Typography>
                        </Box>

                        {/* 구매자 정보 - 고정 높이 */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          className="transaction-post-buyer"
                        >
                          <Person fontSize="small" />
                          구매자: {post.buyerName || '없음'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* 페이징 */}
            {totalPages > 1 && (
              <Box className="transaction-pagination-container">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  className="transaction-pagination-item"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default TransactionSection;
