import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Alert, Box,
  Modal, IconButton, TextField, Pagination, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { chatDeclarationAPI } from '../../lib/api';
import DetailChat from '../../chat/detailChat.jsx';

const ChatReportManagementTab = () => {
  const [chatDeclarations, setChatDeclarations] = useState([]);
  const [userInfoMap, setUserInfoMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('>>> [DEBUG] ChatReportManagementTab 컴포넌트 렌더링 시작');
  console.log('>>> [DEBUG] 상태 초기화 완료 - loading:', loading, 'userInfoMap:', userInfoMap);

  // 모달 상태
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [chatRoomModalOpen, setChatRoomModalOpen] = useState(false);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedDeclarationId, setSelectedDeclarationId] = useState(null);
  const [actionReason, setActionReason] = useState('');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchChatDeclarations();
  }, []);

  // pageSize가 변경될 때 totalPages 재계산
  useEffect(() => {
    setTotalPages(Math.ceil(totalCount / pageSize));
  }, [pageSize, totalCount]);

  const fetchChatDeclarations = async () => {
    try {
      console.log('>>> [DEBUG] fetchChatDeclarations 함수 시작');
      setError(null);
      setLoading(true);
      console.log('>>> [DEBUG] fetchChatDeclarations 시작');
      const response = await chatDeclarationAPI.getAllChatDeclarations();
      console.log('받은 데이터:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const validDeclarations = response.data.filter(item => item !== null);
        console.log('유효한 데이터:', validDeclarations);

        // status 필드 디버깅
        validDeclarations.forEach((item, index) => {
          console.log(`데이터[${index}] status:`, item.status, 'result:', item.result);
        });

        setChatDeclarations(validDeclarations);

        // 페이지네이션 정보 설정
        setTotalCount(validDeclarations.length);
        setTotalPages(Math.ceil(validDeclarations.length / pageSize));

        // 고유한 사용자 ID들 추출
        const userIds = [...new Set([
          ...validDeclarations.map(d => d.declarationMemberId),
          ...validDeclarations.map(d => d.declarationOppositeMemberId)
        ])].filter(id => id && !userInfoMap[id]);

        console.log('>>> [DEBUG] 조회할 사용자 ID들:', userIds);

        // 사용자 정보 조회
        if (userIds.length > 0) {
          await fetchUserInfo(userIds);
        }
      } else {
        console.error('API 응답이 배열이 아닙니다:', response.data);
        setError('데이터 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('채팅 신고 목록 조회 실패:', error);
      setError('채팅 신고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (memberIds) => {
    console.log('>>> [DEBUG] fetchUserInfo 호출됨, memberIds:', memberIds);
    try {
      const userPromises = memberIds.map(async (memberId) => {
        try {
          const token = localStorage.getItem('jwtToken') || localStorage.getItem('accessToken');
          const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4989'}/api/users/${memberId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            console.log('>>> [DEBUG] 사용자 정보 매핑:', memberId, '->', userData.nickname);
            return {
              [memberId]: {
                nickname: userData.nickname,
                memberId: userData.memberId
              }
            };
          } else {
            console.error(`사용자 ${memberId} 정보 조회 실패:`, response.status);
            return {
              [memberId]: {
                nickname: `사용자${memberId}`,
                memberId: memberId
              }
            };
          }
        } catch (error) {
          console.error(`사용자 ${memberId} 정보 조회 중 오류:`, error);
          return {
            [memberId]: {
              nickname: `사용자${memberId}`,
              memberId: memberId
            }
          };
        }
      });

      const userInfoArray = await Promise.all(userPromises);
      const newUserInfoMap = userInfoArray.reduce((acc, userInfo) => ({
        ...acc,
        ...userInfo
      }), {});

      console.log('>>> [DEBUG] 최종 userInfoMap:', newUserInfoMap);
      setUserInfoMap(prev => ({
        ...prev,
        ...newUserInfoMap
      }));
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  const getUserDisplayName = (memberId, userInfoMap) => {
    console.log('>>> [DEBUG] getUserDisplayName 호출됨: memberId=' + memberId + ', userInfoMap=', userInfoMap);
    const userInfo = userInfoMap[memberId];
    if (userInfo && userInfo.nickname) {
      return userInfo.nickname;
    }
    return `사용자${memberId}`;
  };

  const handleContentClick = (declaration) => {
    setSelectedContent(declaration);
    setContentModalOpen(true);
  };



  const handleInvestigateClick = (chatRoomId) => {
    setSelectedChatRoomId(chatRoomId);
    setChatRoomModalOpen(true);
  };

  const handleActionClick = (declarationId) => {
    setSelectedDeclarationId(declarationId);
    setActionModalOpen(true);
    setActionReason('');
  };

  const handleSanction = async () => {
    try {
      console.log('>>> [DEBUG] 제재 처리 시작');
      console.log('>>> [DEBUG] selectedDeclarationId:', selectedDeclarationId);
      console.log('>>> [DEBUG] actionReason:', actionReason);

      if (!actionReason.trim()) {
        alert('제재 사유를 입력해주세요.');
        return;
      }

      const token = localStorage.getItem('jwtToken') || localStorage.getItem('accessToken');
      console.log('>>> [DEBUG] JWT 토큰:', token);

      const requestBody = {
        reason: actionReason,
        actionType: 'SANCTION'
      };
      console.log('>>> [DEBUG] 요청 본문:', requestBody);

      const requestUrl = `${import.meta.env.VITE_API_BASE || 'http://localhost:4989'}/api/chat-declarations/${selectedDeclarationId}/action`;
      console.log('>>> [DEBUG] 요청 URL:', requestUrl);

      console.log('>>> [DEBUG] fetch 요청 시작');
      const response = await fetch(requestUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('>>> [DEBUG] fetch 응답 받음:', response);
      console.log('>>> [DEBUG] 응답 상태:', response.status);
      console.log('>>> [DEBUG] 응답 상태 텍스트:', response.statusText);

      if (response.ok) {
        const responseText = await response.text();
        console.log('>>> [DEBUG] 성공 응답 내용:', responseText);
        alert('제재 처리가 완료되었습니다.');
        setActionModalOpen(false);
        fetchChatDeclarations();
        // 페이지를 1로 리셋
        setCurrentPage(1);
      } else {
        const errorText = await response.text();
        console.error('>>> [ERROR] 실패 응답:', response.status, errorText);
        alert('제재 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('>>> [ERROR] 제재 처리 중 오류:', error);
      alert('제재 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCompanion = async () => {
    try {
      console.log('>>> [DEBUG] 반려 처리 시작');

      if (!actionReason.trim()) {
        alert('반려 사유를 입력해주세요.');
        return;
      }

      const token = localStorage.getItem('jwtToken') || localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4989'}/api/chat-declarations/${selectedDeclarationId}/action`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: actionReason,
          actionType: 'COMPANION'
        })
      });

      if (response.ok) {
        alert('반려 처리가 완료되었습니다.');
        setActionModalOpen(false);
        fetchChatDeclarations();
        // 페이지를 1로 리셋
        setCurrentPage(1);
      } else {
        alert('반려 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('반려 처리 중 오류:', error);
      alert('반려 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCloseChatRoomModal = () => {
    setChatRoomModalOpen(false);
    setSelectedChatRoomId(null);
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETE') {
      return 'success'; // 초록색 (처리됨)
    }
    return 'warning'; // 주황색 (접수됨)
  };

  const getDeclarationTypeColor = (type) => {
    switch (type) {
      case '욕설':
        return 'error'; // 빨간색
      case '스팸':
        return 'warning'; // 주황색
      case '부적절한 내용':
        return 'info'; // 파란색
      case '괴롭힘':
        return 'secondary'; // 보라색
      case '기타':
        return 'success'; // 초록색 (기존 회색에서 변경)
      default:
        return 'primary'; // 기본 파란색
    }
  };

  const getStatusText = (status) => {
    if (status === 'COMPLETE') {
      return '처리됨';
    }
    return '접수됨';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const safeGetValue = (obj, key, defaultValue = '') => {
    return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultValue;
  };

  // 페이지네이션 관련 함수들
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    const newSize = event.target.value;
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // 현재 페이지의 데이터 계산
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = chatDeclarations.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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

  if (Object.keys(userInfoMap).length === 0 && chatDeclarations.length > 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          사용자 정보를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (chatDeclarations.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            채팅 신고 관리
          </Typography>
          <Alert severity="info">
            등록된 채팅 신고가 없습니다.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            채팅 신고 관리
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="textSecondary">
              총 {chatDeclarations.length}건의 신고
            </Typography>

          </Box>

          {/* 페이지 크기 선택 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>페이지 크기</InputLabel>
              <Select
                value={pageSize}
                label="페이지 크기"
                onChange={handlePageSizeChange}
              >
                <MenuItem value={5}>5개</MenuItem>
                <MenuItem value={10}>10개</MenuItem>
                <MenuItem value={20}>20개</MenuItem>
                <MenuItem value={50}>50개</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>신고 ID</TableCell>
                  <TableCell>채팅방 ID</TableCell>
                  <TableCell>신고자</TableCell>
                  <TableCell>신고대상</TableCell>
                  <TableCell>신고 유형</TableCell>
                  <TableCell>신고 시간</TableCell>
                  <TableCell>처리 상태</TableCell>
                  <TableCell>조치</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((declaration) => (
                  <TableRow key={declaration.declarationId}>
                    <TableCell>{declaration.declarationId}</TableCell>
                    <TableCell>{declaration.declarationChatRoomId}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={() => handleContentClick(declaration)}
                      >
                        {getUserDisplayName(declaration.declarationMemberId, userInfoMap)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={() => handleContentClick(declaration)}
                      >
                        {getUserDisplayName(declaration.declarationOppositeMemberId, userInfoMap)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={declaration.declarationType}
                        color={getDeclarationTypeColor(declaration.declarationType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(declaration.declarationTime)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(declaration.status)}
                        color={getStatusColor(declaration.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleInvestigateClick(declaration.declarationChatRoomId)}
                        >
                          조사
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleActionClick(declaration.declarationId)}
                        >
                          조치
                        </Button>
                      </Box>
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
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* 페이지 정보 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              총 {totalCount}개 중 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)}개 표시
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 신고 내용 상세 모달 */}
      <Modal
        open={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        aria-labelledby="content-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            border: '2px solid #1976d2',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            p: 4,
            borderRadius: 3,
            overflow: 'auto'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} pb={2} borderBottom={2} borderColor="primary.main">
            <Typography id="content-modal-title" variant="h5" component="h2" color="primary" fontWeight="bold">
              📋 신고 상세 정보
            </Typography>
            <IconButton
              onClick={() => setContentModalOpen(false)}
              sx={{
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
              🚨 신고 내용
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #e9ecef',
                minHeight: '100px'
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedContent?.declarationContent || '신고 내용이 없습니다.'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                📅 신고 시간
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {formatDate(selectedContent?.declarationTime) || '-'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                🏷️ 신고 유형
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {selectedContent?.declarationType || '-'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* DetailChat 컴포넌트 직접 렌더링 */}
      {selectedChatRoomId && (
        <DetailChat
          chatRoom={{ chatRoomId: selectedChatRoomId, isAdminInvestigation: true }}
          open={chatRoomModalOpen}
          onClose={handleCloseChatRoomModal}
        />
      )}

      {/* 조치 모달 */}
      <Modal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        aria-labelledby="action-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            maxHeight: '85vh',
            bgcolor: 'background.paper',
            border: '2px solid #d32f2f',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            p: 4,
            borderRadius: 3,
            overflow: 'auto'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} pb={2} borderBottom={2} borderColor="error.main">
            <Typography id="action-modal-title" variant="h5" component="h2" color="error" fontWeight="bold">
              ⚖️ 신고 조치 처리
            </Typography>
            <IconButton
              onClick={() => setActionModalOpen(false)}
              sx={{
                color: 'error.main',
                '&:hover': { backgroundColor: 'error.light', color: 'white' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* 신고 데이터 정보 섹션 */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffb74d' }}>
            <Typography variant="h6" color="warning.dark" gutterBottom fontWeight="bold">
              📊 신고 정보 요약
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  🆔 신고 ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  #{selectedDeclarationId}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  🏷️ 신고 유형
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {chatDeclarations.find(d => d.declarationId === selectedDeclarationId)?.declarationType || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  📅 신고 시간
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {formatDate(chatDeclarations.find(d => d.declarationId === selectedDeclarationId)?.declarationTime) || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  💬 채팅방 ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  #{chatDeclarations.find(d => d.declarationId === selectedDeclarationId)?.declarationChatRoomId || '-'}
                </Typography>
              </Box>
            </Box>


          </Box>

          {/* 조치 사유 입력 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="error" gutterBottom fontWeight="bold">
              ✍️ 조치 사유 입력
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="조치 사유를 상세히 입력해주세요"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="예시: 사용자가 부적절한 언어를 사용하여 다른 사용자에게 불쾌감을 주었습니다. 커뮤니티 가이드라인 위반으로 인한 제재를 적용합니다."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: 'error.main' },
                  '&.Mui-focused fieldset': { borderColor: 'error.main' }
                }
              }}
            />
          </Box>

          {/* 조치 버튼들 */}
          <Box display="flex" justifyContent="flex-end" gap={2} pt={2} borderTop={1} borderColor="divider">
            <Button
              variant="contained"
              color="error"
              onClick={handleSanction}
              disabled={!actionReason.trim()}
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: 3 }
              }}
            >
              🚫 제재 처리
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleCompanion}
              disabled={!actionReason.trim()}
              sx={{
                px: 3,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': { transform: 'translateY(-1px)', boxShadow: 3 }
              }}
            >
              ❌ 반려 처리
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActionModalOpen(false)}
              sx={{
                px: 3,
                py: 1.5,
                '&:hover': { backgroundColor: 'grey.100' }
              }}
            >
              취소
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ChatReportManagementTab;