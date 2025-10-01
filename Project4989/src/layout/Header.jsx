import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, InputBase,
  Badge, Paper, List, ListItem, ListItemText, Popper, ClickAwayListener, ListItemButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ChatMain from '../chat/ChatMain';
import './Header.css';
import axios from 'axios';
import NotificationMain from '../chat/NotificationMain';

// --- Styled Components ---
const TossSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  backgroundColor: '#F4F1EE',
  marginLeft: 0,
  width: '100%',
  maxWidth: 360,
  border: '1px solid #E0E0E0',
  [theme.breakpoints.up('sm')]: { marginLeft: theme.spacing(2) },
}));
const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#6B7766',
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#2E3C2E',
  width: '100%',
  fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: 15,
    background: 'transparent',
    borderRadius: 12,
    '&::placeholder': { color: '#6B7766', opacity: 1 },
  },
}));
// --- Styled Components 끝 ---

export const Header = () => {
  const { userInfo, handleLogout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // 검색
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const navi = useNavigate();

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleChatClick = () => setChatDrawerOpen(true);
  const handleChatClose = () => setChatDrawerOpen(false);
  const handleNotificationClick = () => setNotificationDrawerOpen(true);
  const handleNotificationClose = () => setNotificationDrawerOpen(false);

  // 검색 입력 변화
  const handleSearchInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setSearchAnchorEl(event.currentTarget);

    if (query.trim()) {
      performSearch(query);
    } else {
      setSearchResults([]);
      setSearchAnchorEl(null);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) return;
    try {
      setSearchLoading(true);
      setSearchError(null);
      const { data } = await axios.get('http://localhost:4989/post/search-simple', {
        params: { keyword: query.trim(), page: 1, size: 5 }
      });

      // 데이터 정규화 및 디버깅
      const normalizedResults = (data.content || []).map(post => {
        console.log('원본 post 데이터:', post); // 디버깅용
        return {
          ...post,
          postId: post.postId ?? post.post_id,
          postType: post.postType ?? post.post_type,
          tradeType: post.tradeType ?? post.trade_type,
          viewCount: post.viewCount ?? post.view_count,
          createdAt: post.createdAt ?? post.created_at
        };
      });

      console.log('정규화된 검색 결과:', normalizedResults); // 디버깅용
      setSearchResults(normalizedResults);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchError(error?.response?.data?.error || '검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ✅ 검색 결과 클릭 시 ID 안전 추출
  const handleSearchResultClick = (post) => {
    const pid = post.postId ?? post.post_id ?? post.id;
    if (pid == null) {
      alert('이 게시글 ID를 찾을 수 없습니다.');
      return;
    }
    setSearchQuery("");
    setSearchResults([]);
    setSearchAnchorEl(null);
    navi(`/board/GoodsDetail?postId=${pid}`);
  };

  const handleSearchClose = () => {
    setSearchAnchorEl(null);
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchAnchorEl(null);
    setSearchError(null);
  };

  const handleLogoClick = () => {
    clearSearch();
    navi('/');
  };
  const handleSearchFocus = () => clearSearch();

  const handleUnreadCountChange = useCallback((count) => {
    setUnreadMessageCount((prev) => (prev !== count ? count : prev));
  }, []);

  // NotificationMain에서 전달받은 알림 개수를 처리하는 함수
  const handleNotificationCountChange = useCallback((count) => {
    console.log("Header: NotificationMain에서 전달받은 알림 개수:", count);
    setUnreadNotificationCount(count);
  }, []);

  const fetchUnreadNotificationCount = useCallback(async () => {
    if (userInfo && userInfo.memberId) {
      try {
        const response = await axios.get(`http://localhost:4989/api/chat-declarations/unread-count/${userInfo.memberId}`);
        setUnreadNotificationCount(response.data);
      } catch (error) {
        console.error('읽지 않은 알림 개수 조회 실패:', error);
        setUnreadNotificationCount(0);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    fetchUnreadNotificationCount();
  }, [fetchUnreadNotificationCount]);

  useEffect(() => {
    if (userInfo) {
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get('/api/chat/unread-count', {
            params: { loginId: userInfo.loginId }
          });
          setUnreadMessageCount(response.data);
        } catch {
          setUnreadMessageCount(0);
        }
      };
      fetchUnreadCount();
      const intervalId = setInterval(fetchUnreadCount, 3000);
      return () => clearInterval(intervalId);
    } else {
      setUnreadMessageCount(0);
    }
  }, [userInfo]);

  return (
    <AppBar position="static" elevation={0} sx={{
      background: '#FFFFFF',
      color: '#2E5BBA',
      height: '80px',
      width: '100%',
      fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(74, 144, 226, 0.1)'
    }}>
      <Toolbar sx={{ height: '80px', minHeight: '80px', px: { xs: 3, sm: 6 }, width: '100%' }}>
        {/* 로고 */}
        <Box
          className="header-logo-container"
          sx={{
            display: 'flex', alignItems: 'center', cursor: 'pointer', p: '8px 12px',
            borderRadius: '12px', background: 'transparent', border: 'none', transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(74, 144, 226, 0.08)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 15px rgba(74, 144, 226, 0.15)'
            }
          }}
          onClick={handleLogoClick}
        >
          <img src="/4989로고.png" alt="4989 로고" className="header-logo-img" style={{
            height: '48px', width: 'auto', marginRight: '16px', borderRadius: '8px', objectFit: 'contain'
          }} />
          <Typography variant="h6" sx={{
            fontWeight: 800, color: '#4A90E2', letterSpacing: '-0.8px', fontSize: 25, fontFamily: "'Gugi', sans-serif",
          }} style={{ fontFamily: "'Gugi', sans-serif" }}>
            중고거래 4989!
          </Typography>
        </Box>

        {/* 검색바 */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: '600px', m: '0 auto', position: 'relative' }}>
          <TossSearch>
            <SearchIconWrapper><SearchRoundedIcon /></SearchIconWrapper>
            <StyledInputBase
              placeholder="🔍 물품이나 동네를 검색하세요"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchFocus}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navi(`/board/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
          </TossSearch>

          {/* 검색 결과 드롭다운 */}
          <Popper
            open={Boolean(searchAnchorEl) && (searchResults.length > 0 || searchLoading || searchError)}
            anchorEl={searchAnchorEl}
            placement="bottom-start"
            style={{ zIndex: 1300, width: searchAnchorEl ? searchAnchorEl.offsetWidth : 'auto' }}
          >
            <ClickAwayListener onClickAway={handleSearchClose}>
              <Paper
                elevation={8}
                sx={{
                  mt: 1,
                  maxHeight: 400,
                  overflow: 'auto',
                  borderRadius: 2,
                  border: '1px solid #E0E0E0',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                {searchLoading && (
                  <Box sx={{
                    p: 3,
                    textAlign: 'center',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #E0E0E0',
                      borderTop: '2px solid #4A90E2',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    검색 중...
                  </Box>
                )}

                {searchError && (
                  <Box sx={{
                    p: 3,
                    textAlign: 'center',
                    color: '#d32f2f',
                    backgroundColor: '#ffebee',
                    borderRadius: 1,
                    mx: 1,
                    my: 1
                  }}>
                    ⚠️ {searchError}
                  </Box>
                )}

                {!searchLoading && !searchError && searchResults.length > 0 && (
                  <List sx={{ p: 0 }}>
                    {console.log('검색 결과 렌더링 중, 개수:', searchResults.length)}
                    {searchResults.map((post, idx) => {
                      const key = post.postId ?? post.post_id ?? post.id ?? idx;
                      // postType 정규화 (snake_case -> camelCase 변환)
                      const normalizedPostType = post.postType ?? post.post_type;

                      // postType에 따른 아이콘과 라벨 매핑
                      const getTypeInfo = (type) => {
                        switch (type?.toUpperCase()) {
                          case 'CARS':
                            return { icon: '🚗', label: '자동차' };
                          case 'REAL_ESTATES':
                            return { icon: '🏠', label: '부동산' };
                          case 'ITEMS':
                            return { icon: '📦', label: '중고물품' };
                          default:
                            return { icon: '📋', label: '기타' };
                        }
                      };

                      const typeInfo = getTypeInfo(normalizedPostType);

                      return (
                        <ListItem key={key} disablePadding>
                          <ListItemButton
                            onClick={() => handleSearchResultClick(post)}
                            sx={{
                              borderBottom: '1px solid #f0f0f0',
                              '&:hover': {
                                backgroundColor: '#f8f9fa',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              },
                              py: 2,
                              px: 2,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 700,
                                      color: '#2E3C2E',
                                      mb: 0.5,
                                      fontSize: '14px',
                                      lineHeight: 1.3
                                    }}
                                  >
                                    {typeInfo.icon} [{typeInfo.label}] {post.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#4A90E2',
                                      mb: 0.5,
                                      fontWeight: 600,
                                      fontSize: '13px'
                                    }}
                                  >
                                    {post.price?.toLocaleString?.() ?? post.price}원
                                  </Typography>

                                  {post.content && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#666',
                                        display: 'block',
                                        mb: 0.5,
                                        fontSize: '12px',
                                        lineHeight: 1.4
                                      }}
                                    >
                                      {post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
                                    </Typography>
                                  )}

                                  {/* 타입별 상세 정보 */}
                                  {normalizedPostType?.toUpperCase() === "CARS" && post.car && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#555',
                                        fontSize: '11px',
                                        backgroundColor: '#f8f9fa',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        display: 'inline-block'
                                      }}
                                    >
                                      🚗 {post.car.brand} {post.car.model} / {post.car.year}년식 · {post.car.mileage?.toLocaleString()}km
                                    </Typography>
                                  )}
                                  {normalizedPostType?.toUpperCase() === "REAL_ESTATES" && post.estate && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#555',
                                        fontSize: '11px',
                                        backgroundColor: '#f8f9fa',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        display: 'inline-block'
                                      }}
                                    >
                                      🏠 {post.estate.propertyType === 'apt' ? '아파트' :
                                        post.estate.propertyType === 'studio' ? '오피스텔' :
                                          post.estate.propertyType === 'oneroom' ? '원룸' :
                                            post.estate.propertyType === 'tworoom' ? '투룸' : post.estate.propertyType} · {post.estate.area}㎡
                                    </Typography>
                                  )}
                                  {normalizedPostType?.toUpperCase() === "ITEMS" && post.item && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#555',
                                        fontSize: '11px',
                                        backgroundColor: '#f8f9fa',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        display: 'inline-block'
                                      }}
                                    >
                                      📦 {post.item.categoryId === 1 ? '전자제품' :
                                        post.item.categoryId === 2 ? '의류' :
                                          post.item.categoryId === 3 ? '가구' :
                                            post.item.categoryName || `카테고리 ${post.item.categoryId}`}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}

                    {/* 디버깅용: 항상 버튼 표시 */}
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('더 많은 결과보기 클릭됨');
                          console.log('검색어:', searchQuery.trim());
                          console.log('이동할 경로:', `/board/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
                          console.log('검색 결과 개수:', searchResults.length);
                          navi(`/board/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
                          handleSearchClose();
                        }}
                        sx={{
                          backgroundColor: '#4A90E2',
                          '&:hover': {
                            backgroundColor: '#357ABD',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)'
                          },
                          py: 1.5,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          zIndex: 9999
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                textAlign: 'center',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '13px'
                              }}
                            >
                              🔍 더 많은 결과 보기 ({searchResults.length}개 이상)
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                )}

                {!searchLoading && !searchError && searchResults.length === 0 && searchQuery.trim() && (
                  <Box sx={{
                    p: 3,
                    textAlign: 'center',
                    color: '#666',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <div style={{ fontSize: '24px' }}>🔍</div>
                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                      검색 결과가 없습니다
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', fontSize: '12px' }}>
                      다른 키워드로 검색해보세요
                    </Typography>
                  </Box>
                )}
              </Paper>
            </ClickAwayListener>
          </Popper>
        </Box>

        {/* 우측 아이콘/버튼 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {userInfo ? (
            <>
              <IconButton color="inherit" onClick={handleChatClick}>
                {unreadMessageCount > 0 ? (
                  <Badge badgeContent={unreadMessageCount} color="primary" sx={{ '& .MuiBadge-badge': { background: '#4A90E2', fontSize: '10px', fontWeight: '600' } }}>
                    <ChatBubbleOutlineRoundedIcon />
                  </Badge>
                ) : (
                  <ChatBubbleOutlineRoundedIcon />
                )}
              </IconButton>

              <IconButton
                color="inherit"
                sx={{
                  p: 1.5, color: '#5B9BD5', borderRadius: '12px', m: '0 4px', transition: 'all 0.3s ease',
                  '&:hover': { backgroundColor: 'rgba(74, 144, 226, 0.1)', color: '#4A90E2', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(74, 144, 226, 0.2)' }
                }}
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={unreadNotificationCount} color="primary" sx={{ '& .MuiBadge-badge': { background: '#4A90E2', fontSize: '10px', fontWeight: '600' } }}>
                  <NotificationsNoneRoundedIcon fontSize="medium" />
                </Badge>
              </IconButton>

              <Box
                onClick={handleMenu}
                sx={{
                  display: 'flex', alignItems: 'center', cursor: 'pointer', ml: 2, p: '8px 16px',
                  borderRadius: '16px', background: 'rgba(74, 144, 226, 0.08)',
                  border: '1px solid rgba(74, 144, 226, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': { backgroundColor: 'rgba(74, 144, 226, 0.15)', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(74, 144, 226, 0.2)' },
                  fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif'
                }}
              >
                {/* ✅ 프로필 이미지 null/undefined 안전 처리 */}
                <Avatar
                  src={userInfo?.profileImageUrl ? ('http://localhost:4989' + userInfo.profileImageUrl) : 'https://placehold.co/40x40'}
                  sx={{ width: 36, height: 36, mr: 1.5, border: '2px solid rgba(74, 144, 226, 0.25)', boxShadow: '0 2px 8px rgba(74, 144, 226, 0.15)' }}
                />
                <Typography sx={{ fontWeight: 600, color: '#2E3C2E', fontSize: 14 }}> {userInfo.nickname}님 </Typography>
              </Box>

              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={() => { navi('/mypage'); handleClose(); }}>마이페이지</MenuItem>
                {userInfo.role === 'ROLE_ADMIN' && (
                  <MenuItem onClick={() => { navi('/admin'); handleClose(); }}>관리자페이지</MenuItem>
                )}
                <MenuItem onClick={() => { handleLogout(); handleClose(); }}>로그아웃</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <button
                type='button'
                className='header-login-btn'
                onClick={() => navi('/login')}
                style={{
                  background: 'transparent', border: '2px solid #4A90E2', color: '#4A90E2', padding: '12px 24px',
                  borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
                  transition: 'all 0.3s ease', marginRight: '12px', position: 'relative', overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#4A90E2';
                  e.target.style.color = '#FFFFFF';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#4A90E2';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                로그인
              </button>
              <button
                type='button'
                className='header-signup-btn'
                onClick={() => navi('/signup')}
                style={{
                  background: '#4A90E2', border: '2px solid #4A90E2', color: '#FFFFFF', padding: '12px 24px',
                  borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: 'Spoqa Han Sans Neo, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
                  transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(74, 144, 226, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#2E5BBA';
                  e.target.style.borderColor = '#2E5BBA';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#4A90E2';
                  e.target.style.borderColor = '#4A90E2';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(74, 144, 226, 0.2)';
                }}
              >
                회원가입
              </button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* 채팅 드로어 */}
      <ChatMain open={chatDrawerOpen} onClose={handleChatClose} onUnreadCountChange={handleUnreadCountChange} />
      <NotificationMain open={notificationDrawerOpen} onClose={handleNotificationClose} onUnreadCountChange={handleNotificationCountChange} />
    </AppBar>
  );
};

export default Header;
