import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Pagination,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import api from '../../lib/api';
import { AuthContext } from '../../context/AuthContext';

const PostManagementTab = ({ getStatusText, getStatusColor }) => {
  // const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // 검색 관련 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { userInfo } = useContext(AuthContext);
  const token = userInfo?.token ?? localStorage.getItem('jwtToken');

  // 게시물 목록 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/post/list');
        console.log('게시물 목록 응답:', response.data);
        
        // 응답 데이터를 테이블 형식에 맞게 변환
        const formattedPosts = response.data.map(post => ({
          id: post.postId,
          title: post.title,
          type: getPostTypeText(post.postType),
          author: post.nickname || '알 수 없음',
          status: post.status || 'ON_SALE',
          reports: 0, // 신고 수는 별도 API로 가져와야 함
          postId: post.postId,
          postType: post.postType,
          tradeType: post.tradeType, // 원본 값 저장
          tradeTypeText: getTradeTypeText(post.tradeType) // 한글 텍스트 저장
        }));
        
        setPosts(formattedPosts);
      } catch (err) {
        console.error('게시물 목록 가져오기 실패:', err);
        setError('게시물 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 게시물 타입 텍스트 변환
  const getPostTypeText = (postType) => {
    switch (postType) {
      case 'CARS': return '자동차';
      case 'REAL_ESTATES': return '부동산';
      case 'ITEMS': return '중고물품';
      case 'AUCTION': return '경매';
      default: return postType || '기타';
    }
  };

  // 판매 타입 텍스트 변환
  const getTradeTypeText = (tradeType) => {
    switch (tradeType) {
      case 'SALE': return '판매';
      case 'AUCTION': return '경매';
      case 'SHARE': return '나눔';
      default: return tradeType || '기타';
    }
  };

  // 제목 클릭 시 게시물 디테일 페이지로 이동
  const handleTitleClick = (post) => {
    // 게시물 타입에 따라 다른 디테일 페이지로 이동
    let detailPath = '';
    
    switch (post.postType) {
      case 'CARS':
        detailPath = `/board/GoodsDetail?postId=${post.postId}`;
        break;
      case 'REAL_ESTATES':
        detailPath = `/board/GoodsDetail?postId=${post.postId}`;
        break;
      case 'ITEMS':
        detailPath = `/board/GoodsDetail?postId=${post.postId}`;
        break;
      case 'AUCTION':
        detailPath = `/auction/detail/${post.postId}`;
        break;
      default:
        detailPath = `/board/GoodsDetail?postId=${post.postId}`;
    }
    
    // 새 탭에서 열기
    window.open(detailPath, '_blank');
  };

  // 삭제 확인 다이얼로그 열기
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인 다이얼로그 닫기
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);

    
  };

  // 게시물 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      setDeleteLoading(true);
      
      // JWT 토큰 확인
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // 어드민 권한 확인 (memberId=1)
      const isAdmin = userInfo?.memberId === 1;
      
      if (isAdmin) {
        // 어드민 권한으로 삭제 API 호출
        await api.delete(`/post/admin/${postToDelete.postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // 일반 사용자 삭제 API 호출
        await api.delete(`/post/${postToDelete.postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // 성공 메시지
      const successMessage = isAdmin 
        ? '관리자 권한으로 게시물이 성공적으로 삭제되었습니다.'
        : '게시물이 성공적으로 삭제되었습니다.';
      alert(successMessage);
      
      // 목록에서 삭제된 게시물 제거
      setPosts(prevPosts => prevPosts.filter(post => post.postId !== postToDelete.postId));
      
      // 다이얼로그 닫기
      handleDeleteDialogClose();
      
    } catch (err) {
      console.error('게시물 삭제 실패:', err);
      const errorMessage = err.response?.data?.message || err.message;
      alert('게시물 삭제에 실패했습니다: ' + errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 검색 및 필터링 함수
  const filteredPosts = posts.filter(post => {
    // 검색어 필터링 (디바운싱된 검색어 사용)
    let matchesSearch = false;
    if (searchType === 'id') {
      matchesSearch = post.id.toString().includes(debouncedSearchTerm);
    } else if (searchType === 'title') {
      matchesSearch = post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    }
    
    // 상태 필터링
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    // 타입 필터링
    const matchesType = typeFilter === 'all' || post.postType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // 페이지 변경 핸들러
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // 검색어 디바운싱 (500ms 후에 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 디바운싱된 검색어나 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, searchType, statusFilter, typeFilter]);

  // 현재 페이지의 게시물만 필터링
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  // 로딩 중일 때
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>게시글 목록</Typography>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <CircularProgress />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>게시글 목록</Typography>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            게시글 목록 ({filteredPosts.length}개) - 페이지 {currentPage} / {totalPages}
          </Typography>
          
          {/* 검색 및 필터 섹션 */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>검색 타입</InputLabel>
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  label="검색 타입"
                >
                  <MenuItem value="title">제목</MenuItem>
                  <MenuItem value="id">ID</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="검색어"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색어를 입력하세요"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>상태</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="상태"
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="ON_SALE">판매중</MenuItem>
                  <MenuItem value="SOLD">판매완료</MenuItem>
                  <MenuItem value="RESERVED">예약중</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>카테고리</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="카테고리"
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="CARS">자동차</MenuItem>
                  <MenuItem value="REAL_ESTATES">부동산</MenuItem>
                  <MenuItem value="ITEMS">중고물품</MenuItem>
                  <MenuItem value="AUCTION">경매</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>제목</TableCell>
                  <TableCell>판매타입</TableCell>
                  <TableCell>카테고리</TableCell>
                  <TableCell>작성자</TableCell>
                  <TableCell>상태</TableCell>
                  {/* <TableCell>신고</TableCell> */}
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.id}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          cursor: 'pointer',
                          color: '#000',
                          '&:hover': {
                            color: 'primary.dark'
                          }
                        }}
                        onClick={() => handleTitleClick(post)}
                      >
                        {post.title}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>{post.tradeTypeText}</TableCell>
                    <TableCell>{post.type}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(post.status)} 
                        color={getStatusColor(post.status)} 
                        size="small" 
                      />
                    </TableCell>
                    {/* <TableCell>
                      {post.reports > 0 ? (
                        <Badge badgeContent={post.reports} color="error">
                          <ReportIcon color="action" />
                        </Badge>
                      ) : (
                        <Chip label="0" size="small" variant="outlined" />
                      )}
                    </TableCell> */}
                    <TableCell>
                      {/* <IconButton size="small" onClick={() => onPostDetail(post)}>
                        <VisibilityIcon />
                      </IconButton> */}
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(post)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          게시물 삭제 확인
        </DialogTitle>
        <DialogContent>
          <Typography>
            정말로 "{postToDelete?.title}" 게시물을 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            이 작업은 되돌릴 수 없습니다.
          </Typography>
          {userInfo?.memberId === 1 && (
            <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
              ⚠️ 관리자 권한으로 삭제합니다 (모든 게시글 삭제 가능)
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} disabled={deleteLoading}>
            취소
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostManagementTab;
