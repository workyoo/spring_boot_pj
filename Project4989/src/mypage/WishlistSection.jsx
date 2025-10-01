import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import './WishlistSection.css';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Gavel as GavelIcon,
  Store as StoreIcon,
  CardGiftcard as ShareIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const WishlistSection = ({ userInfo }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [typeCounts, setTypeCounts] = useState({
    total: 0,
    auction: 0,
    general: 0,
    share: 0
  });

  // 필터 상태
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // 삭제 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 이미지 상태
  const [postImages, setPostImages] = useState({});

  const itemsPerPage = 12; // 한 줄에 4개씩, 3줄

  // 게시글의 이미지 가져오기
  const fetchPostImages = async (favorites) => {
    const images = {};
    for (const item of favorites) {
      try {
        // 여러 가능한 필드명을 시도
        const postId = item.post_id || item.postId || item.id;
        if (!postId) {
          console.error('❌ postId를 찾을 수 없습니다:', item);
          continue;
        }

        const photoResponse = await api.get(`/auction/photos/${postId}`);
        if (photoResponse.data && photoResponse.data.length > 0) {
          // isMain이 true인 사진을 우선적으로 선택, 없으면 첫 번째 사진 사용
          const mainPhoto = photoResponse.data.find(photo => photo.isMain === true) || photoResponse.data[0];
          const imageUrl = mainPhoto.photoUrl;
          // 이미지 URL 생성 - postphoto 경로 사용
          const imageWithToken = `http://localhost:4989/postphoto/${imageUrl}`;
          images[postId] = { url: imageWithToken, originalUrl: imageUrl };
        }
      } catch (error) {
        console.error(`게시글 ${item.post_id || item.postId || item.id} 이미지 조회 실패:`, error);
      }
    }
    setPostImages(images);
  };

  // 찜한 상품 목록 조회
  const fetchFavorites = async () => {
    if (!userInfo?.memberId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/auction/my-favorites/${userInfo.memberId}`, {
        params: {
          type: typeFilter,
          search: searchTerm,
          sort: sortBy,
          page: currentPage,
          size: itemsPerPage
        }
      });

      const favoritesData = response.data.favorites || [];
      console.log('🔍 찜한 상품 응답:', response.data);
      console.log('🔍 찜한 상품 favorites:', favoritesData);

      setFavorites(favoritesData);
      setTotalPages(response.data.totalPages || 1);
      setTotalCount(response.data.totalCount || 0);

      if (response.data.typeCounts) {
        setTypeCounts(response.data.typeCounts);
      }

      // 게시글 이미지 가져오기
      await fetchPostImages(favoritesData);
    } catch (error) {
      console.error('찜한 상품 조회 실패:', error);
      setError('찜한 상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 찜 삭제
  const handleRemoveFavorite = (postId) => {
    setItemToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !userInfo?.memberId) return;

    try {
      await api.post(`/auction/favorite/toggle`, null, {
        params: { postId: itemToDelete }
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);

      // 목록 다시 조회
      fetchFavorites();
    } catch (error) {
      console.error('찜 삭제 실패:', error);
      setError('찜 삭제에 실패했습니다.');
    }
  };

  // 상품 상세보기
  const handleViewProduct = (item) => {
    console.log('🔍 클릭된 item:', item);
    console.log('🔍 item.post_id:', item.post_id);
    console.log('🔍 item.postId:', item.postId);
    console.log('🔍 item.id:', item.id);
    console.log('🔍 item.post_type:', item.post_type);

    // 여러 가능한 필드명을 시도
    const postId = item.post_id || item.postId || item.id;
    console.log('🔍 최종 사용할 postId:', postId);

    if (postId) {
      if (item.post_type === 'AUCTION') {
        navigate(`/auction/detail/${postId}`);
      } else {
        navigate(`/board/GoodsDetail?postId=${postId}`);
      }
    } else {
      console.error('❌ postId를 찾을 수 없습니다');
    }
  };

  // 페이지 변경
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // 필터 변경 시 페이지 초기화
  const handleFilterChange = (newTypeFilter) => {
    setTypeFilter(newTypeFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (userInfo?.memberId) {
      fetchFavorites();
    }
  }, [userInfo?.memberId, currentPage, typeFilter, searchTerm, sortBy]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 경매 상품 남은 시간 계산
  const getTimeRemaining = (endTime) => {
    if (!endTime) return '';
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  // 상품 타입별 아이콘과 색상
  const getTypeInfo = (type) => {
    switch (type) {
      case 'AUCTION':
        return { icon: <GavelIcon />, color: 'warning', label: '경매' };
      case 'SALE':
        return { icon: <StoreIcon />, color: 'success', label: '일반' };
      case 'SHARE':
        return { icon: <ShareIcon />, color: 'info', label: '나눔' };
      default:
        return { icon: <StoreIcon />, color: 'default', label: type };
    }
  };

  return (
    <Box className="wishlist-section-container">
      {/* 제목 및 통계 */}
      <Box className="wishlist-stats-container">
        <Typography variant="h5" gutterBottom className="wishlist-posts-title">
          찜한 상품
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="primary">
                {typeCounts.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                전체 상품
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="warning.main">
                {typeCounts.auction || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                경매 상품
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="success.main">
                {typeCounts.general || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                일반 상품
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="info.main">
                {typeCounts.share || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                나눔 상품
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* 필터 및 검색 */}
      <Box className="wishlist-filter-container">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="상품명으로 검색..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>타입</InputLabel>
              <Select
                value={typeFilter}
                label="타입"
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="auction">경매</MenuItem>
                <MenuItem value="general">일반</MenuItem>
                <MenuItem value="share">나눔</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>정렬</InputLabel>
              <Select
                value={sortBy}
                label="정렬"
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <MenuItem value="date">최근 찜한순</MenuItem>
                <MenuItem value="price-low">가격 낮은순</MenuItem>
                <MenuItem value="price-high">가격 높은순</MenuItem>
                <MenuItem value="name">상품명순</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* 로딩 상태 */}
      {loading && (
        <Box className="wishlist-loading-container">
          <CircularProgress className="wishlist-loading-spinner" />
        </Box>
      )}

      {/* 에러 상태 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 찜한 상품 목록 */}
      {!loading && favorites.length === 0 ? (
        <Card className="wishlist-empty-container">
          <FavoriteBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom className="wishlist-empty-title">
            찜한 상품이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            마음에 드는 상품을 찜해보세요!
          </Typography>
        </Card>
      ) : (
        <>
          <Box className="wishlist-posts-container">
            <Grid container spacing={3} className="wishlist-posts-grid">
              {favorites.map((item) => {
                const typeInfo = getTypeInfo(item.post_type);
                const isAuction = item.post_type === 'AUCTION';
                const isAvailable = item.status === 'ON_SALE';

                return (
                  <Grid item key={item.post_id}>
                    <Card
                      className="wishlist-post-card"
                      onClick={() => handleViewProduct(item)}
                    >
                      {/* 상품 이미지 */}
                      <Box className="wishlist-post-image-container">
                        {(() => {
                          const postId = item.post_id || item.postId || item.id;
                          return postImages[postId] ? (
                            <CardMedia
                              component="img"
                              height="200"
                              image={postImages[postId].url}
                              alt={item.title}
                              className="wishlist-post-image"
                            />
                          ) : (
                            <Box className="wishlist-post-no-image">
                              <FavoriteBorderIcon sx={{ fontSize: 48, mb: 1, color: '#ccc' }} />
                              <Typography variant="body2" color="text.secondary">
                                사진 없음
                              </Typography>
                            </Box>
                          );
                        })()}

                        {/* 상품 타입 배지 */}
                        <Chip
                          label={typeInfo.label}
                          color={typeInfo.color}
                          size="small"
                          icon={typeInfo.icon}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 'bold'
                          }}
                        />

                        {/* 재고 상태 배지 */}
                        <Chip
                          label={isAvailable ? '구매 가능' : '품절'}
                          color={isAvailable ? 'success' : 'error'}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 'bold'
                          }}
                        />

                        {/* 경매 남은 시간 */}
                        {isAuction && item.auction_end_time && isAvailable && (
                          <Box sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="caption" fontWeight="bold">
                              {getTimeRemaining(item.auction_end_time)}
                            </Typography>
                          </Box>
                        )}

                        {/* 액션 버튼들 */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          display: 'flex',
                          gap: 1
                        }}>
                          <IconButton
                            size="small"
                            sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProduct(item);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const postId = item.post_id || item.postId || item.id;
                              handleRemoveFavorite(postId);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* 상품 정보 */}
                      <CardContent className="wishlist-post-content">
                        {/* 제목 - 고정 높이 */}
                        <Typography variant="h6" component="h3" className="wishlist-post-title">
                          {item.title}
                        </Typography>
                        <br />
                        <br />
                        <br />

                        {/* 판매자 정보 - 고정 높이 */}
                        <Typography variant="body2" color="text.secondary" className="wishlist-post-view-count-text">
                          판매자: {item.nickname || '알 수 없음'}
                        </Typography>

                        {/* 찜한 날짜 - 고정 높이 */}
                        <Typography variant="body2" color="text.secondary" className="wishlist-post-date-text">
                          찜한 날짜: {formatDate(item.favoriteCreatedAt)}
                        </Typography>

                        <Box sx={{ mt: 'auto' }}>
                          {/* 가격 정보 - 고정 높이 */}
                          <Box className="wishlist-post-price">
                            <Typography variant="h6" color="primary" fontWeight="bold" className="wishlist-post-price-text">
                              {formatPrice(item.price)}
                            </Typography>
                          </Box>

                          {/* 액션 버튼 - 고정 높이 */}
                          <Box className="wishlist-post-actions">
                            {isAuction ? (
                              <Button
                                variant="contained"
                                color="warning"
                                startIcon={<GavelIcon />}
                                fullWidth
                                disabled={!isAvailable}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProduct(item);
                                }}
                                className="wishlist-post-action-btn"
                              >
                                {isAvailable ? '경매 참여' : '경매 종료'}
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                startIcon={<StoreIcon />}
                                fullWidth
                                disabled={!isAvailable}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProduct(item);
                                }}
                                className="wishlist-post-action-btn"
                              >
                                {isAvailable ? '상품 보기' : '품절'}
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Box className="wishlist-pagination-container">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  className="wishlist-pagination-item"
                />
              </Box>
            )}
          </Box>
        </>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>찜 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            이 상품을 찜 목록에서 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WishlistSection;
